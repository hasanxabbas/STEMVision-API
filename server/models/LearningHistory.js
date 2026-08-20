const mongoose = require("mongoose");

const learningHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: ["ai_chat", "lesson", "quiz", "diagram", "summary"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: false,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: false,
    },
    details: {
      score: {
        type: Number,
        required: false,
      },
      totalQuestions: {
        type: Number,
        required: false,
      },
      chatHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChatHistory",
        required: false,
      },
      category: {
        type: String,
        required: false,
      },
      fileUrl: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LearningHistory", learningHistorySchema);
