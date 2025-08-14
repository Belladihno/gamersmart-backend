import express from "express";
import auth from "../middlewares/protect.js";
import UserController from "../controllers/userController.js";


const router = express.Router();

router.use(auth.protect);

// GET /api/user/get-profile
router.get("/get-profile", UserController.getProfile);

// PUT /api/user/update-profile
router.put("/update-profile", UserController.updateProfile);

// PATCH /api/user/update-password
router.patch("/update-password", UserController.updatePassword);

export default router;
