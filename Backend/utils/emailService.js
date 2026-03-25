import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

/**
 * Resend Email Service configuration.
 * Using Resend SDK to bypass Render's outbound SMTP port blocking.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Unified function to send emails.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content of the email.
 * @returns {Promise} - Result of the send operation.
 */
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("❌ RESEND_API_KEY is missing in environment variables.");
    }

    // Default "from" email using Resend testing domain (e.g. onboarding@resend.dev) or user's custom domain
    // If you have a verified domain on Resend, change "onboarding@resend.dev" to "hello@yourdomain.com"
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const mailOptions = {
      from: `Parkera <${fromEmail}>`,
      to: [to],
      subject,
      html,
    };

    console.log(`📧 Sending email via Resend to: ${to} | Subject: ${subject}`);
    const { data, error } = await resend.emails.send(mailOptions);
    
    if (error) {
       console.error(`❌ Resend API Error when sending to ${to}:`, error);
       throw new Error(error.message);
    }
    
    console.log(`✅ Email sent successfully via Resend API! ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

export default sendEmail;
