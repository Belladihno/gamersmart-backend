import express from "express";
import OrderController from "../controllers/orderController.js";
import auth from "../../src/middlewares/protect.js";

const router = express.Router();

router.use(auth.protect);

// GET /api/order - Get all orders
router.get("/", auth.isVerified, OrderController.getOrders);

// GET /api/order/:id - Get a order by id
router.get("/:id", auth.isVerified, OrderController.getOrder);

// POST /api/order - create an order
router.post("/", auth.isVerified, OrderController.createOder);

//PUT /api/order/:id - cancel an order
router.put("/:id", auth.isVerified, OrderController.cancelOrder);

export default router;
