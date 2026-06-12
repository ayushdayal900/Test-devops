const nodemailer = require('nodemailer');
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const dotenv = require('dotenv');

dotenv.config();

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (options) => {
  // Create a transporter using AWS SES
  const transporter = nodemailer.createTransport({
    SES: { ses, aws: { SendRawEmailCommand } },
  });

  const message = {
    from: `${process.env.SES_FROM_NAME} <${process.env.SES_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Support for HTML emails
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it so the main flow continues
    // or you could throw it if you want the controller to handle it explicitly.
    // For now, let's return null to indicate failure but keep process alive.
    return null;
  }
};

module.exports = sendEmail;
