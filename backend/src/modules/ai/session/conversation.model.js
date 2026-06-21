const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
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

    runId: {
      type: String,
      required: true,
      index: true,
    },

    skill: {
      type: String,
      default: "askChaosForge",
    },

    title: {
      type: String,
      default: "ChaosForge Conversation",
    },

    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["system", "user", "assistant"],
          required: true,
        },

        content: {
          type: String,
          required: true,
        },

        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AIConversation", conversationSchema);
