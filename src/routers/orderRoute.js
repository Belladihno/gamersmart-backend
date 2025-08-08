import express from "express";
import OrderController from "../controllers/orderController.js";
import protect from "../../src/middlewares/protect.js";

const router = express.Router();

router.use(protect);

// GET /api/order - Get all orders
router.get("/", OrderController.getOrders);

// GET /api/order/:id - Get a order by id
router.get("/:id", OrderController.getOrder);

// POST /api/order - create an order
router.post("/", OrderController.createOder);

//PUT /api/order/:id - cancel an order
router.put("/:id", OrderController.cancelOrder);

export default router;
