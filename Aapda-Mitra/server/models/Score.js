const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: String,
    userAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    default: ''
  },
  badgesEarned: [{
    name: String,
    description: String,
    icon: String
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for leaderboard queries
scoreSchema.index({ quiz: 1, score: -1 });
scoreSchema.index({ user: 1, quiz: 1 });
scoreSchema.index({ completedAt: -1 });

// Virtual for rank calculation
scoreSchema.virtual('rank').get(function() {
  return this._rank;
});

scoreSchema.set('toJSON', { virtuals: true });

// Static method for leaderboard
scoreSchema.statics.getLeaderboard = async function(quizId = null, limit = 10) {
  const matchStage = quizId ? { quiz: mongoose.Types.ObjectId(quizId) } : {};
  
  const leaderboard = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$user',
        totalScore: { $sum: '$score' },
        quizzesTaken: { $sum: 1 },
        averageScore: { $avg: '$percentage' },
        bestScore: { $max: '$score' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        user: '$userDetails',
        totalScore: 1,
        quizzesTaken: 1,
        averageScore: 1,
        bestScore: 1
      }
    },
    { $sort: { totalScore: -1 } },
    { $limit: limit }
  ]);

  // Add rank
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
};

// Static method for user statistics
scoreSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalQuizzes: { $sum: 1 },
        totalScore: { $sum: '$score' },
        averageScore: { $avg: '$percentage' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        perfectScores: {
          $sum: {
            $cond: [{ $eq: ['$percentage', 100] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalQuizzes: 0,
    totalScore: 0,
    averageScore: 0,
    totalPointsEarned: 0,
    perfectScores: 0
  };
};

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;