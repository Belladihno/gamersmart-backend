import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Game title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
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
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    stock: {
      quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
      preOrder: {
        type: Boolean,
        default: false,
      },
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

gameSchema.virtual("discountPrice").get(function () {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// gameSchema.virtual("availabilityStatus").get(function () {
//   if (this.stock.preOrder) return "pre_order";
//   if (this.stock.quantity > 0) return "in_stock";
//   return "out_of_stock";
// });

gameSchema.index({ price: 1 });
gameSchema.index({ createdAt: -1 });
gameSchema.index({ "reviews.averageRating": -1 });

const Game = mongoose.model("Game", gameSchema);

export default Game;
