const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },

    runId: {
      type: String,
      required: true,
      index: true,
    },

    patternType: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      enum: ["info", "moderate", "high", "critical"],
      default: "info",
    },

    title: String,

    description: String,

    recommendation: String,

    confidence: {
      type: Number,
      default: 0,
    },

    detectionCount: {
      type: Number,
      default: 1,
    },

    firstDetectedAt: {
      type: Date,
      default: Date.now,
    },

    lastDetectedAt: {
      type: Date,
      default: Date.now,
    },

    trend: {
      type: String,
      enum: ["emerging", "stable", "improving", "degrading"],
      default: "stable",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("InfrastructureMemory", memorySchema);
