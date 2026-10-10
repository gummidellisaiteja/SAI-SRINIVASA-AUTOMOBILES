/**
 * config/mailer.js
 * Nodemailer transporter factory — reads all credentials from environment variables.
 * Never store credentials in source code.
 */
'use strict';

const nodemailer = require('nodemailer');

/**
 * Create and return a Nodemailer transporter.
 * Requires the following env vars:
 *   SMTP_HOST     - SMTP server hostname
 *   SMTP_PORT     - SMTP port (465 for SSL, 587 for STARTTLS)
 *   SMTP_USER     - SMTP login username
 *   SMTP_PASSWORD - SMTP login password
 *   MAIL_FROM     - Sender address (e.g. "Sai Srinivasa Automobiles <no-reply@example.com>")
 */
function createTransporter() {
    const host     = process.env.SMTP_HOST;
    const port     = parseInt(process.env.SMTP_PORT || '587', 10);
    const user     = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from     = process.env.MAIL_FROM || user;

    if (!host || !user || !password) {
        throw new Error(
            'SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env'
        );
    }

    const secure = port === 465; // true = implicit SSL (465), false = STARTTLS (587)

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS:        !secure,   // Force STARTTLS on port 587
        connectionTimeout: 15000,     // 15s connection timeout
        greetingTimeout:   10000,     // 10s server greeting timeout
        socketTimeout:     30000,     // 30s idle socket timeout
        auth: { user, pass: password },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
            minVersion: 'TLSv1.2'
        }
    });

    return { transporter, from };
}

/**
 * Send a password reset email with the 6-digit code.
 * @param {string} toEmail - Recipient's email address
 * @param {string} code    - The plain 6-digit code (NOT the hash)
 */
async function sendPasswordResetEmail(toEmail, code) {
    const { transporter, from } = createTransporter();

    const subject = 'Sai Srinivasa Automobiles - Password Reset Code';

    const textBody = `
Hello,

A password reset was requested for your Sai Srinivasa Automobiles Owner Console account.

Your verification code is:

${code}

This code will expire in 10 minutes.

If you did not request this password reset, you can safely ignore this email.
Do not share this code with anyone.

Sai Srinivasa Automobiles
Owner Console
`.trim();

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#b01c28;padding:28px 36px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                SAI SRINIVASA AUTOMOBILES
              </h1>
              <p style="margin:4px 0 0;color:#f8c0c0;font-size:13px;">Owner Console &bull; Password Reset</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 18px;color:#333;font-size:15px;line-height:1.6;">Hello,</p>
              <p style="margin:0 0 18px;color:#333;font-size:15px;line-height:1.6;">
                A password reset was requested for your <strong>Sai Srinivasa Automobiles Owner Console</strong> account.
                Your one-time verification code is:
              </p>

              <!-- Code Box -->
              <div style="text-align:center;margin:28px 0;">
                <span style="display:inline-block;background:#f8f8f8;border:2px solid #b01c28;
                             border-radius:10px;padding:18px 36px;
                             font-size:36px;font-weight:700;letter-spacing:10px;
                             color:#b01c28;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>

              <p style="margin:0 0 18px;color:#555;font-size:14px;line-height:1.6;">
                ⏱️ This code expires in <strong>10 minutes</strong>.
              </p>
              <p style="margin:0 0 18px;color:#555;font-size:14px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
                Your account remains secure.
              </p>
              <p style="margin:0;color:#e05555;font-size:13px;font-weight:600;">
                🔒 Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:18px 36px;border-top:1px solid #eee;">
              <p style="margin:0;color:#999;font-size:12px;line-height:1.6;">
                Sai Srinivasa Automobiles &bull; Owner Console<br>
                Madhira, Telangana, India
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

    await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text: textBody,
        html: htmlBody
    });
}

module.exports = { sendPasswordResetEmail };
