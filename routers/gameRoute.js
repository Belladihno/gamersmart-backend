import express from "express";
import GameController from "../controllers/gameController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// GET /api/games - Get all games
router.get("/", GameController.getAllGames);

// GET /api/games/slug/:slug - Get a game by slug
router.get("/slug/:slug", GameController.getGameBySlug);

// GET /api/games/:id - Get a game by id
router.get("/:id", GameController.getGameById);

// POST /api/games - Create new game with single image
router.post("/", upload, GameController.createGame);

// PUT /api/games/:id - update game
router.put("/:id", upload, GameController.updateGame);

// DELETE /api/games/:id - delete a game by id
router.delete("/:id", GameController.deleteGame);

export default router;
