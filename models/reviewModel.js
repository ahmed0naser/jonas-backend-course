const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: { String, required: [true, `review can't be empty`] },
    ratings: { Number, min: 1, max: 5 },
    createdAt: { Date, default: Date.now },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belong to tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
