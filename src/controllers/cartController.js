import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import Game from "../models/gameModel.js";
import AppError from "../utils/appError.js";
import validator from "../middlewares/validator.js";
import helpers from "../utils/helpers.js";
import catchAsync from "../utils/catchAsync.js";

class CartController {
  getCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId, status: "active" });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        status: "active",
        totalAmount: 0,
        totalItems: 0,
      });
    }
    const cartItems = await CartItem.find({ cart: cart._id })
      .populate("game", "name price discount image slug")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: {
        cart: {
          ...cart.toObject(),
          items: cartItems,
        },
      },
    });
  });

  addItemToCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { gameId, quantity = 1 } = req.body;

    const { error } = validator.addItemToCartSchema.validate({
      gameId,
      quantity,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    // Verify game exists and is available
    const game = await Game.findOne({
      _id: gameId,
      isActive: true,
      availability: "available",
    });
    if (!game) {
      return next(new AppError("Game not found or not available", 404));
    }

    if (!game.stock.unlimited) {
      if (game.stock.quantity < quantity) {
        if (game.stock.quantity === 0) {
          await Game.findByIdAndUpdate(gameId, {
            availability: "out-of-stock",
            isActive: false,
          });
        }
        return next(new AppError("Insufficient stock", 400));
      }
    }

    // Find or create active cart
    let cart = await Cart.findOne({ user: userId, status: "active" });
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        status: "active",
        totalAmount: 0,
        totalItems: 0,
      });
    }

    // Check if item already exists in cart
    let existingCartItem = await CartItem.findOne({
      cart: cart._id,
      game: gameId,
    });
    let cartItem;
    const currentPrice = game.discountPrice;

    if (existingCartItem) {
      // Update existing item quantity
      const newQuantity = existingCartItem.quantity + quantity;
      if (!game.stock.unlimited && newQuantity > game.stock.quantity) {
        return next(
          new AppError("Not enough stock for requested quantity", 400)
        );
      }
      existingCartItem.quantity = newQuantity;
      existingCartItem.price = currentPrice;
      cartItem = await existingCartItem.save();
    } else {
      // Create new cart-item
      cartItem = await CartItem.create({
        cart: cart._id,
        user: userId,
        game: gameId,
        quantity,
        price: currentPrice,
      });
    }

    await helpers.updateCartTotals(cart._id);

    const updatedCart = await helpers.getCartWithItems(cart._id);

    return res.status(200).json({
      success: true,
      message: existingCartItem
        ? "Cart item quantity updated successfully"
        : "Item added to cart successfully",
      data: updatedCart,
    });
  });

  updateCartItem = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const itemId = req.params.id;
    const { quantity } = req.body;
    const { error } = validator.updateCartItemSchema.validate({
      quantity,
      itemId,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const cart = await Cart.findOne({ user: userId, status: "active" });
    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    const cartItem = await CartItem.findOne({
      cart: cart._id,
      _id: itemId,
    }).populate("game");

    if (!cartItem) {
      return next(new AppError("Item not found", 404));
    }

    const game = cartItem.game;

    if (!game.isActive || game.availability !== "available") {
      return next(new AppError("Game is no longer available", 400));
    }

    if (!game.stock.unlimited && quantity > game.stock.quantity) {
      return next(new AppError("Quantity is more than stock available", 400));
    }
    cartItem.quantity = quantity;

    await cartItem.save();

    await helpers.updateCartTotals(cart._id);

    const updatedCart = await helpers.getCartWithItems(cart._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  });

  removeItem = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const itemId = req.params.id;
    const { error } = validator.removeItemSchema.validate({ itemId });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const cart = await Cart.findOne({ user: userId, status: "active" });
    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    const cartItem = await CartItem.findOneAndDelete({
      _id: itemId,
      cart: cart._id,
    });
    if (!cartItem) {
      return next(new AppError("Item not found in cart", 404));
    }

    await helpers.updateCartTotals(cart._id);

    const updatedCart = await helpers.getCartWithItems(cart._id);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        cart: updatedCart,
        deletedItem: {
          id: cartItem._id,
          gameId: cartItem.game,
          quantity: cartItem.quantity,
          price: cartItem.price,
        },
      },
    });
  });

  clearCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId, status: "active" });
    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }
    await CartItem.deleteMany({ cart: cart._id });
    cart.totalAmount = 0;
    cart.totalItems = 0;
    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: {
        cart: {
          ...cart.toObject(),
          items: [],
        },
      },
    });
  });
}

export default new CartController();
