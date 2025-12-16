import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from '../entities/reservations.entity';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import { Session, SessionStatus } from 'src/session/entities/session.entity';
import { User } from 'src/users/entities/users.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  // create a new reservation and handle all validations and emails
  async create(dto: CreateReservationDto): Promise<Reservation> {
    // validate sessions and calculate total price
    const sessionIds = dto.sessions.map((id) => new Types.ObjectId(id));
    const sessions = await this.sessionModel.find({ _id: { $in: sessionIds } });

    if (!sessions || sessions.length === 0) {
      throw new NotFoundException('no valid sessions found');
    }

    // check if any selected session is already booked
    const alreadyBooked = sessions.filter(
      (s) => s.status === SessionStatus.BOOKED,
    );
    if (alreadyBooked.length > 0) {
      throw new BadRequestException(
        'one or more selected sessions are already booked',
      );
    }

    // compute total price of all selected sessions
    const totalPrice = sessions.reduce((sum, s) => sum + s.price, 0);

    // collect invited player emails and map them to existing users if found
    const playerIds: (Types.ObjectId | string)[] = [];
    const emails = (dto as any).emails ?? [];
    const invitedPlayers: { email: string; user?: User }[] = [];

    if (emails.length > 0) {
      for (const email of emails) {
        if (!email || !email.includes('@')) continue;

        const existingUser = await this.userModel.findOne({ email });

        // if user exists, link his id, otherwise just store his email string
        if (existingUser) {
          playerIds.push(existingUser._id);
          invitedPlayers.push({ email, user: existingUser });
        } else {
          playerIds.push(email);
          invitedPlayers.push({ email });
        }
      }
    }

    // merge player ids if any were already sent in dto.players
    if (dto.players && dto.players.length > 0) {
      for (const p of dto.players) {
        if (Types.ObjectId.isValid(p)) {
          const playerId = new Types.ObjectId(p);
          playerIds.push(playerId);

          // add user to invited list if not already included
          const exists = invitedPlayers.find((u) => u.user?._id.equals(playerId));
          if (!exists) {
            const user = await this.userModel.findById(playerId);
            if (user) invitedPlayers.push({ email: user.email, user });
          }
        }
      }
    }

    // generate unique booking reference
    const bookingReference = `GT-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;

    // create the reservation document
    const newReservation = new this.reservationModel({
      ...dto,
      players: playerIds,
      totalPrice,
      status: 'pending',
      bookingReference,
    });

    await newReservation.save();

    // mark sessions as booked after reservation is created
    await this.sessionModel.updateMany(
      { _id: { $in: sessionIds } },
      { $set: { status: SessionStatus.BOOKED } },
    );

    // populate related data for email notifications
    await newReservation.populate('organizer', 'username email');
    await newReservation.populate('stadium', 'name location');

    const organizer = newReservation.organizer as any;
    const stadium = newReservation.stadium as any;

    // prepare readable date and time for emails
    const firstSession = sessions[0];
    const lastSession = sessions[sessions.length - 1];
    const dateStr = new Date(firstSession.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = `${firstSession.startTime} - ${lastSession.endTime}`;

    try {
      // send confirmation email to the organizer
      await this.emailService.sendReservationCreatedEmail({
        organizerName: organizer.username,
        organizerEmail: organizer.email,
        bookingReference,
        stadiumName: stadium.name,
        stadiumLocation: stadium.location,
        date: dateStr,
        time: timeStr,
        totalPrice,
        numberOfPlayers: invitedPlayers.length,
        isSplitPayment: dto.isSplitPayment || false,
        sessions: sessions.map((s) => ({
          date: new Date(s.date).toLocaleDateString('en-US'),
          startTime: s.startTime,
          endTime: s.endTime,
          price: s.price,
        })),
      });

      // send invitation emails to each invited player
      for (const player of invitedPlayers) {
        const playerName = player.user?.username || player.email.split('@')[0];

        if (dto.isSplitPayment) {
          const shareAmount = totalPrice / (invitedPlayers.length + 1);

          await this.emailService.sendInvitationWithPaymentEmail({
            playerName,
            playerEmail: player.email,
            organizerName: organizer.username,
            bookingReference,
            stadiumName: stadium.name,
            stadiumLocation: stadium.location,
            date: dateStr,
            time: timeStr,
            totalPrice,
            shareAmount,
            isSplitPayment: true,
            paymentUrl: `${process.env.FRONTEND_URL}/payment/${bookingReference}`,
          });
        } else {
          await this.emailService.sendInvitationFreeEmail({
            playerName,
            playerEmail: player.email,
            organizerName: organizer.username,
            bookingReference,
            stadiumName: stadium.name,
            stadiumLocation: stadium.location,
            date: dateStr,
            time: timeStr,
            totalPrice,
            isSplitPayment: false,
          });
        }
      }

      console.log('all reservation emails sent successfully');
    } catch (emailError) {
      console.error('error sending emails:', emailError);
      // do not block reservation if emails fail
    }

    return newReservation;
  }

  // get all reservations (for admin or dashboard)
  async findAll(): Promise<Reservation[]> {
    return this.reservationModel
      .find()
      .populate('organizer', 'username email avatar')
      .populate('stadium', 'name location')
      .populate('sessions', 'date startTime endTime price')
      .populate('players', 'username email avatar')
      .exec();
  }

  // get all reservations made by a specific user
  async findByUser(userId: string): Promise<Reservation[]> {
    return this.reservationModel
      .find({
        $or: [
          { organizer: new Types.ObjectId(userId) },
          { players: { $in: [new Types.ObjectId(userId)] } },
        ],
      })
      .populate('organizer', 'username email avatar')
      .populate('stadium', 'name location images')
      .populate('sessions', 'date startTime endTime price')
      .populate('players', 'username email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  // find a reservation by its id
  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('organizer', 'username email avatar')
      .populate('stadium', 'name location')
      .populate('sessions', 'date startTime endTime price')
      .populate('players', 'username email avatar')
      .exec();

    if (!reservation) throw new NotFoundException('reservation not found');
    return reservation;
  }

  // update a reservation by id
  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const updated = await this.reservationModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('reservation not found');
    return updated;
  }

  // update reservation status only
  async updateStatus(id: string, status: string): Promise<Reservation> {
    const updated = await this.reservationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updated) throw new NotFoundException('reservation not found');
    return updated;
  }

  // delete a reservation permanently
  async remove(id: string): Promise<void> {
    const deleted = await this.reservationModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('reservation not found');
  }
}
