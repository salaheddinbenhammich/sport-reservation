import { InvitationEmailDto } from '../interfaces/email-options.interface';

export function getInvitationFreeTemplate(dto: InvitationEmailDto): string {
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
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⚽ You're Invited to Play!</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Hi <strong>${dto.playerName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                    Good news! <strong>${dto.organizerName}</strong> has invited you to join a football match and already covered all the costs. All you need to do is show up and play! ⚽
                  </p>

                  <!-- Success Banner -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 14px; color: #065f46; font-weight: bold;">✅ FULLY PAID</p>
                        <p style="margin: 0; font-size: 16px; color: #047857;">No payment required from you!</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Booking Reference -->
                  <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 12px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</p>
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">${dto.bookingReference}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- Match Details -->
                  <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <h2 style="margin: 0 0 20px; font-size: 18px; color: #667eea;">📋 Match Details</h2>
                        
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="8" border="0">
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Organized by:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.organizerName}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Stadium:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.stadiumName}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Location:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.stadiumLocation}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Date:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.date}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: bold; color: #666666; padding: 8px 0;">Time:</td>
                            <td style="color: #333333; text-align: right; padding: 8px 0;">${dto.time}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Important Info -->
                  <table role="presentation" style="width: 100%; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 20px; margin-bottom: 30px;" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px; font-size: 16px; font-weight: bold; color: #92400e;">⏰ Important Reminders</p>
                        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                          <li style="margin-bottom: 8px;">Arrive 10-15 minutes before match time</li>
                          <li style="margin-bottom: 8px;">Bring your sports gear and water</li>
                          <li style="margin-bottom: 8px;">Don't forget your ID for stadium entry</li>
                        </ul>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 30px; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                    See you on the field! ⚽💪
                  </p>

                  <!-- Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reservations" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View Details</a>
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
