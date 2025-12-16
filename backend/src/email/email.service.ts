import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  ReservationCreatedEmailDto,
  InvitationEmailDto,
  PaymentConfirmationEmailDto,
} from './interfaces/email-options.interface';
import {
  getReservationCreatedTemplate,
  getInvitationFreeTemplate,
  getInvitationPaymentTemplate,
  getPaymentConfirmedTemplate,
} from './templates';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"GoalTime ⚽" <${this.configService.get<string>('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  //Send email to organizer when reservation is created
  async sendReservationCreatedEmail(
    dto: ReservationCreatedEmailDto,
  ): Promise<void> {
    try {
      const htmlContent = getReservationCreatedTemplate(dto);
      await this.sendMail(
        dto.organizerEmail,
        `✅ Reservation Created - ${dto.bookingReference}`,
        htmlContent,
      );
      this.logger.log(
        `Reservation created email sent to ${dto.organizerEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to send reservation created email', error);
      throw error;
    }
  }

  //Send invitation email to players (case : organizer paid all)
  async sendInvitationFreeEmail(dto: InvitationEmailDto): Promise<void> {
    try {
      const htmlContent = getInvitationFreeTemplate(dto);
      await this.sendMail(
        dto.playerEmail,
        `⚽ You're Invited to Play Football - ${dto.bookingReference}`,
        htmlContent,
      );
      this.logger.log(`Invitation email sent to ${dto.playerEmail}`);
    } catch (error) {
      this.logger.error('Failed to send invitation email', error);
      throw error;
    }
  }

  // send invitation email to players (they need to pay their share)
  async sendInvitationWithPaymentEmail(dto: InvitationEmailDto): Promise<void> {
    try {
      const htmlContent = getInvitationPaymentTemplate(dto);
      await this.sendMail(
        dto.playerEmail,
        `⚽ You're Invited! Complete Payment to Confirm - ${dto.bookingReference}`,
        htmlContent,
      );
      this.logger.log(
        `Invitation with payment email sent to ${dto.playerEmail}`,
      );
    } catch (error) {
      this.logger.error('Failed to send invitation with payment email', error);
      throw error;
    }
  }

  //Send payment confirmation email
  async sendPaymentConfirmationEmail(
    dto: PaymentConfirmationEmailDto,
  ): Promise<void> {
    try {
      const htmlContent = getPaymentConfirmedTemplate(dto);
      await this.sendMail(
        dto.email,
        `✅ Payment Confirmed - ${dto.bookingReference}`,
        htmlContent,
      );
      this.logger.log(`Payment confirmation email sent to ${dto.email}`);
    } catch (error) {
      this.logger.error('Failed to send payment confirmation email', error);
      throw error;
    }
  }

  //Send email to all participants when reservation is fully confirmed
  async sendReservationConfirmedEmail(
    email: string,
    data: {
      username: string;
      bookingReference: string;
      stadiumName: string;
      date: string;
      time: string;
      totalPrice: number;
    },
  ): Promise<void> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding: 20px 0;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" width="100%" cellspacing="0" cellpadding="0" border="0">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Reservation Confirmed!</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                        Hi <strong>${data.username}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                        Great news! Your football reservation is now <strong style="color: #10b981;">fully confirmed</strong>. All participants have completed their payments. Get ready to play! ⚽
                      </p>

                      <!-- Reservation Details Box -->
                      <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <h2 style="margin: 0 0 20px; font-size: 18px; color: #667eea;">📋 Reservation Details</h2>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0">
                              <tr>
                                <td style="font-weight: bold; color: #666666; padding: 8px 0;">Booking Reference:</td>
                                <td style="color: #333333; text-align: right; font-weight: bold; padding: 8px 0;">${data.bookingReference}</td>
                              </tr>
                              <tr>
                                <td style="font-weight: bold; color: #666666; padding: 8px 0;">Stadium:</td>
                                <td style="color: #333333; text-align: right; padding: 8px 0;">${data.stadiumName}</td>
                              </tr>
                              <tr>
                                <td style="font-weight: bold; color: #666666; padding: 8px 0;">Date:</td>
                                <td style="color: #333333; text-align: right; padding: 8px 0;">${data.date}</td>
                              </tr>
                              <tr>
                                <td style="font-weight: bold; color: #666666; padding: 8px 0;">Time:</td>
                                <td style="color: #333333; text-align: right; padding: 8px 0;">${data.time}</td>
                              </tr>
                              <tr>
                                <td style="font-weight: bold; color: #666666; padding: 8px 0; border-top: 2px solid #e5e7eb;">Total Paid:</td>
                                <td style="color: #10b981; text-align: right; font-size: 18px; font-weight: bold; padding: 8px 0; border-top: 2px solid #e5e7eb;">€${data.totalPrice.toFixed(2)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #666666;">
                        Please arrive 10-15 minutes before your scheduled time. Don't forget to bring your sports gear!
                      </p>

                      <!-- Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="text-align: center; padding-top: 20px;">
                            <a href="${this.configService.get<string>(
                              'FRONTEND_URL',
                            )}/reservations" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View My Reservations</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                        Need help? Contact us at <a href="mailto:support@goaltime.com" style="color: #667eea; text-decoration: none;">support@goaltime.com</a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        © 2025 GoalTime. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await this.sendMail(
        email,
        `🎉 Reservation Confirmed - ${data.bookingReference}`,
        htmlContent,
      );
      this.logger.log(`Reservation confirmed email sent to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send reservation confirmed email', error);
      throw error;
    }
  }
}
