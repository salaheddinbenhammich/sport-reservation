import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from 'src/reservations/entities/reservations.entity';
import { User } from 'src/users/entities/users.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class PaymentsService {
  // stripe instance for payment processing
  private stripe: Stripe;

  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly emailService: EmailService, // email service for notifications
  ) {
    // initialize stripe client using secret key from env
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  /**
   * createPaymentIntent()
   * -----------------------
   * called when a user initiates payment for a reservation
   * - if isSplitPayment = false ==> organizer pays full amount
   * - if isSplitPayment = true ==> share cost among all participants
   * handles both registered users and invited users (via email)
   */
  async createPaymentIntent(reservationId: string) {
    // find reservation with linked entities
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate('organizer')
      .populate('players');

    if (!reservation) throw new NotFoundException('Reservation not found');

    // ensure total price is valid
    const totalPrice = reservation.totalPrice;
    if (!totalPrice || totalPrice <= 0) {
      throw new BadRequestException('Invalid total price.');
    }

    // CASE 1 — full payment (organizer pays everything)
    if (!reservation.isSplitPayment) {
      const amount = Math.round(totalPrice * 100); // stripe expects cents
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        metadata: {
          reservationId,
          payer: (reservation.organizer as any)._id.toString(),
          type: 'full',
        },
        automatic_payment_methods: { enabled: true },
      });

      return {
        type: 'full',
        amount: totalPrice,
        payer: (reservation.organizer as any).username,
        clientSecret: paymentIntent.client_secret,
      };
    }

    //CASE 2 — split payment (each player + organizer pays a share)

    // total participants = 1 organizer + all invited players (registered or not bcz we allow inviting non registred users for better use)
    const participantsCount = 1 + reservation.players.length;

    // each person’s share (in cents for stripe)
    const share = Math.round((totalPrice / participantsCount) * 100);

    // object to store all stripe intents by username
    const intents: Record<string, any> = {};

    // create payment intent for the organizer
    const organizer = reservation.organizer as any;
    const orgIntent = await this.stripe.paymentIntents.create({
      amount: share,
      currency: 'eur',
      metadata: {
        reservationId,
        payer: organizer._id.toString(),
        type: 'split',
      },
      automatic_payment_methods: { enabled: true },
    });

    intents[organizer.username] = {
      username: organizer.username,
      email: organizer.email,
      amount: share / 100,
      clientSecret: orgIntent.client_secret,
    };

    // create payment intents for already registered invited users
    for (const p of reservation.players) {
      // skip players that are just email strings (they are not registred yet)
      if (typeof p === 'string') continue;
      if (!p || !p._id) continue;

      const user = await this.userModel.findById(p._id);
      if (!user) continue;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: share,
        currency: 'eur',
        metadata: {
          reservationId,
          payer: user._id.toString(),
          type: 'split',
        },
        automatic_payment_methods: { enabled: true },
      });

      intents[user.username] = {
        username: user.username,
        email: user.email,
        amount: share / 100,
        clientSecret: paymentIntent.client_secret,
      };
    }

    // return structured info to frontend
    return {
      type: 'split',
      perPersonAmount: share / 100,
      totalParticipants: participantsCount,
      totalAmount: totalPrice,
      intents,
    };
  }

  /**
   * confirmPayment()
   * -----------------------
   * when stripe confirms a payment success :
   * - updates reservation status
   * - saves payer in paidParticipants
   * - sends email notifications to payer and others
   */
  async confirmPayment(reservationId: string, payerId?: string) {
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate('organizer')
      .populate('players')
      .populate('stadium')
      .populate('sessions');

    if (!reservation) throw new NotFoundException('Reservation not found');

    // mark payer as paid
    if (payerId) {
      const payerObjectId = new Types.ObjectId(payerId);
      if (!reservation.paidParticipants.some((id) => id.equals(payerObjectId))) {
        reservation.paidParticipants.push(payerObjectId);
      }
    }

    // collect valid participant ids (organizer + only registered players)
    const allParticipants = [
      reservation.organizer._id,
      ...reservation.players
        .filter((p: any) => typeof p === 'object' && p._id)
        .map((p: any) => p._id),
    ];

    // check if everyone paid
    const everyonePaid = allParticipants.every((id) =>
      reservation.paidParticipants.some((pid) => pid.equals(id)),
    );

    // update reservation status
    reservation.status = everyonePaid ? 'confirmed' : 'pending';
    await reservation.save();

    /**
     * email notifications
     * ----------------------------
     * send confirmation email to payer
     * if all paid ==> notify everyone
     */
    const payer = await this.userModel.findById(payerId);
    const stadium = reservation.stadium as any;
    const sessions = reservation.sessions as any[];

    // format date & time for emails
    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];
    const dateStr = new Date(firstSession.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = `${firstSession.startTime} - ${lastSession.endTime}`;

    // calculate amount paid (share or total)
    const amountPaid = reservation.isSplitPayment
      ? reservation.totalPrice / (1 + reservation.players.length)
      : reservation.totalPrice;

    try {
      // 1. send confirmation to payer
      if (payer) {
        const pendingCount =
          allParticipants.length - reservation.paidParticipants.length;

        await this.emailService.sendPaymentConfirmationEmail({
          username: payer.username,
          email: payer.email,
          bookingReference: reservation.bookingReference,
          stadiumName: stadium.name,
          date: dateStr,
          time: timeStr,
          amountPaid,
          isFullyConfirmed: everyonePaid,
          pendingParticipants: pendingCount,
        });
      }

      // 2. if all have paid ==> notify all participants
      if (everyonePaid) {
        const allUsers = [
          reservation.organizer as any,
          ...reservation.players.filter((p: any) => typeof p === 'object' && p.email),
        ];

        for (const user of allUsers) {
          await this.emailService.sendReservationConfirmedEmail(user.email, {
            username: user.username,
            bookingReference: reservation.bookingReference,
            stadiumName: stadium.name,
            date: dateStr,
            time: timeStr,
            totalPrice: reservation.totalPrice,
          });
        }
      }

      console.log('✅ payment confirmation emails sent successfully');
    } catch (emailError) {
      console.error('❌ error sending payment emails:', emailError);
      // note: email failure should not block payment success
    }

    // final response to frontend
    return {
      success: everyonePaid,
      message: everyonePaid
        ? 'all participants successfully paid their share. reservation confirmed.'
        : 'payment recorded, waiting for other participants.',
      reservationId: reservation._id,
    };
  }

  /**
   * checkSplitCompletion()
   * -----------------------
   * i added this helper to verify if all payments are completed
   * returns true if reservation is confirmed
   */
  async checkSplitCompletion(reservationId: string): Promise<boolean> {
    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) throw new NotFoundException('Reservation not found');
    return reservation.status === 'confirmed';
  }
}
