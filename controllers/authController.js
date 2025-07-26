import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import validator from "../middlewares/validator.js";
import jwt from "jsonwebtoken";
import hashing from "../utils/hashing.js";

const signToken = (id, email) => {
  return jwt.sign({ userId: id, email }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

class AuthController {
  async signup(req, res, next) {
    try {
      const { firstname, lastname, username, email, password } = req.body;
      const { error } = validator.signUpSchema.validate({
        firstname,
        lastname,
        username,
        email,
        password,
      });
      if (error) {
        return next(new AppError(error.details[0].message), 400);
      }
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const existingField =
          existingUser.email === email ? "email" : "username";
        return next(
          new AppError(`User with this ${existingField} already exists`, 409)
        );
      }
      const hashedPassword = await hashing.doHash(password, 12);
      const newUser = await User.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
      });
      const token = signToken(newUser._id, newUser.email);
      res.cookie("Authorization", `Bearer ${token}`, {
        maxAge: process.env.AUTH_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      const userWithoutPassword = { ...newUser.toObject() };
      delete userWithoutPassword.password;

      return res.status(201).json({
        success: true,
        message: "sign up successful",
        token,
        data: userWithoutPassword,
      });
    } catch (error) {
      return next(new AppError(`signup failed: ${error.message}`, 500));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { error } = validator.logInSchema.validate({
        email,
        password,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const existingUser = await User.findOne({ email }).select("+password");
      if (
        !existingUser ||
        !(await hashing.doHashValidation(password, existingUser.password))
      ) {
        return next(new AppError("Invalid email or password", 401));
      }
      const token = signToken(existingUser._id, existingUser.email);
      res.cookie("Authorization", `Bearer ${token}`, {
        maxAge: process.env.AUTH_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      const userWithoutPassword = { ...existingUser.toObject() };
      delete userWithoutPassword.password;

      return res.status(200).json({
        success: true,
        message: "login successful",
        token,
        data: userWithoutPassword,
      });
    } catch (error) {
      return next(new AppError(`login failed: ${error.message}`, 500));
    }
  }
  async logout(req, res, next) {
    try {
      res.clearCookie("Authorization", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(200).json({
        success: true,
        message: "logout successfull",
      });
    } catch (error) {
      return next(new AppError(`logout failed: ${error.message}`, 500));
    }
  }
}

export default new AuthController();
