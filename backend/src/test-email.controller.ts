import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Controller('test-email')
export class TestEmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async testEmail() {
    try {
      await this.emailService.sendReservationCreatedEmail({
        organizerName: 'Test User',
        organizerEmail: 'salaheddin.bnh@gmail.com',
        bookingReference: 'TEST-123',
        stadiumName: 'Test Stadium',
        stadiumLocation: 'Test Location',
        date: 'Today',
        time: '18:00 - 20:00',
        totalPrice: 100,
        numberOfPlayers: 2,
        isSplitPayment: false,
        sessions: [{ date: 'Today', startTime: '18:00', endTime: '20:00', price: 100 }]
      });
      return { success: true, message: 'Email sent!' };
    } catch (error) {
      return { success: false, error: error.message, stack: error.stack };
    }
  }
}
