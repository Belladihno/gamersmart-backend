import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL;
    this.fromName = process.env.SENDGRID_FROM_NAME || "Gamersmart";

    if (!this.apiKey) {
      throw new Error(
        "Missing required SendGrid environment variable: SENDGRID_API_KEY"
      );
    }

    if (!this.fromEmail) {
      throw new Error(
        "Missing required environment variable: SENDGRID_FROM_EMAIL"
      );
    }

    sgMail.setApiKey(this.apiKey);
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      if (!to || !subject) {
        throw new Error(
          "Missing required email parameters: 'to' and 'subject' are mandatory"
        );
      }

      if (!text && !html) {
        throw new Error("Email must contain either text or html content");
      }

      const emailMessage = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject,
        text,
        html,
      };

      const result = await sgMail.send(emailMessage);
      console.log(
        "Email sent successfully via SendGrid:",
        result[0]?.statusCode || "Unknown status"
      );

      return {
        success: true,
        statusCode: result[0]?.statusCode,
        messageId: result[0]?.headers?.["x-message-id"],
        accepted: [to],
        result: result,
      };
    } catch (error) {
      console.error(
        "SendGrid email error:",
        error.response?.body || error.message
      );
      throw {
        success: false,
        error:
          error.response?.body?.errors?.[0]?.message ||
          error.message ||
          "Failed to send email",
        statusCode: error.code || 500,
      };
    }
  }
}

export default new EmailService();
