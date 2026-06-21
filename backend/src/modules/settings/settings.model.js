const mongoose = require("mongoose");
const DEFAULT_SETTINGS = require("./settings.defaults");

const settingsSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    appearance: {
      theme: {
        type: String,
        enum: ["dark", "light"],
        default: DEFAULT_SETTINGS.appearance.theme,
      },

      accentColor: {
        type: String,
        default: DEFAULT_SETTINGS.appearance.accentColor,
      },
    },

    simulationDefaults: {
      method: {
        type: String,
        default: "GET",
      },

      url: {
        type: String,
        default: "",
      },

      headers: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      authToken: {
        type: String,
        default: "",
      },

      contentType: {
        type: String,
        default: "application/json",
      },

      payload: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      rps: {
        type: Number,
        default: DEFAULT_SETTINGS.simulationDefaults.rps,
      },

      duration: {
        type: Number,
        default: DEFAULT_SETTINGS.simulationDefaults.duration,
      },

      concurrency: {
        type: Number,
        default: DEFAULT_SETTINGS.simulationDefaults.concurrency,
      },

      totalRequests: {
        type: Number,
        default: DEFAULT_SETTINGS.simulationDefaults.totalRequests,
      },
    },

    notifications: {
      email: {
        type: Boolean,
        default: DEFAULT_SETTINGS.notifications.email,
      },

      simulationCompleted: {
        type: Boolean,
        default: DEFAULT_SETTINGS.notifications.simulationCompleted,
      },

      weeklyReport: {
        type: Boolean,
        default: DEFAULT_SETTINGS.notifications.weeklyReport,
      },
    },

    ai: {
      provider: {
        type: String,
        default: DEFAULT_SETTINGS.ai.provider,
      },

      mode: {
        type: String,
        enum: ["automatic", "fast", "balanced", "deep", "custom"],
        default: DEFAULT_SETTINGS.ai.mode,
      },

      model: {
        type: String,
        default: DEFAULT_SETTINGS.ai.model,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Settings", settingsSchema);
