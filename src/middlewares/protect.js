import jwt from "jsonwebtoken";
import { promisify } from "util";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";

const extractToken = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  return token;
};

const verifyToken = async (token) => {
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  return decoded;
};

const validateUser = async (userId) => {
  const currentUser = await User.findById(userId).select(
    "+active +passwordChangedAt"
  );

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token no longer exist.",
      401
    );
  }

  if (currentUser.active === false) {
    throw new AppError(
      "Your account has been deactivated. Please contact support.",
      401
    );
  }

  return currentUser;
};

const changedPasswordAfterToken = (user, tokenCreatedTime) => {
  if (user.passwordChangedAt) {
    const passwordChangeTime = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    return tokenCreatedTime < passwordChangeTime;
  }
  return false;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decodedToken = await verifyToken(token);
    const currentUser = await validateUser(decodedToken.id);

    if (changedPasswordAfterToken(currentUser, decodedToken.iat)) {
      return next(
        new AppError("Password was recently changed. Please login again", 401)
      );
    }

    req.user = currentUser;
    req.token = token;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError(`Authentication failed: ${error.message}`, 500));
  }
};

export default protect;
