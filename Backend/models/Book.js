const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      enum: [
        "Arts & Photography",
        "Fiction",
        "Non Fiction & Biography",
        "Educational Textbook",
        "Magazines & Comics",
        "Technology",
        "Romance",
        "Other",
      ],
    },
    description: { type: String },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Used", "Acceptable"],
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delivery: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Declined"],
      default: "Pending",
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    sold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
