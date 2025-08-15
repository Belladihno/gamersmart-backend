import mongoose from "mongoose";
import helper from "../utils/helpers.js";

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      enum: ["available", "pre-order", "out-of-stock"],
      default: "available",
    },
    stock: {
      quantity: {
        type: Number,
        required: true,
        min: [0, "Stock quantity cannot be negative"],
        default: 0,
      },
      unlimited: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: {
      count: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

gameSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = helper.createSlug(this.name);

  this.slug = await helper.generateUniqueSlug(
    baseSlug,
    this.constructor,
    this._id
  );

  next();
});

gameSchema.virtual("discountPrice").get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
  }
  return this.price;
});

const Game = mongoose.model("Game", gameSchema);

export default Game;
