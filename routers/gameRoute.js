import express from "express";
import GameController from "../controllers/gameController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// GET /api/games - Get all games
router.get("/", GameController.getAllGames);

// GET /api/games/:id - Get a game by id
router.get("/:id", GameController.getGameById);

// POST /api/games - Create new game
router.post("/", upload.single("image"), GameController.createGame);

// PUT /api/games/:id - update game
router.put("/:id", upload.single("image"), GameController.updateGame);

// DELETE /api/games/:id - delete a game by id
router.delete("/:id", GameController.deleteGame);

export default router;
