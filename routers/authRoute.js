import express from "express";
import AuthController from "../controllers/authController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

// POST /api/auth/signup - sign up/ register
router.post("/signup", AuthController.signup);

// POST /api/auth/login - login/ signin
router.post("/login", AuthController.login);

// PATCH /api/auth/send-forgot-password-code
router.patch("/send-forgot-password-code", AuthController.sendForgotPassword);

// PATCH /api/auth/verify-forgot-password-code
router.patch(
  "/verify-forgot-password-code",
  AuthController.verifyForgotPasswordCode
);

router.use(protect);

// POST /api/auth/logout - logout
router.post("/logout", AuthController.logout);

// PATCH /api/auth/send-verification-code
router.patch("/send-verification-code", AuthController.sendVerificationCode);

// PATCH /api/auth/verify-verification-code
router.patch("/verify-verification-code", AuthController.verifyVericationCode);

// PATCH /api/auth/reset-password
router.patch("/reset-password", AuthController.resetPassword);

export default router;
