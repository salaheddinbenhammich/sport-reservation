import { PaymentConfirmationEmailDto } from '../interfaces/email-options.interface';

export function getPaymentConfirmedTemplate(
  dto: PaymentConfirmationEmailDto,
): string {
  const statusMessage = dto.isFullyConfirmed
    ? `
      <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="text-align: center;">
            <p style="margin: 0 0 5px; font-size: 14px; color: #065f46; font-weight: bold;">🎉 RESERVATION CONFIRMED</p>
            <p style="margin: 0; font-size: 16px; color: #047857;">All participants have paid. See you on the field!</p>
          </td>
        </tr>
      </table>
    `
    : `
      <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="text-align: center;">
            <p style="margin: 0 0 5px; font-size: 14px; color: #92400e; font-weight: bold;">⏳ WAITING FOR OTHERS</p>
            <p style="margin: 0; font-size: 16px; color: #78350f;">Your payment is confirmed. Waiting for ${dto.pendingParticipants} more participant(s).</p>
          </td>
        </tr>
      </table>
    `;

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
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✅ Payment Confirmed!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Hi <strong>${dto.username}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Great news! Your payment has been successfully processed. Thank you for confirming your spot! 🎉
                  </p>

                  <!-- Payment Success Icon -->
                  <table role="presentation" style="width: 100%; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; line-height: 80px; font-size: 40px; color: #ffffff; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">✓</div>
                      </td>
                    </tr>
                  </table>

                  <!-- Status Message -->
                  ${statusMessage}

                  <!-- Booking Reference -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">${dto.bookingReference}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Payment Details -->
                  <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #667eea;">💳 Payment Details</h2>
                        
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0">
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Stadium:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.stadiumName}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Date:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.date}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Time:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.time}</td>
                          </tr>
                          <tr style="border-top: 2px solid #e5e7eb;">
                            <td style="font-weight: bold; color: #666666; padding: 12px 0 8px 0;">Amount Paid:</td>
                            <td style="color: #10b981; text-align: right; font-size: 18px; font-weight: bold; padding: 12px 0 8px 0;">€${dto.amountPaid.toFixed(2)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Next Steps -->
                  <table role="presentation" style="width: 100%; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #1e40af;">📝 What's Next?</p>
                        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                          ${dto.isFullyConfirmed ? '<li style="margin-bottom: 8px;">Your reservation is fully confirmed!</li>' : '<li style="margin-bottom: 8px;">Wait for other participants to complete their payments</li>'}
                          <li style="margin-bottom: 8px;">You'll receive a final confirmation email once all payments are complete</li>
                          <li style="margin-bottom: 8px;">Check your reservation details anytime in your dashboard</li>
                          <li>Arrive 10-15 minutes before match time</li>
                        </ul>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                    ${dto.isFullyConfirmed ? 'See you on the field! ⚽💪' : "We'll notify you when everyone has paid! 📧"}
                  </p>

                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservations" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View My Reservations</a>
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
                  <p style="margin: 0 0 10px; font-size: 12px; color: #999999;">
                    Payment processed securely by Stripe
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
