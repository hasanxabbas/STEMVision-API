const express = require("express");
const router = express.Router();
const { PdfReader } = require("pdfreader");

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

const jwt = require("jsonwebtoken");

const optionalVerifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // ignore error
  }
  next();
};

// Get all lessons
router.get("/", optionalVerifyToken, getAllLessons);

// Get latest lesson
router.get("/latest", optionalVerifyToken, getLatestLesson);

// Upload Lesson File (Protected)
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      let lessonContent = "";

      if (req.file.mimetype === "application/pdf") {
        try {
          lessonContent = await new Promise((resolve) => {
            let text = "";
            new PdfReader().parseFileItems(req.file.path, (err, item) => {
              if (err) {
                console.error("PDF Parsing Error:", err);
                resolve("");
              } else if (!item) {
                resolve(text.trim().substring(0, 15000));
              } else if (item.text) {
                text += item.text + " ";
              }
            });
          });
          console.log(`PDF extracted successfully (${lessonContent.length} characters)`);
        } catch (pdfError) {
          console.error("PDF Parsing Error:", pdfError);
          lessonContent = "";
        }
      }

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        fileUrl: `/uploads/${req.file.filename}`,
        file: req.file,
        lessonContent: lessonContent,
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