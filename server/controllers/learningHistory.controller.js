const LearningHistory = require("../models/LearningHistory");

// Get all learning history for the authenticated user
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await LearningHistory.find({ user: userId })
      .populate("subject")
      .populate("lessonId")
      .populate("details.chatHistoryId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Log a manual learning activity (e.g. lesson viewed, PDF summary read)
const logActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, title, subjectId, lessonId, details } = req.body;

    if (!activityType || !title) {
      return res.status(400).json({
        success: false,
        message: "Activity type and title are required.",
      });
    }

    // Avoid logging duplicate lesson views on the same calendar day
    if (activityType === "lesson" && lessonId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existing = await LearningHistory.findOne({
        user: userId,
        activityType: "lesson",
        lessonId,
        createdAt: { $gte: startOfDay },
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Activity already logged for today.",
          data: existing,
        });
      }
    }

    const activity = await LearningHistory.create({
      user: userId,
      activityType,
      title,
      subject: subjectId || undefined,
      lessonId: lessonId || undefined,
      details,
    });

    res.status(201).json({
      success: true,
      message: "Activity logged successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getHistory,
  logActivity,
};
