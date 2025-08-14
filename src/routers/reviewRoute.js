import express from "express";
import ReviewController from "../controllers/reviewController.js";
import auth from "../../src/middlewares/protect.js";

const router = express.Router();

router.use(auth.protect);

// GET /api/review/:id - Get all reviews
router.get("/:id", ReviewController.getAllReviews);

// POST /api/review/:id - create a review
router.post("/:id", ReviewController.createReview);

// PUT /api/review/:id - update a review
router.put("/:id", ReviewController.updateReview);

// DELETE /api/review/:id - delete a review by id
router.delete("/:id", ReviewController.deleteReview);

export default router;
