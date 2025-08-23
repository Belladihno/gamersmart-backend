import express from "express";
import ReviewController from "../controllers/reviewController.js";
import auth from "../../src/middlewares/protect.js";

const router = express.Router();

// GET /api/review/:id - Get all reviews
router.get("/:id", ReviewController.getAllReviews);

// POST /api/review/:id - create a review
router.post(
  "/:id",
  auth.protect,
  auth.isVerified,
  ReviewController.createReview
);

// PUT /api/review/:id - update a review
router.put(
  "/:id",
  auth.protect,
  auth.isVerified,
  ReviewController.updateReview
);

// DELETE /api/review/:id - delete a review by id
router.delete(
  "/:id",
  auth.protect,
  auth.isVerified,
  auth.restrictTo("user", "admin"),
  ReviewController.deleteReview
);

export default router;
