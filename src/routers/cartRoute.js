import express from "express";
import protect from "../../src/middlewares/protect.js";
import CartController from "../controllers/cartController.js";

const router = express.Router();

router.use(protect);

// GET /api/cart -Get cart
router.get("/", CartController.getCart);

// POST /api/cart/add - Add item to cart
router.post("/add", CartController.addToCart);

// PUT /api/cart/update - update cart 
router.put("/update/:id", CartController.updateCart);

// DELETE /api/cart/remove - remove an item from cart 
router.delete("/remove/:id", CartController.removeItem);

export default router;
