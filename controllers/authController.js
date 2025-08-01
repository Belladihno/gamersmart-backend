import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import validator from "../middlewares/validator.js";
import hashing from "../utils/hashing.js";
import signToken from "../utils/signToken.js";
import crypto from "crypto";
import emailService from "../services/emailService.js";

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
        role: "user", // default role
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

  async sendVerificationCode(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      if (existingUser.verified) {
        return next(new AppError("user already verified", 409));
      }
      // const oneMinuteAgo = Date.now() - 1 * 60 * 1000;
      // if (
      //   existingUser.verificationCodeValidation &&
      //   existingUser.verificationCodeValidation > oneMinuteAgo
      // ) {
      //   return next(
      //     new AppError("Please wait before requesting another code", 429)
      //   );
      // }
      const emailCode = crypto.randomInt(100000, 1000000).toString();
      let info = await emailService.sendEmail({
        to: email,
        subject: "Email Verification",
        html: `<h1>Verify Your Email</h1>
         <p>Your verification code is: <strong>${emailCode}</strong></p>
         <p>This code will expire in 5 minutes.</p>
         <p>If you didn't request this code, please ignore this email.</p>`,
      });
      if (info.accepted[0] === existingUser.email) {
        const hashedEmailCode = hashing.hmacProcess(
          emailCode,
          process.env.HMAC_VERIFICATION_CODE_SECRET
        );
        existingUser.verificationCode = hashedEmailCode;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: "Code sent",
        });
      }
      return next(new AppError("Code sent failed", 400));
    } catch (error) {
      return next(
        new AppError(`send verification code failed: ${error.message}`, 500)
      );
    }
  }

  async verifyVericationCode(req, res, next) {
    try {
      const { email, emailCode } = req.body;
      const { error } = validator.acceptCodeSchema.validate({
        email,
        emailCode,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const codeValue = emailCode.toString();
      const existingUser = await User.findOne({ email }).select(
        "+verificationCode +verificationCodeValidation"
      );
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      if (
        !existingUser.verificationCode ||
        !existingUser.verificationCodeValidation
      ) {
        return next(
          new AppError("Please request a new verification code", 400)
        );
      }

      if (
        Date.now() -
          new Date(existingUser.verificationCodeValidation).getTime() >
        5 * 60 * 1000
      ) {
        return next(
          new AppError(
            "Verification code has expired. Please request a new one",
            400
          )
        );
      }
      const hashedEmailCode = hashing.hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      if (hashedEmailCode === existingUser.verificationCode) {
        existingUser.verified = true;
        existingUser.verificationCode = undefined;
        existingUser.verificationCodeValidation = undefined;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: "Your account has been verified",
        });
      }
      return next(new AppError("unexpexted error occured!", 400));
    } catch (error) {
      return next(
        new AppError(`verify verification code failed: ${error.message}`, 500)
      );
    }
  }

  async sendForgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      const emailCode = crypto.randomInt(100000, 1000000).toString();
      let info = await emailService.sendEmail({
        to: email,
        subject: "Password Reset Code",
        html: `<h1>Password rest</h1>
         <p>Your password reset code is: <strong>${emailCode}</strong></p>
         <p>This code will expire in 5 minutes.</p>
         <p>If you didn't request this code, please ignore this email.</p>`,
      });
      if (info.accepted[0] === existingUser.email) {
        const hashedEmailCode = hashing.hmacProcess(
          emailCode,
          process.env.HMAC_VERIFICATION_CODE_SECRET
        );
        existingUser.forgotPasswordCode = hashedEmailCode;
        existingUser.forgotPasswordCodeValidation = Date.now();
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: "Code sent",
        });
      }
      return next(new AppError("Code sent failed", 400));
    } catch (error) {
      return next(
        new AppError(`send forgot password code failed: ${error.message}`, 500)
      );
    }
  }

  async verifyForgotPasswordCode(req, res, next) {
    try {
      const { email, emailCode, newPassword } = req.body;
      const { error } = validator.acceptForgotCodeSchema.validate({
        email,
        emailCode,
        newPassword,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const codeValue = emailCode.toString();
      const existingUser = await User.findOne({ email }).select(
        "+forgotPasswordCode +forgotPasswordCodeValidation"
      );
      if (!existingUser) {
        return next(new AppError("user does not exist", 404));
      }
      if (
        !existingUser.forgotPasswordCode ||
        !existingUser.forgotPasswordCodeValidation
      ) {
        return next(
          new AppError("Please request a new password reset code", 400)
        );
      }

      if (
        Date.now() -
          new Date(existingUser.forgotPasswordCodeValidation).getTime() >
        5 * 60 * 1000
      ) {
        return next(
          new AppError(
            "Password reset code has expired. Please request a new one",
            400
          )
        );
      }
      const hashedEmailCode = hashing.hmacProcess(
        codeValue,
        process.env.HMAC_FORGOT_PASSWORD_SECRET
      );
      if (hashedEmailCode === existingUser.forgotPasswordCode) {
        const hashedPassword = await hashing.doHash(newPassword, 12);
        existingUser.password = hashedPassword;
        existingUser.passwordChangedAt = new Date();
        existingUser.forgotPasswordCode = undefined;
        existingUser.forgotPasswordCodeValidation = undefined;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: "Password updated!",
        });
      }
      return next(new AppError("unexpexted error occured!", 400));
    } catch (error) {
      return next(
        new AppError(
          `verify forgot password code failed: ${error.message}`,
          500
        )
      );
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const { error } = validator.resetPasswordSchema.validate({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      if (error) {
        return next(new AppError(error.details[0].message, 400));
      }
      const userId = req.user._id;
      if (!userId) {
        return next(new AppError("user not authenticated", 401));
      }
      if (!req.user.verified) {
        return next(new AppError("user not verified", 400));
      }
      const existingUser = await User.findById(userId).select("+password");
      
      const isPassword = await hashing.doHashValidation(
        oldPassword,
        existingUser.password
      );
      if (!isPassword) {
        return next(new AppError("Invalid credentials", 401));
      }
      
      if (oldPassword === newPassword) {
        return next(
          new AppError("New password must be different from old password", 400)
        );
      }
      if (newPassword !== confirmPassword) {
        return next(new AppError("Password does not match", 400));
      }
      const hashedPassword = await hashing.doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      existingUser.passwordChangedAt = new Date();
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "Password updated successfully!. Please login again.",
      });
    } catch (error) {
      return next(new AppError(`Reset password failed: ${error.message}`, 500));
    }
  }
}

export default new AuthController();
