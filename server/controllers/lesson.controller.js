const Lesson = require("../models/Lesson");

// Get all lessons (Filtered by student's branch)
const getAllLessons = async (req, res) => {
  try {
    let query = {};

    if (req.query.subjectId) {
      query.subject = req.query.subjectId;
    }

    // Branch filtering for students or if explicit branch is passed
    const userRole = req.user?.role?.toLowerCase();
    const userBranch = req.user?.branch;
    const requestedBranch = req.query.branch || userBranch;

    if (userRole === "student" && requestedBranch) {
      query.$or = [
        { branch: requestedBranch },
        { branch: "General" },
        { branch: "All Branches" },
        { branch: "" },
        { branch: { $exists: false } },
      ];
    } else if (req.query.branch) {
      query.branch = req.query.branch;
    }


    console.log("LESSON DEBUG:", {
  user: req.user,
  query: JSON.stringify(query),
});


    const lessons = await Lesson.find(query)
      .populate("subject", "name")
      .populate("teacher", "name");

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get latest lesson (Filtered by student's branch)
const getLatestLesson = async (req, res) => {
  try {
    let query = {};
    const userRole = req.user?.role?.toLowerCase();
    const userBranch = req.user?.branch;

    if (userRole === "student" && userBranch) {
      query.$or = [
        { branch: userBranch },
        { branch: "General" },
        { branch: "All Branches" },
        { branch: "" },
        { branch: { $exists: false } },
      ];
    }

    const lesson = await Lesson.findOne(query)
      .sort({ createdAt: -1 })
      .populate("subject", "name")
      .populate("teacher", "name");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "No lessons found",
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get lesson by ID
const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create lesson
const createLesson = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      difficulty,
      branch,
      fileUrl,
      lessonContent,
    } = req.body;

    // Map frontend difficulty to schema values
    const difficultyMap = {
      beginner: "Easy",
      intermediate: "Medium",
      advanced: "Hard",
    };

    const lesson = await Lesson.create({
      title,
      description,
      subject,
      aiDifficulty: difficultyMap[difficulty] || "Medium",
      branch: branch || req.user?.branch || "General",
      fileUrl,
      lessonContent: lessonContent || "",
      teacher: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update lesson
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete lesson
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllLessons,
  getLatestLesson,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};