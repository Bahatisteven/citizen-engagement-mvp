const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - Optional HTML content
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text, html = null) => {
  // Validate inputs
  if (!to || !subject || !text) {
    throw new Error('Missing required email parameters: to, subject, or text');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error('Invalid email address format');
  }

  // Check environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Citizen Engagement Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} - MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;