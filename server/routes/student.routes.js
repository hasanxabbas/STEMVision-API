const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/student.controller");

// Get all study progress
router.get("/", getAllStudents);

// Get study progress by ID
router.get("/:id", getStudentById);

// Create study progress
router.post("/", createStudent);

// Update study progress
router.put("/:id", updateStudent);

// Delete study progress
router.delete("/:id", deleteStudent);

module.exports = router;