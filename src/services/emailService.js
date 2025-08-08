import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

class EmailService {
  constructor() {
    this.clientId = process.env.GMAIL_CLIENT_ID;
    this.clientSecret = process.env.GMAIL_CLIENT_SECRET;
    this.refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    this.userEmail = process.env.GMAIL_USER_EMAIL;
    this.redirectUri =
      process.env.GMAIL_REDIRECT_URI ||
      "https://developers.google.com/oauthplayground";

    if (
      !this.clientId ||
      !this.clientSecret ||
      !this.refreshToken ||
      !this.userEmail
    ) {
      throw new Error(
        "Missing required Gmail OAuth2 environment variables: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER_EMAIL"
      );
    }

    this.oAuth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    this.oAuth2Client.setCredentials({
      refresh_token: this.refreshToken,
    });
  }

  async createTransporter() {
    try {
      const accessTokenResponse = await this.oAuth2Client.getAccessToken();
      if (!accessTokenResponse.token) {
        throw new Error("Failed to obtain access token from Google OAuth2");
      }

      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: this.userEmail,
          clientId: this.clientId,
          clientSecret: this.clientSecret,
          refreshToken: this.refreshToken,
          accessToken: accessTokenResponse.token,
        },
      });
    } catch (error) {
      console.error("Error creating transporter:", error);
      throw error;
    }
  }

  async sendEmail({ to, subject, text, html, from = null }) {
    try {
      // Validate required email parameters
      if (!to || !subject) {
        throw new Error(
          "Missing required email parameters: 'to' and 'subject' are mandatory"
        );
      }

      // Validate that at least text or html content is provided
      if (!text && !html) {
        throw new Error("Email must contain either text or html content");
      }

      const transporter = await this.createTransporter();
      // Check if transporter was created successfully
      if (!transporter) {
        throw new Error("Failed to create email transporter");
      }
      const mailOptions = {
        from: from || `Gamersmart <${this.userEmail}>`,
        to,
        subject,
        text,
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new EmailService();
