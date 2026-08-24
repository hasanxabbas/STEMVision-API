const { getTutorResponse } = require('../ai/tutor');
const { analyzeVision } = require('../ai/vision');
const { generateQuiz } = require('../ai/quiz');
const AnalysisHistory = require('../models/AnalysisHistory');
const Lesson = require('../models/Lesson');
const ChatHistory = require('../models/ChatHistory');
const LearningHistory = require('../models/LearningHistory');
const fs = require('fs');

/**
 * AI Tutor - Chat concept assistant
 * POST /api/ai/tutor
 */
async function tutorController(req, res) {
  try {
    const { message, lessonId, lessonContext, chatHistoryId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message parameter is required.",
      });
    }

    let context = lessonContext || "";
    let subjectId = null;

    // Automatically load lesson content and subjectId from MongoDB
    if (lessonId) {
      try {
        const lesson = await Lesson.findById(lessonId);
        if (lesson) {
          subjectId = lesson.subject;
          if (lesson.lessonContent) {
            context = lesson.lessonContent;
          }
        }
      } catch (dbError) {
        console.warn("Could not load lesson details:", dbError.message);
      }
    }

    let chatSession;
    let historyMessages = [];

    if (chatHistoryId) {
      // Find existing chat session and load history
      chatSession = await ChatHistory.findOne({ _id: chatHistoryId, user: userId });
      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: "Chat session not found.",
        });
      }
      historyMessages = chatSession.messages || [];
    }

    // Call AI Tutor with full session history
    const answer = (await getTutorResponse(message, context, historyMessages)) || "No response received.";

    // Save/Update Conversation in Database
    if (chatSession) {
      // Append user query and AI response
      chatSession.messages.push({ sender: 'user', text: message });
      chatSession.messages.push({ sender: 'ai', text: answer });
      chatSession.lastMessage = answer;
      chatSession.lastActivity = new Date();
      await chatSession.save();
    } else {
      // Generate clean title based on first query
      const cleanTitle = message.trim().substring(0, 40) + (message.trim().length > 40 ? "..." : "");
      
      chatSession = await ChatHistory.create({
        user: userId,
        lesson: lessonId || undefined,
        title: cleanTitle,
        messages: [
          { sender: 'user', text: message },
          { sender: 'ai', text: answer }
        ],
        lastMessage: answer,
        lastActivity: new Date(),
      });

      // Automatically log the activity in student's LearningHistory timeline
      await LearningHistory.create({
        user: userId,
        activityType: 'ai_chat',
        title: cleanTitle,
        subject: subjectId || undefined,
        lessonId: lessonId || undefined,
        details: {
          chatHistoryId: chatSession._id,
        }
      });
    }

    return res.status(200).json({
      success: true,
      answer,
      chatHistoryId: chatSession._id,
    });
  } catch (error) {
    console.error("Error in tutorController:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve AI Tutor response.",
      error: error.message,
    });
  }
}

/**
 * AI Vision - Analyze uploaded diagram/equation/graph/code/whiteboard
 * POST /api/ai/vision
 */
async function visionController(req, res) {
  try {
    const file = req.file;
    const { context, lessonId, chatHistoryId } = req.body;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please upload a file using the "image" field.',
      });
    }

    const fileUrl = `/uploads/${file.filename}`;
    const fileBuffer = fs.readFileSync(file.path);
    const base64Image = fileBuffer.toString('base64');

    const analysisResult = await analyzeVision(
      base64Image,
      file.mimetype,
      context
    );

    let subjectId = null;
    if (lessonId) {
      try {
        const lesson = await Lesson.findById(lessonId);
        if (lesson) {
          subjectId = lesson.subject;
        }
      } catch (dbError) {
        console.warn("Could not query Lesson details for vision:", dbError.message);
      }
    }

    const textPrompt = context || 'Please explain this diagram.';
    const explanationText = `${analysisResult.summary}\n\n${analysisResult.description}`;

    let chatSession;
    if (chatHistoryId) {
      chatSession = await ChatHistory.findOne({ _id: chatHistoryId, user: userId });
      if (chatSession) {
        chatSession.messages.push({
          sender: 'user',
          text: textPrompt,
          image: fileUrl,
        });
        chatSession.messages.push({
          sender: 'ai',
          text: explanationText,
        });
        chatSession.lastMessage = explanationText;
        chatSession.lastActivity = new Date();
        await chatSession.save();
      }
    } else {
      // Save diagram activity log
      await LearningHistory.create({
        user: userId,
        activityType: 'diagram',
        title: `Diagram Explained: ${file.originalname}`,
        subject: subjectId || undefined,
        lessonId: lessonId || undefined,
        details: {
          fileUrl,
          category: 'diagram',
        }
      });
    }

    return res.status(200).json({
      success: true,
      description: analysisResult.description,
      summary: analysisResult.summary,
      fileUrl,
      chatHistoryId: chatSession ? chatSession._id : undefined,
    });
  } catch (error) {
    console.error('Error in visionController:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete AI Vision analysis.',
      error: error.message,
    });
  }
}

/**
 * AI Quiz - Generate multiple-choice quiz questions based on lesson content
 * POST /api/ai/quiz
 */
async function quizController(req, res) {
  try {
    const { lessonId, numberOfQuestions } = req.body;

    let lessonTitle = 'General STEM Study Guide';
    let lessonDescription = 'Self-study questionnaire';

    if (lessonId) {
      try {
        const lesson = await Lesson.findById(lessonId);

        if (lesson) {
          lessonTitle = lesson.title;
          lessonDescription = lesson.description || lesson.title;
        }
      } catch (dbError) {
        console.warn(
          'Could not query Lesson collection from DB, using defaults:',
          dbError.message
        );
      }
    }

    const quizResult = await generateQuiz(
      lessonTitle,
      lessonDescription,
      numberOfQuestions || 5
    );

    return res.status(200).json({
      success: true,
      questions: quizResult.questions || [],
    });
  } catch (error) {
    console.error('Error in quizController:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate quiz.',
      error: error.message,
    });
  }
}

/**
 * AI Text-to-Speech - Server-side TTS endpoint placeholder
 * POST /api/ai/speech
 */
async function speechController(req, res) {
  try {
    return res.status(200).json({
      success: true,
      message:
        'AI Text-to-Speech API placeholder is working. Note: Client uses Web Speech API.',
    });
  } catch (error) {
    console.error('Error in speechController:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to process speech endpoint.',
      error: error.message,
    });
  }
}

// Get all chat sessions for sidebar (populates lastMessage and lastActivity)
async function getChatSessions(req, res) {
  try {
    const userId = req.user.id;
    const chats = await ChatHistory.find({ user: userId })
      .select('title lastMessage lastActivity lesson')
      .populate('lesson', 'title')
      .sort({ lastActivity: -1 });

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get single chat session with full messages
async function getChatSessionById(req, res) {
  try {
    const userId = req.user.id;
    const chat = await ChatHistory.findOne({ _id: req.params.id, user: userId })
      .populate('lesson');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat history session not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  tutorController,
  visionController,
  quizController,
  speechController,
  getChatSessions,
  getChatSessionById,
};