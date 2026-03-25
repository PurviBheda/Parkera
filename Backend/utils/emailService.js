import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

/**
 * Robust SMTP Transporter configuration.
 * Using 'service: gmail' and port 465 (SMTPS) for better reliability in cloud environments.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Unified function to send emails.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content of the email.
 * @returns {Promise} - Result of the sendMail operation.
 */
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("❌ EMAIL_USER or EMAIL_PASS is missing in environment variables.");
    }

    const mailOptions = {
      from: `"Parkera" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log(`📧 Sending email to: ${to} | Subject: ${subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
