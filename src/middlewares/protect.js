import jwt from "jsonwebtoken";
import { promisify } from "util";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

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

const protect = catchAsync(async (req, res, next) => {
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
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("You must be logged in to access this resource", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError("You must be logged in to access this resource", 401)
    );
  }

  if (req.user.role !== "admin") {
    return next(new AppError("Access denied. Admin privileges required.", 403));
  }

  next();
};

const checkOwnership = (Model, resourceIdParam = "id") => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params[resourceIdParam];
    const resource = await Model.findById(resourceId);

    if (!resource) {
      return next(new AppError("Resource not found", 404));
    }

    if (
      resource.user?.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return next(
        new AppError("You do not have permission to access this resource", 403)
      );
    }

    req.resource = resource;
    next();
  });
};

const isVerified = (req, res, next) => {
  if (req.user.verified !== true) {
    return next(
      new AppError("You must be verified to access this resource", 401)
    );
  }
  next();
};

export default { protect, adminOnly, restrictTo, checkOwnership, isVerified };
