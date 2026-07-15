const mongoose = require('mongoose');

const AnalysisHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: false,
  },
  category: {
    type: String,
    enum: ['diagram', 'equation', 'graph', 'code', 'whiteboard'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: false,
  },
  analysisResult: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnalysisHistory', AnalysisHistorySchema);
