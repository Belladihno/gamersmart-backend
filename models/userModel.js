import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    // address: [
    //   {
    //     type: {
    //       type: String,
    //       enum: ["shipping", "billing"],
    //       required: true,
    //     },
    //     street: { type: String, required: true },
    //     city: { type: String, required: true },
    //     state: { type: String, required: true },
    //     zipCode: { type: String, required: true },
    //     country: { type: String, required: true, default: "US" },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
