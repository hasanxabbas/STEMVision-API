const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth.middleware");
const {
  getHistory,
  logActivity,
} = require("../controllers/learningHistory.controller");

// Retrieve authenticated student timeline feed
router.get("/", verifyToken, getHistory);

// Log chronological action items
router.post("/log", verifyToken, logActivity);

module.exports = router;
