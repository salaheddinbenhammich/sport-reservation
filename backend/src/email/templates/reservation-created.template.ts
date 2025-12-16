import { ReservationCreatedEmailDto } from '../interfaces/email-options.interface';

export function getReservationCreatedTemplate(
  dto: ReservationCreatedEmailDto,
): string {
  const sessionsHtml = dto.sessions
    .map(
      (session) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${session.date}</strong><br>
          <span style="color: #666666;">${session.startTime} - ${session.endTime}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #10b981; font-weight: bold;">
          €${session.price.toFixed(2)}
        </td>
      </tr>
    `,
    )
    .join('');

  return `
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
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⚽ Reservation Created!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Hi <strong>${dto.organizerName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Great news! Your football stadium reservation has been successfully created. Here are your booking details:
                  </p>

                  <!-- Booking Reference Box -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">${dto.bookingReference}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Reservation Details -->
                  <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #667eea;">📍 Stadium Information</h2>
                        <p style="margin: 0 0 10px; font-size: 16px; color: #333333;"><strong>${dto.stadiumName}</strong></p>
                        <p style="margin: 0 0 20px; font-size: 14px; color: #666666;">📍 ${dto.stadiumLocation}</p>
                        
                        <h2 style="margin: 20px 0; font-size: 18px; color: #667eea;">📅 Schedule</h2>
                        <p style="margin: 0 0 5px; font-size: 16px; color: #333333;"><strong>Date:</strong> ${dto.date}</p>
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333;"><strong>Time:</strong> ${dto.time}</p>

                        <h2 style="margin: 20px 0; font-size: 18px; color: #667eea;">👥 Players</h2>
                        <p style="margin: 0; font-size: 16px; color: #333333;"><strong>${dto.numberOfPlayers}</strong> player(s) invited</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Sessions Breakdown -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td colspan="2" style="padding: 0 0 15px 0;">
                        <h2 style="margin: 0; font-size: 18px; color: #667eea;">💰 Sessions & Pricing</h2>
                      </td>
                    </tr>
                    ${sessionsHtml}
                    <tr>
                      <td style="padding: 15px 10px 10px 10px; font-weight: bold; font-size: 18px; color: #333333;">Total Amount</td>
                      <td style="padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">€${dto.totalPrice.toFixed(2)}</td>
                    </tr>
                  </table>

                  <!-- Payment Info -->
                  <table role="presentation" style="width: 100%; background-color: ${dto.isSplitPayment ? '#fef3c7' : '#d1fae5'}; border-left: 4px solid ${dto.isSplitPayment ? '#f59e0b' : '#10b981'}; border-radius: 6px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #333333;">
                          ${dto.isSplitPayment ? '💳 Split Payment' : '✅ Full Payment'}
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #666666;">
                          ${dto.isSplitPayment ? 'Each player will receive an email with their payment link to pay their share.' : 'You will pay the full amount for all participants.'}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #666666;">
                    ${dto.isSplitPayment ? 'Invited players will receive payment instructions via email. The reservation will be confirmed once all participants complete their payments.' : 'Please complete your payment to confirm this reservation.'}
                  </p>

                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center; padding-top: 20px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservations" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Reservation</a>
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
}
