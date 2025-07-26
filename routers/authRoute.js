import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup - sign up/ register
router.post("/signup", AuthController.signup);

// POST /api/auth/login - login/ signin
router.post("/login", AuthController.login);

// POST /api/auth/logout - logout
router.post("/logout", AuthController.logout);

export default router
