// server/models/DrillResult.js
// Schema for drill results with AI analysis and performance tracking

const mongoose = require('mongoose');

const drillResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  drillType: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'cyclone', 'evacuation', 'first-aid', 'communication'],
    required: true
  },
  drillMode: {
    type: String,
    enum: ['vr', 'simulation', 'physical', 'quiz'],
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession'
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  performance: {
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    speed: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    safety: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    teamwork: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    decisionMaking: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  totalTime: {
    type: Number, // in seconds
    required: true
  },
  completedSteps: [{
    stepId: String,
    stepName: String,
    completed: Boolean,
    timeSpent: Number,
    score: Number,
    feedback: String
  }],
  missedSteps: [{
    stepId: String,
    stepName: String,
    importance: {
      type: String,
      enum: ['critical', 'important', 'optional'],
      default: 'important'
    },
    impact: String
  }],
  feedback: {
    aiAnalysis: {
      type: String,
      default: ''
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    nextSteps: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  badgesEarned: [{
    name: String,
    description: String,
    icon: String,
    points: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['speed', 'accuracy', 'safety', 'teamwork', 'completion', 'improvement']
    },
    points: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  school: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: 'Punjab'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isPersonalBest: {
    type: Boolean,
    default: false
  },
  isSchoolBest: {
    type: Boolean,
    default: false
  },
  isGlobalBest: {
    type: Boolean,
    default: false
  },
  previousAttempts: {
    type: Number,
    default: 0
  },
  improvement: {
    scoreImprovement: {
      type: Number,
      default: 0
    },
    timeImprovement: {
      type: Number,
      default: 0
    },
    accuracyImprovement: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    device: String,
    browser: String,
    platform: String,
    vrHeadset: String,
    sessionDuration: Number,
    interactions: Number,
    errors: Number
  },
  isActive: {
    type: Boolean,
    default: true
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
drillResultSchema.index({ user: 1, createdAt: -1 });
drillResultSchema.index({ drillType: 1, drillMode: 1, score: -1 });
drillResultSchema.index({ school: 1, region: 1 });
drillResultSchema.index({ isPersonalBest: 1, isSchoolBest: 1, isGlobalBest: 1 });
drillResultSchema.index({ createdAt: -1 });

// Update timestamp before saving
drillResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate overall performance score
  const performanceScores = [
    this.performance.accuracy,
    this.performance.speed,
    this.performance.safety,
    this.performance.teamwork,
    this.performance.decisionMaking
  ].filter(score => score > 0);
  
  if (performanceScores.length > 0) {
    this.performance.overall = performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length;
  }
  
  next();
});

// Method to calculate improvement
drillResultSchema.methods.calculateImprovement = async function() {
  const previousResult = await this.constructor.findOne({
    user: this.user,
    drillType: this.drillType,
    drillMode: this.drillMode,
    _id: { $ne: this._id }
  }).sort({ createdAt: -1 });
  
  if (previousResult) {
    this.improvement.scoreImprovement = this.score - previousResult.score;
    this.improvement.timeImprovement = previousResult.timeTaken - this.timeTaken;
    this.improvement.accuracyImprovement = this.performance.accuracy - previousResult.performance.accuracy;
    this.previousAttempts = await this.constructor.countDocuments({
      user: this.user,
      drillType: this.drillType,
      drillMode: this.drillMode
    });
  }
  
  return this.save();
};

// Method to check for achievements
drillResultSchema.methods.checkAchievements = function() {
  const achievements = [];
  
  // Speed achievements
  if (this.timeTaken < this.totalTime * 0.5) {
    achievements.push({
      name: 'Speed Demon',
      description: 'Completed drill in half the expected time',
      category: 'speed',
      points: 50
    });
  }
  
  // Accuracy achievements
  if (this.performance.accuracy >= 95) {
    achievements.push({
      name: 'Precision Master',
      description: 'Achieved 95% or higher accuracy',
      category: 'accuracy',
      points: 75
    });
  }
  
  // Safety achievements
  if (this.performance.safety >= 90) {
    achievements.push({
      name: 'Safety First',
      description: 'Demonstrated excellent safety practices',
      category: 'safety',
      points: 60
    });
  }
  
  // Completion achievements
  if (this.completedSteps.length === this.completedSteps.filter(s => s.completed).length) {
    achievements.push({
      name: 'Perfect Completion',
      description: 'Completed all drill steps',
      category: 'completion',
      points: 100
    });
  }
  
  // Improvement achievements
  if (this.improvement.scoreImprovement > 20) {
    achievements.push({
      name: 'Rapid Improvement',
      description: 'Improved score by 20+ points',
      category: 'improvement',
      points: 40
    });
  }
  
  this.achievements = achievements;
  return achievements;
};

// Method to generate AI feedback
drillResultSchema.methods.generateAIFeedback = async function() {
  const aiService = require('../services/aiService');
  
  try {
    const feedback = await aiService.analyzeDrillPerformance({
      drillType: this.drillType,
      score: this.score,
      performance: this.performance,
      timeTaken: this.timeTaken,
      completedSteps: this.completedSteps,
      missedSteps: this.missedSteps
    });
    
    this.feedback.aiAnalysis = feedback.analysis;
    this.feedback.strengths = feedback.strengths;
    this.feedback.weaknesses = feedback.weaknesses;
    this.feedback.recommendations = feedback.recommendations;
    this.feedback.nextSteps = feedback.nextSteps;
    this.feedback.confidence = feedback.confidence;
    
    return feedback;
  } catch (error) {
    console.error('AI feedback generation failed:', error);
    
    // Fallback feedback
    this.feedback.aiAnalysis = 'AI analysis is currently unavailable. Please review your performance manually.';
    this.feedback.strengths = ['Completed the drill successfully'];
    this.feedback.weaknesses = ['Review areas for improvement'];
    this.feedback.recommendations = ['Practice more drills to improve'];
    this.feedback.nextSteps = ['Try different drill types'];
    this.feedback.confidence = 0;
    
    return this.feedback;
  }
};

// Static method to get leaderboard
drillResultSchema.statics.getLeaderboard = function(options = {}) {
  const {
    drillType = null,
    drillMode = null,
    school = null,
    region = null,
    limit = 10,
    timeRange = null
  } = options;
  
  let query = {};
  
  if (drillType) query.drillType = drillType;
  if (drillMode) query.drillMode = drillMode;
  if (school) query.school = school;
  if (region) query.region = region;
  
  if (timeRange) {
    const now = new Date();
    const timeMap = {
      'day': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000
    };
    
    if (timeMap[timeRange]) {
      query.createdAt = {
        $gte: new Date(now.getTime() - timeMap[timeRange])
      };
    }
  }
  
  return this.find(query)
    .populate('user', 'name school profileImage')
    .sort({ score: -1, timeTaken: 1 })
    .limit(limit);
};

// Static method to get user statistics
drillResultSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { drillType: '$drillType', drillMode: '$drillMode' },
        totalDrills: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalTime: { $sum: '$timeTaken' },
        averageTime: { $avg: '$timeTaken' },
        lastAttempt: { $max: '$createdAt' }
      }
    },
    { $sort: { bestScore: -1 } }
  ]);
};

// Static method to get school statistics
drillResultSchema.statics.getSchoolStats = function(schoolName) {
  return this.aggregate([
    { $match: { school: schoolName } },
    {
      $group: {
        _id: null,
        totalDrills: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalStudents: { $addToSet: '$user' },
        drillTypes: { $addToSet: '$drillType' }
      }
    },
    {
      $project: {
        totalDrills: 1,
        averageScore: { $round: ['$averageScore', 2] },
        bestScore: 1,
        totalStudents: { $size: '$totalStudents' },
        drillTypes: 1
      }
    }
  ]);
};

const DrillResult = mongoose.model('DrillResult', drillResultSchema);

module.exports = DrillResult;
