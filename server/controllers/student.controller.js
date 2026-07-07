const StudyProgress = require("../models/StudyProgress");

// Get all study progress
const getAllStudents = async (req, res) => {
  try {
    const progress = await StudyProgress.find()
      .populate("student")
      .populate("subject")
      .populate("lessons.lesson");

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get study progress by ID
const getStudentById = async (req, res) => {
  try {
    const progress = await StudyProgress.findById(req.params.id)
      .populate("student")
      .populate("subject")
      .populate("lessons.lesson");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Study progress not found",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create study progress
const createStudent = async (req, res) => {
  try {
    const progress = await StudyProgress.create(req.body);

    res.status(201).json({
      success: true,
      message: "Study progress created successfully",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update study progress
const updateStudent = async (req, res) => {
  try {
    const progress = await StudyProgress.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Study progress not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study progress updated successfully",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete study progress
const deleteStudent = async (req, res) => {
  try {
    const progress = await StudyProgress.findByIdAndDelete(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Study progress not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Study progress deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};