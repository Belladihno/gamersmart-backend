import express from "express";
import auth from "../middlewares/protect.js";
import PaymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/webhook", PaymentController.handleWebhook);

router.use(auth.protect);


// POST /api/payment/initialize - Initialize payment
router.post("/initialize", PaymentController.initializePayement);

// GET /api/payment/verify - Verify payment
router.get("/callback", PaymentController.verifyPayment);

export default router;
