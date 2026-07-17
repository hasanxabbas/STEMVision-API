const express = require("express");
const router = express.Router();

const upload = require("../config/multer");
const verifyToken = require("../middleware/auth.middleware");

const {
  getAllLessons,
  getLatestLesson,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lesson.controller");

// Get all lessons
router.get("/", getAllLessons);

// Get latest lesson
router.get("/latest", getLatestLesson);

// Upload Lesson File (Protected)
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      res.status(200).json({
  success: true,
  message: "File uploaded successfully",
  fileUrl: `/uploads/${req.file.filename}`,
  file: req.file,
});
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Get lesson by ID
router.get("/:id", getLessonById);

// Create a new lesson
router.post("/", verifyToken, createLesson);

// Update lesson
router.put("/:id", updateLesson);

// Delete lesson
router.delete("/:id", deleteLesson);

module.exports = router;