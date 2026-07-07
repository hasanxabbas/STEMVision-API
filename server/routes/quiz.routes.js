const express = require("express");
const router = express.Router();

const {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quiz.controller");

// Get all quizzes
router.get("/", getAllQuizzes);

// Get quiz by ID
router.get("/:id", getQuizById);

// Create quiz
router.post("/", createQuiz);

// Update quiz
router.put("/:id", updateQuiz);

// Delete quiz
router.delete("/:id", deleteQuiz);

module.exports = router;