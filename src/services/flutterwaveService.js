import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class FlutterwaveService {
  constructor() {
    this.baseURL =
      process.env.FLUTTERWAVE_BASE_URL || "https://api.flutterwave.com/v3";
    this.secretKey = process.env.FLUTTER_TEST_SECRET_KEY;
    this.publicKey = process.env.FLUTTER_TEST_PUBLIC_KEY;
    this.encryptionKey = process.env.FLUTTER_TEST_ENCRYPTION_KEY;
  }

  // initiate payment
  async initializePayment(paymentData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Flutterwave initialization error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Payment initialiation failed"
      );
    }
  }

  //verify payment
  async verifyTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Flutterwave verification error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Transaction verification failed"
      );
    }
  }

  // generate transaction ref
  generateTxRef() {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new FlutterwaveService();
