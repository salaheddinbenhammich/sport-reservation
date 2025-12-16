import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create payment intent(s) for a reservation :
   * - If reservation.isSplitPayment = false => one intent for organizer
   * - If reservation.isSplitPayment = true  => one intent per participant
   */
  @Post('create-intent/:reservationId')
  async createIntent(
    @Param('reservationId') reservationId: string,
    @Req() req: Request,
  ) {
    if (!reservationId)
      throw new BadRequestException('Reservation ID is required.');

    const user = (req as any).user; // from JWT
    const result = await this.paymentsService.createPaymentIntent(reservationId);

    return {
      message: result.type === 'split'
        ? 'Split payment intents created for all participants.'
        : `Payment intent created for organizer ${user?.username}.`,
      ...result,
    };
  }

  /**
   * confirm a reservation payment :
   * - Once Stripe confirms a payment, frontend calls this route
   * - Updates reservation status ==> confirmed
   */
  @Post('confirm/:reservationId')
  async confirmPayment(
    @Param('reservationId') reservationId: string,
    @Req() req: Request,
  ) {
    if (!reservationId)
      throw new BadRequestException('Reservation ID is required.');

    const user = (req as any).user; // from JWT

    const result = await this.paymentsService.confirmPayment(
      reservationId,
      user?._id,
    );

    return {
      message: result.message,
      success: result.success,
      reservationId: result.reservationId,
    };
  }


  /**
   * this is to check if all participants have completed payment
   */
  @Get('status/:reservationId')
  async checkStatus(@Param('reservationId') reservationId: string) {
    if (!reservationId)
      throw new BadRequestException('Reservation ID is required.');

    const isComplete = await this.paymentsService.checkSplitCompletion(reservationId);
    return {
      reservationId,
      status: isComplete ? 'confirmed' : 'pending',
      message: isComplete
        ? 'All payments completed successfully.'
        : 'Waiting for one or more players to pay.',
    };
  }
}
