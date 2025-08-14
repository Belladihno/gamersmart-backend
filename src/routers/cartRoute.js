import express from "express";
import auth from "../../src/middlewares/protect.js";
import CartController from "../controllers/cartController.js";

const router = express.Router();

router.use(auth.protect);

// GET /api/cart -Get cart
router.get("/", CartController.getCart);

// POST /api/cart/add - Add item to cart
router.post("/add", CartController.addItemToCart);

// PUT /api/cart/update - update cart
router.put("/update/:id", CartController.updateCartItem);

// DELETE /api/cart/remove - remove an item from cart
router.delete("/remove/:id", CartController.removeItem);

// DELETE /api/cart/clear - Clear entire cart
router.delete("/clear", CartController.clearCart);

export default router;
