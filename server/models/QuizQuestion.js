// server/models/QuizQuestion.js
// Schema for individual quiz questions with AI generation support

const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxLength: [1000, 'Question must be less than 1000 characters']
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'drag-drop', 'matching', 'scenario'],
    default: 'multiple-choice'
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    explanation: String,
    image: String
  }],
  correctIndex: {
    type: Number,
    min: 0
  },
  correctAnswer: {
    type: String,
    trim: true
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required'],
    trim: true,
    maxLength: [2000, 'Explanation must be less than 2000 characters']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  points: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'interactive'],
      default: 'image'
    },
    url: String,
    caption: String,
    alt: String
  },
  hints: [{
    text: String,
    points: {
      type: Number,
      default: 2
    }
  }],
  tags: [String],
  category: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'cyclone', 'first-aid', 'evacuation', 'communication', 'preparedness'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  region: {
    type: String,
    default: 'Punjab'
  },
  ageGroup: {
    min: {
      type: Number,
      default: 8
    },
    max: {
      type: Number,
      default: 18
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: {
    type: String,
    select: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  usageStats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number, // in seconds
      default: 0
    },
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageFeedback: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
quizQuestionSchema.index({ moduleId: 1, isActive: 1 });
quizQuestionSchema.index({ category: 1, difficulty: 1 });
quizQuestionSchema.index({ language: 1, region: 1 });
quizQuestionSchema.index({ createdBy: 1 });
quizQuestionSchema.index({ tags: 1 });
quizQuestionSchema.index({ isAIGenerated: 1 });

// Update timestamp before saving
quizQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate average feedback
  if (this.feedback && this.feedback.length > 0) {
    this.averageFeedback = this.feedback.reduce((sum, fb) => sum + fb.rating, 0) / this.feedback.length;
  }
  
  // Validate correct answer based on question type
  if (this.questionType === 'multiple-choice') {
    if (this.correctIndex === undefined || this.correctIndex < 0 || this.correctIndex >= this.options.length) {
      return next(new Error('Invalid correctIndex for multiple-choice question'));
    }
  } else if (this.questionType === 'true-false') {
    if (!this.correctAnswer || !['true', 'false'].includes(this.correctAnswer.toLowerCase())) {
      return next(new Error('Invalid correctAnswer for true-false question'));
    }
  }
  
  next();
});

// Method to add feedback
quizQuestionSchema.methods.addFeedback = function(userId, rating, comment = '') {
  // Remove existing feedback from same user
  this.feedback = this.feedback.filter(f => f.user.toString() !== userId.toString());
  
  // Add new feedback
  this.feedback.push({
    user: userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to update usage stats
quizQuestionSchema.methods.updateUsageStats = function(isCorrect, timeSpent) {
  this.usageStats.totalAttempts += 1;
  
  if (isCorrect) {
    this.usageStats.correctAttempts += 1;
  }
  
  // Update average time
  const totalTime = this.usageStats.averageTime * (this.usageStats.totalAttempts - 1);
  this.usageStats.averageTime = (totalTime + timeSpent) / this.usageStats.totalAttempts;
  
  // Calculate difficulty rating based on success rate
  const successRate = this.usageStats.correctAttempts / this.usageStats.totalAttempts;
  if (successRate >= 0.8) {
    this.usageStats.difficultyRating = 1; // Very easy
  } else if (successRate >= 0.6) {
    this.usageStats.difficultyRating = 2; // Easy
  } else if (successRate >= 0.4) {
    this.usageStats.difficultyRating = 3; // Medium
  } else if (successRate >= 0.2) {
    this.usageStats.difficultyRating = 4; // Hard
  } else {
    this.usageStats.difficultyRating = 5; // Very hard
  }
  
  return this.save();
};

// Method to get adaptive next question
quizQuestionSchema.methods.getAdaptiveNext = async function(userPerformance, moduleId) {
  const { averageScore, recentScores, timeSpent } = userPerformance;
  
  let difficulty = 'medium';
  
  // Adjust difficulty based on performance
  if (averageScore >= 80) {
    difficulty = 'hard';
  } else if (averageScore <= 50) {
    difficulty = 'easy';
  }
  
  // Find next question with appropriate difficulty
  const nextQuestion = await this.constructor.findOne({
    moduleId,
    difficulty,
    isActive: true,
    _id: { $ne: this._id }
  }).sort({ 'usageStats.totalAttempts': 1 }); // Prefer less used questions
  
  return nextQuestion;
};

// Static method to find questions by module
quizQuestionSchema.statics.findByModule = function(moduleId, options = {}) {
  const { difficulty, limit = 10, randomize = false } = options;
  
  let query = { moduleId, isActive: true };
  if (difficulty) query.difficulty = difficulty;
  
  let queryBuilder = this.find(query);
  
  if (randomize) {
    queryBuilder = queryBuilder.sort({ _id: 1 }); // Use _id for pseudo-random
  }
  
  return queryBuilder.limit(limit);
};

// Static method to generate quiz set
quizQuestionSchema.statics.generateQuizSet = function(moduleId, options = {}) {
  const {
    totalQuestions = 10,
    easyCount = 3,
    mediumCount = 4,
    hardCount = 3,
    timeLimit = 600 // 10 minutes
  } = options;
  
  return Promise.all([
    this.findByModule(moduleId, { difficulty: 'easy', limit: easyCount, randomize: true }),
    this.findByModule(moduleId, { difficulty: 'medium', limit: mediumCount, randomize: true }),
    this.findByModule(moduleId, { difficulty: 'hard', limit: hardCount, randomize: true })
  ]).then(([easy, medium, hard]) => {
    const allQuestions = [...easy, ...medium, ...hard];
    
    // Shuffle questions
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    
    return allQuestions.slice(0, totalQuestions);
  });
};

// Static method to get question statistics
quizQuestionSchema.statics.getQuestionStats = function(moduleId) {
  return this.aggregate([
    { $match: { moduleId: mongoose.Types.ObjectId(moduleId), isActive: true } },
    {
      $group: {
        _id: '$difficulty',
        totalQuestions: { $sum: 1 },
        totalAttempts: { $sum: '$usageStats.totalAttempts' },
        averageSuccessRate: {
          $avg: {
            $cond: [
              { $gt: ['$usageStats.totalAttempts', 0] },
              { $divide: ['$usageStats.correctAttempts', '$usageStats.totalAttempts'] },
              0
            ]
          }
        },
        averageTime: { $avg: '$usageStats.averageTime' }
      }
    }
  ]);
};

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

module.exports = QuizQuestion;
