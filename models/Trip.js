const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "driver",
    },
    startingLat: {
      type: String,
      required: true,
    },
    startingLng: {
      type: String,
      required: true,
    },
    endingLat: {
      type: String,
      required: true,
    },
    endingLng: {
      type: String,
      required: true,
    },
    tripPrice: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("trip", tripSchema);
