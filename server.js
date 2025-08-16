import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import connectDB from "./src/config/db.js";
import gameRoute from "./src/routers/gameRoute.js";
import authRoute from "./src/routers/authRoute.js";
import userRoute from "./src/routers/userRoute.js";
import cartRoute from "./src/routers/cartRoute.js";
import orderRoute from "./src/routers/orderRoute.js";
import reviewRoute from "./src/routers/reviewRoute.js";
import paymentRoute from "./src/routers/paymentRoute.js";
import { swaggerDocument, swaggerUi } from "./swagger.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import AppError from "./src/utils/appError.js";

dotenv.config();
const app = express();
connectDB();

app.use(helmet());

app.use(
  cors({
    origin: process.env.WEBHOOK_FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many attempts, please try again later.",
  },
});

app.use(limiter);

app.use(morgan("dev"));
app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Server is working", timestamp: new Date() });
});

app.use("/api/games", gameRoute);
app.use("api/auth", authLimiter);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
app.use("/api/review", reviewRoute);
app.use("/api/payment", paymentRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
