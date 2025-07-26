import Game from "../models/gameModel.js";
import AppError from "../utils/appError.js";
import APIFEATURES from "../utils/apiFeatures.js";
import validator from "../middlewares/validator.js";
import { uploadImage, deleteImage } from "../utils/imageUpload.js";

class GameController {
  // get all games with filtering, sorting , and pagination
  // route GET /api/games
  // access public
  async getAllGames(req, res, next) {
    try {
      const features = new APIFEATURES(Game.find(), req.query)
        .search()
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const games = await features.query;
      const count = await Game.countDocuments();

      if (!games || games.length === 0) {
        return next(new AppError("No games found!", 404));
      }
      const currentPage = parseInt(req.query.page, 10) || 1;
      const totalPages = Math.ceil(count / features.query.limit || 10);
      res.status(200).json({
        success: true,
        message: "Games fetched successfully",
        results: games.length,
        currentPage,
        totalPages,
        data: games,
      });
    } catch (error) {
      return next(
        new AppError(`Error fetching all games: ${error.message}`, 500)
      );
    }
  }
// async getAllGames(req, res, next) {
//   try {
//     console.log('1. Starting getAllGames');
//     const features = new APIFEATURES(Game.find(), req.query)
//       .search()
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const games = await features.query;
//     console.log('2. Query executed, games found:', games.length);

//     console.log('3. About to count documents');
//     const count = await Game.countDocuments();
//     console.log('4. Count retrieved:', count);

//     if (!games || games.length === 0) {
//       console.log('5. No games branch - should not reach here');
//       return next(new AppError("No games found!", 404));
//     }

//     console.log('6. About to calculate pagination');
//     const currentPage = parseInt(req.query.page, 10) || 1;
//     console.log('7. Current page:', currentPage);
    
//     const totalPages = Math.ceil(count / features.query.limit || 10);
//     console.log('8. Total pages:', totalPages);
    
//     console.log('9. About to send response');
//     res.status(200).json({
//       success: true,
//       message: "Games fetched successfully",
//       results: games.length,
//       currentPage,
//       totalPages,
//       data: games,
//     });
//     console.log('10. Response sent');
    
//   } catch (error) {
//     console.log('Error caught:', error);
//     return next(new AppError(`Error fetching all games: ${error.message}`, 500));
//   }
// }
  // get single game by ID
  // route GET /api/games/:id
  //access public
  async getGameById(req, res, next) {
    try {
      const gameId = req.params.id;
      if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid gameId format", 400));
      }
      const game = await Game.findById(gameId);
      if (!game) {
        return next(new AppError("Game not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Game fetched successfully",
        data: game,
      });
    } catch (error) {
      return next(new AppError(`Error fetching game: ${error.message}`, 500));
    }
  }
  // create new game
  // route POST /api/games
  // access private
  async createGame(req, res, next) {
    try {
      const {
        title,
        description,
        shortDescription,
        price,
        releaseDate,
        discount,
      } = req.body;
      if (!req.file) {
        return next(new AppError("Please upload an image", 400));
      }
      const { error } = validator.createGameSchema.validate({
        title,
        description,
        shortDescription,
        releaseDate,
        price,
        discount,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const existingGame = await Game.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
      });
      if (existingGame) {
        return next(new AppError("Gamw with this title already exist!", 400));
      }
      const result = await uploadImage(req.file);
      const game = await Game.create({
        title,
        description,
        shortDescription,
        releaseDate,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        image: result.secure_url,
      });
      res.status(201).json({
        success: true,
        message: "Game created successfully",
        data: game,
      });
    } catch (error) {
      return next(new AppError(`Error creating game: ${error.message}`, 500));
    }
  }
  // update  game
  // route PUT /api/games
  // access private
  async updateGame(req, res, next) {
    try {
      const gameId = req.params.id;
      if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid gameId format", 400));
      }
      const existingGame = await Game.findById(gameId);
      if (!existingGame) {
        return next(new AppError("Game not found", 404));
      }

      const { title, description, shortDescription, price, discount } =
        req.body;

      let imageUrl = existingGame.image;
      if (req.file) {
        await deleteImage(existingGame.image);
        const result = await uploadImage(req.file);
        imageUrl = result.secure_url;
      }

      let parsedPrice;
      if (price !== undefined && price !== null && price !== "") {
        parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
          return next(
            new AppError("Invalid price format.Price must be a number.", 400)
          );
        }
      } else {
        parsedPrice = existingGame.price;
      }

      let parsedDiscount = 0;
      if (discount !== undefined && discount !== null && discount !== "") {
        parsedDiscount = parseFloat(discount);
        if (isNaN(parsedDiscount)) {
          return next(
            new AppError(
              "Invalid discount format.DIscount must be a number.",
              400
            )
          );
        }
      }

      const { error } = validator.updateGameschema.validate({
        title,
        description,
        shortDescription,
        price,
        discount,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }

      const game = await Game.findByIdAndUpdate(
        gameId,
        {
          title,
          description,
          shortDescription,
          price: parsedPrice,
          discount: parsedDiscount,
          image: imageUrl,
        },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        message: "Game updated successfully",
        data: game,
      });
    } catch (error) {
      return next(new AppError(`Error updating game: ${error.message}`, 500));
    }
  }
  // delete  game
  // route DELETE /api/games
  // access private
  async deleteGame(req, res, next) {
    try {
      const gameId = req.params.id;
      if (!gameId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError("Invalid gameId format", 400));
      }
      const existingGame = await Game.findById(gameId);
      if (!existingGame) {
        return next(new AppError("Game not found", 404));
      }
      await deleteImage(existingGame.image);
      await Game.findByIdAndDelete(gameId);
      res.status(204).json({
        success: true,
        message: "game deleted successfully",
      });
    } catch (error) {
      return next(new AppError(`Error deleting game: ${error.message}`, 500));
    }
  }
}

export default new GameController();
