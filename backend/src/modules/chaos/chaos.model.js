const mongoose = require("mongoose");

const chaosSchema = new mongoose.Schema(
  {
    profile: {
      type: String,
      enum: ["custom", "latency", "network", "failure", "stress"],
      default: "custom",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    projectId: {
      type: String,
      required: true,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    failureRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    latency: {
      enabled: {
        type: Boolean,
        default: false,
      },

      min: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        default: 0,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    statusCode: {
      enabled: {
        type: Boolean,
        default: false,
      },

      codes: {
        type: [Number],
        default: [500],
      },
    },

    timeout: {
      enabled: {
        type: Boolean,
        default: false,
      },

      duration: {
        type: Number,
        default: 5000,
        min: 1,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    packetLoss: {
      enabled: {
        type: Boolean,
        default: false,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    connectionReset: {
      enabled: {
        type: Boolean,
        default: false,
      },

      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  },
);

chaosSchema.index(
  {
    owner: 1,
    projectId: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Chaos", chaosSchema);
