const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "ai"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        image: {
          type: String, // Stored as image URL/path (e.g. /uploads/12345.png)
          required: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      type: String,
      required: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatHistory", chatHistorySchema);