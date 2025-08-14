import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import validator from "../middlewares/validator.js";
import hashing from "../utils/hashing.js";
import catchAsync from "../utils/catchAsync.js";

class UserController {
  getProfile = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId).select(
      "firstname lastname username email verified phoneNumber fullName"
    );
    if (!user) {
      return next(new AppError("User profile not found", 404));
    }
    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user,
    });
  });

  updateProfile = catchAsync(async (req, res, next) => {
    const { firstname, lastname, username } = req.body;
    if (!firstname && !lastname && !username) {
      return next(
        new AppError("At least one field is required to update profile", 400)
      );
    }

    const { error } = validator.updateProfileSchema.validate({
      firstname,
      lastname,
      username,
    });
    if (error) {
      return next(new AppError(error.details[0].message), 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (username) {
      const existingUsername = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
        _id: { $ne: req.user._id },
      });
      if (existingUsername) {
        return next(new AppError("This username is taken!", 400));
      }
    }

    const updateData = {};
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (username) updateData.username = username;

    const updatedProfile = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("firstname lastname username email verified phoneNumber fullName");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  });

  updatePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const { error } = validator.updatePasswordSchema.validate({
      oldPassword,
      newPassword,
      confirmPassword,
    });
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user.verified) {
      return next(new AppError("user not verified", 400));
    }

    const isPassword = await hashing.doHashValidation(
      oldPassword,
      user.password
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
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password updated successfully!. Please login again.",
    });
  });
}

export default new UserController();
