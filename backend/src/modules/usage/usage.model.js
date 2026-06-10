const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: true,
  },

  projectsCreated: {
    type: Number,
    default: 0,
  },

  simulationsExecuted: {
    type: Number,
    default: 0,
  },

  peakRpsUsed: {
    type: Number,
    default: 0,
  },

  maxDurationUsed: {
    type: Number,
    default: 0,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Usage", usageSchema);
