/**
 * Test Gmail SMTP connection and send a test email
 * Run: node scratch/test_smtp.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
    console.log('\n='.repeat(40));
    console.log('SMTP CONFIG CHECK');
    console.log('  Host    :', process.env.SMTP_HOST);
    console.log('  Port    :', process.env.SMTP_PORT);
    console.log('  User    :', process.env.SMTP_USER);
    console.log('  Password:', process.env.SMTP_PASSWORD ? '****' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');
    console.log('  From    :', process.env.MAIL_FROM);
    console.log('='.repeat(40));

    const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: false, // STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    console.log('\nVerifying SMTP connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');
    } catch (err) {
        console.error('❌ SMTP connection failed:', err.message);
        process.exit(1);
    }

    console.log('\nSending test email to:', process.env.SMTP_USER);
    try {
        const info = await transporter.sendMail({
            from:    process.env.MAIL_FROM,
            to:      process.env.SMTP_USER,
            subject: 'Sai Srinivasa Automobiles — SMTP Test',
            text:    'This is a test email to verify the SMTP configuration is working correctly.',
            html:    '<p><b>SMTP test successful!</b> Your password reset emails will be sent to this address.</p>'
        });
        console.log('✅ Test email sent! Message ID:', info.messageId);
        console.log('   Check your Gmail inbox at', process.env.SMTP_USER);
    } catch (err) {
        console.error('❌ Failed to send test email:', err.message);
        process.exit(1);
    }

    process.exit(0);
}

main();
