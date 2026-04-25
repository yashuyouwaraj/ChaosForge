const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  email: String,
  plan: String,
  amount: Number,
  status: String,
  sessionId: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema)