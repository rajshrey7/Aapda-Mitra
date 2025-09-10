const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  explanation: String,
  points: {
    type: Number,
    default: 10
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  media: {
    type: String,
    default: null
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'cyclone', 'general', 'first-aid'],
    required: true
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in minutes
    default: 15
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    type: String,
    enum: ['student', 'teacher', 'all'],
    default: 'all'
  },
  region: {
    type: String,
    default: 'Punjab'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points before saving
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 10), 0);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to update average score
quizSchema.methods.updateAverageScore = function(newScore) {
  const totalScores = this.averageScore * this.attempts;
  this.attempts += 1;
  this.averageScore = (totalScores + newScore) / this.attempts;
  return this.save();
};

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;