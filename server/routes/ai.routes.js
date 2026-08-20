const express = require('express');
const upload = require('../config/multer');
const verifyToken = require('../middleware/auth.middleware');
const {
  tutorController,
  visionController,
  quizController,
  speechController,
  getChatSessions,
  getChatSessionById,
} = require('../controllers/ai.controller');

const router = express.Router();

// AI Tutor - Chat concept assistant (Authenticated)
router.post('/tutor', verifyToken, tutorController);

// AI Vision - Explain diagrams/images (Authenticated, expects file on "image" key)
router.post('/vision', verifyToken, upload.single('image'), visionController);

// AI Chat Logs queries (Authenticated)
router.get('/chats', verifyToken, getChatSessions);
router.get('/chats/:id', verifyToken, getChatSessionById);

// AI Quiz Generator
router.post('/quiz', quizController);

// AI Text-to-Speech placeholder
router.post('/speech', speechController);

module.exports = router;