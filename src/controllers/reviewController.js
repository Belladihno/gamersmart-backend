import Review from "../models/reviewModel.js";
import AppError from "../utils/appError.js";
import Game from "../models/gameModel.js";
import validator from "../middlewares/validator.js";
import APIFEATURES from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";

class ReviewController {
  getAllReviews = catchAsync(async (req, res, next) => {
    const gameId = req.params.id;
    const features = new APIFEATURES(
      Review.find({ game: gameId }).populate("game", "name"),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;
    const count = await Game.countDocuments();

    if (!reviews || reviews.length === 0) {
      return next(new AppError("No reviews found!", 404));
    }
    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalPages = Math.ceil(count / features.query.limit || 10);
    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      results: reviews.length,
      currentPage,
      totalPages,
      data: reviews,
    });
  });

  createReview = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { content, rating } = req.body;
    const gameId = req.params.id;
    if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid game ID format", 400));
    }

    const { error } = validator.createReviewSchema.validate({
      content,
      rating,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const game = await Game.findOne({ _id: gameId, isActive: true });
    if (!game) {
      return next(new AppError("Game not found", 404));
    }

    const review = await Review.create({
      content,
      rating,
      user: userId,
      game: gameId,
    });

    const newCount = game.reviews.count + 1;
    const currentTotal = game.reviews.averageRating * game.reviews.count;
    const newAverage = (currentTotal + rating) / newCount;

    await Game.findByIdAndUpdate(gameId, {
      "reviews.count": newCount,
      "reviews.averageRating": Math.round(newAverage * 10) / 10,
    });

    return res.status(201).json({
      success: true,
      message: " Review created successfully",
      data: review,
    });
  });

  updateReview = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const reviewId = req.params.id;
    const { content, rating } = req.body;
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid review ID format", 400));
    }

    const { error } = validator.updateReviewSchema.validate({
      content,
      rating,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!existingReview) {
      return next(new AppError("Review not found", 404));
    }

    const game = await Game.findById(existingReview.game);
    if (!game) {
      return next(new AppError("Game not found", 404));
    }

    const currentTotal = game.reviews.averageRating * game.reviews.count;
    const newTotal = currentTotal - existingReview.rating + rating;
    const newAverage = newTotal / game.reviews.count;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { content, rating, isEdited: true },
      { new: true, runValidators: true }
    );

    await Game.findByIdAndUpdate(existingReview.game, {
      "reviews.averageRating": Math.round(newAverage * 10) / 10,
    });

    return res.status(200).json({
      success: true,
      message: "review updated successfully",
      data: updatedReview,
    });
  });

  deleteReview = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const reviewId = req.params.id;
    if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid review ID format", 400));
    }

    const existingReview = await Review.findOne({
      _id: reviewId,
      user: userId,
    });
    if (!existingReview) {
      return next(new AppError("Review not found", 404));
    }

    const game = await Game.findById(existingReview.game);
    if (!game) {
      return next(new AppError("Game not found", 404));
    }

    const newCount = game.reviews.count - 1;
    let newAverage = 0;

    if (newCount > 0) {
      const currentTotal = game.reviews.averageRating * game.reviews.count;
      const newTotal = currentTotal - existingReview.rating;
      newAverage = newTotal / newCount;
    }

    await Review.findByIdAndDelete(reviewId);

    await Game.findByIdAndUpdate(existingReview.game, {
      "reviews.count": newCount,
      "reviews.averageRating": Math.round(newAverage * 10) / 10,
    });

    res.status(204).json({
      success: true,
      message: "review deleted successfully",
    });
  });
}

export default new ReviewController();
