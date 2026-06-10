const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  email: {
    type: String,
    index: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  plan: {
    type: String,
    enum: ["pro", "enterprise"],
    required: true,
  },
  amount: Number,
  status: String,
  currency: String,
  stripeEventId: {
    type: String,
    unique: true,
    sparse: true,
  },
  sessionId: {
    type: String,
    unique: true,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
