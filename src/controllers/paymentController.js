import FlutterwaveService from "../services/flutterwaveService.js";
import AppError from "../utils/appError.js";
import Order from "../models/orderModel.js";
import Payment from "../models/paymentModel.js";
import Game from "../models/gameModel.js";
import validator from "../middlewares/validator.js";
import catchAsync from "../utils/catchAsync.js";

class PaymentController {
  initializePayement = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { orderId } = req.body;

    const { error } = validator.initializePaymentSchema.validate({
      orderId,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("user", "firstname lastname email");

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    let payment = await Payment.findOne({
      order: order._id,
      status: "pending",
    });
    if (!payment) {
      payment = await Payment.create({
        user: userId,
        order: orderId,
        amount: order.totalAmount,
        paymentReference: FlutterwaveService.generateTxRef(),
        status: "pending",
      });
    }

    const paymentData = {
      tx_ref: payment.paymentReference,
      amount: payment.amount,
      currency: "NGN",
      redirect_url: `${process.env.WEBHOOK_FRONTEND_URL}/payment/callback`,
      customer: {
        email: req.user.email,
        name: `${req.user.firstname} ${req.user.lastname}`,
      },
      customizations: {
        title: "Gamersmart Purchase",
        description: `Payment for order ${order.orderNumber}`,
      },
      meta: {
        orderId: order._id.toString(),
        paymentId: payment._id.toString(),
      },
      payment_options: "card,banktransfer,ussd",
    };

    const response = await FlutterwaveService.initializePayment(paymentData);

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: {
        paymentUrl: response.data.link,
        refrence: payment.paymentReference,
        paymentId: payment._id,
      },
    });
  });

  verifyPayment = catchAsync(async (req, res, next) => {
    const { transaction_id, tx_ref, status } = req.query;
    if (status !== "successful") {
      return next(new AppError("Payment was not successful", 400));
    }

    const verification = await FlutterwaveService.verifyTransaction(
      transaction_id
    );
    if (
      verification.status !== "success" ||
      verification.data.status !== "successful"
    ) {
      return next(new AppError("Payment verification failed", 400));
    }

    const payment = await Payment.findOne({ paymentReference: tx_ref });
    if (!payment) {
      return next(new AppError("Payment record not found", 404));
    }

    if (verification.data.amount !== payment.amount) {
      return next(new AppError("Payment amount mismatch", 400));
    }
    //update payment record
    payment.status = "successful";
    payment.transactionId = transaction_id;
    payment.paidAt = new Date();
    payment.gatewayResponse = verification.data;
    await payment.save();

    //update order
    const order = await Order.findById(payment.order);
    order.paymentStatus = "paid";
    order.status = "processing";
    await order.save();

    // Update game stock
    for (const item of order.items) {
      const game = await Game.findById(item.game);
      if (game && !game.stock.unlimited) {
        game.stock.quantity = Math.max(0, game.stock.quantity - item.quantity);
        if (game.stock.quantity === 0) {
          game.availability = "out-of-stock";
        }
        await game.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: { payment, order },
    });
  });

  handleWebhook = catchAsync(async (req, res, next) => {
    const signature = req.headers["verif-hash"];
    const expectedSignature = process.env.FLW_WEBHOOK_SECRET_HASH;

    if (!signature || signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    const payload = req.body;

    if (
      payload.event === "charge.completed" &&
      payload.data.status === "successful"
    ) {
      const { tx_ref, id: transaction_id, amount } = payload.data;
      const payment = await Payment.findOne({ paymentReference: tx_ref });
      if (payment && payment.status === "pending") {
        const verification = await FlutterwaveService.verifyTransaction(
          transaction_id
        );
        if (
          verification.status === "success" &&
          verification.data.amount === amount
        ) {
          payment.status = "successful";
          payment.transactionId = transaction_id;
          payment.paidAt = new Date();
          payment.gatewayResponse = verification.data;
          await payment.save();

          // Update order
          const order = await Order.findById(payment.order);
          order.paymentStatus = "paid";
          order.status = "processing";
          await order.save();

          // Update stock
          for (const item of order.items) {
            const game = await Game.findById(item.game);
            if (game && !game.stock.unlimited) {
              game.stock.quantity = Math.max(
                0,
                game.stock.quantity - item.quantity
              );
              if (game.stock.quantity === 0) {
                game.availability = "out-of-stock";
              }
              await game.save();
            }
          }
        }
      }
    }
    return res.status(200).send("OK");
  });

  getPaymentHistory = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const payments = await Payment.find({ user: userId })
      .populate({
        path: "order",
        populate: { path: "items.game", select: "name image" },
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Payement history fetched",
      data: payments,
    });
  });
}

export default new PaymentController();
