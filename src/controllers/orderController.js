import Order from "../models/orderModel.js";
import AppError from "../utils/appError.js";
import APIFEATURES from "../utils/apiFeatures.js";
import validator from "../middlewares/validator.js";
import Cart from "../models/cartModel.js";
import CartItem from "../models/cartItemModel.js";
import catchAsync from "../utils/catchAsync.js";

class OrderController {
  // Get all orders for current user
  // route GET /api/orders
  // access private
  getOrders = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const features = new APIFEATURES(
      Order.find({ user: userId }).populate("items.game", "name image"),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const orders = await features.query;
    const count = await Order.countDocuments({ user: userId });

    if (!orders || orders.length === 0) {
      return next(new AppError("No orders found!", 404));
    }

    const currentPage = parseInt(req.query.page, 10) || 1;
    const totalPages = Math.ceil(count / features.query.limit || 10);
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      results: orders.length,
      currentPage,
      totalPages,
      data: orders,
    });
  });

  // Get single order by ID
  // route GET /api/orders/:id
  // access private
  getOrder = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const orderId = req.params.id;
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid order ID format", 400));
    }
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("user", "firstname lastname email")
      .populate("items.game", "name image slug");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  });

  // Create order from cart
  // route POST /api/orders
  // access private
  createOder = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;
    const { error } = validator.createOderSchema.validate({
      shippingAddress,
      paymentMethod,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }
    const cart = await Cart.findOne({
      user: userId,
      status: "active",
    });
    
    const cartItem = await CartItem.find({ cart: cart._id }).populate("game");
    if (!cartItem || cartItem.length === 0) {
      return next(new AppError("Cart is empty", 400));
    }

    for (const item of cartItem) {
      if (!item.game) {
        return next(new AppError("One or more games no longer exist", 400));
      }

      if (!item.game.isActive || item.game.availability !== "available") {
        return next(
          new AppError(`Game "${item.game.name}" is no longer available`, 400)
        );
      }

      if (
        !item.game.stock.unlimited &&
        item.game.stock.quantity < item.quantity
      ) {
        return next(
          new AppError(`Insufficient stock for "${item.game.name}"`, 400)
        );
      }
    }
    const orderItems = cartItem.map((item) => ({
      game: item.game._id,
      name: item.game.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderNumber = `ORD-${timestamp}-${random}`;

    const order = await Order.create({
      user: userId,
      orderNumber,
      items: orderItems,
      totalAmount,
      totalItems,
      paymentMethod,
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    cart.status = "checkout";
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  });

  // Cancel order
  // route PUT /api/orders/:id/cancel
  // access private
  cancelOrder = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const orderId = req.params.id;
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid order ID format", 400));
    }
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return next(new AppError("Order not found", 404));
    }
    if (order.status === "completed" || order.status === "cancelled") {
      return next(new AppError("Cannot cancel this order", 400));
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  });
}

export default new OrderController();
