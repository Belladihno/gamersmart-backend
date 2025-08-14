import express from "express";
import GameController from "../controllers/gameController.js";
import upload from "../../src/middlewares/upload.js";
import auth from "../middlewares/protect.js";
import Game from "../models/gameModel.js";

const router = express.Router();

// GET /api/games - Get all games
router.get("/", GameController.getAllGames);

// GET /api/games/slug/:slug - Get a game by slug
router.get("/slug/:slug", GameController.getGameBySlug);

// GET /api/games/:id - Get a game by id
router.get("/:id", GameController.getGameById);

// POST /api/games - Create new game with single image
router.post(
  "/",
  upload,
  auth.protect,
  GameController.createGame
);

// PUT /api/games/:id - update game
router.put(
  "/:id",
  upload,
  auth.protect,
  auth.checkOwnership(Game),
  GameController.updateGame
);

// DELETE /api/games/:id - delete a game by id
router.delete(
  "/:id",
  auth.protect,
  auth.checkOwnership(Game),
  GameController.deleteGame
);

export default router;
