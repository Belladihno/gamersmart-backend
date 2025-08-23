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
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.WEBHOOK_FRONTEND_URL
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Gamersmart API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "success",
    message: "API is operational",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.json({
    message: "Server is working",
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

app.use("/api/games", gameRoute);
app.use("/api/auth", authLimiter);
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('🔥 Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('🔥 Uncaught Exception:', err.message);
  process.exit(1);
});