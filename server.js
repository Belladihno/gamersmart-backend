import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// import rateLimit from "express-rate-limit";
import compression from "compression";
import connectDB from "./config/db.js";
import gameRoute from "./routers/gameRoute.js";
import authRoute from "./routers/authRoute.js";
import userRoute from "./routers/userRoute.js";
import cartRoute from "./routers/cartRoute.js";
import orderRoute from "./routers/orderRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/appError.js";

dotenv.config();
const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Server is working", timestamp: new Date() });
});

app.use("/api/games", gameRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);

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
