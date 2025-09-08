// server/models/GameScore.js
// Store individual game scores with references to user & school

const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  gameType: {
    type: String,
    enum: ['rescue-rush', 'vr-drill', 'quiz-battle', 'disaster-sim'],
    required: true
  },
  mode: {
    type: String,
    enum: ['vr', 'desktop', 'mobile'],
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    default: 1000
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeBonus: {
    type: Number,
    default: 0
  },
  survivalBonus: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    min: 1
  },
  totalParticipants: {
    type: Number,
    default: 1
  },
  gameData: {
    targetsHit: {
      type: Number,
      default: 0
    },
    totalTargets: {
      type: Number,
      default: 0
    },
    hazardsAvoided: {
      type: Number,
      default: 0
    },
    powerupsCollected: {
      type: Number,
      default: 0
    },
    timeElapsed: {
      type: Number, // in seconds
      default: 0
    },
    deaths: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    }
  },
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
  achievements: [{
    name: String,
    description: String,
    points: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
gameScoreSchema.index({ user: 1, createdAt: -1 });
gameScoreSchema.index({ school: 1, score: -1 });
gameScoreSchema.index({ gameType: 1, mode: 1, score: -1 });
gameScoreSchema.index({ region: 1, score: -1 });
gameScoreSchema.index({ createdAt: -1 });

// Compound index for leaderboard queries
gameScoreSchema.index({ gameType: 1, mode: 1, school: 1, score: -1 });
gameScoreSchema.index({ gameType: 1, mode: 1, region: 1, score: -1 });

// Method to calculate total score with bonuses
gameScoreSchema.methods.calculateTotalScore = function() {
  return this.score + this.timeBonus + this.survivalBonus;
};

// Method to check if this is a personal best
gameScoreSchema.methods.checkPersonalBest = async function() {
  const bestScore = await this.constructor.findOne({
    user: this.user,
    gameType: this.gameType,
    mode: this.mode
  }).sort({ score: -1 });
  
  this.isPersonalBest = !bestScore || this.score > bestScore.score;
  return this.isPersonalBest;
};

// Method to check if this is a school best
gameScoreSchema.methods.checkSchoolBest = async function() {
  const bestScore = await this.constructor.findOne({
    school: this.school,
    gameType: this.gameType,
    mode: this.mode
  }).sort({ score: -1 });
  
  this.isSchoolBest = !bestScore || this.score > bestScore.score;
  return this.isSchoolBest;
};

// Method to check if this is a global best
gameScoreSchema.methods.checkGlobalBest = async function() {
  const bestScore = await this.constructor.findOne({
    gameType: this.gameType,
    mode: this.mode
  }).sort({ score: -1 });
  
  this.isGlobalBest = !bestScore || this.score > bestScore.score;
  return this.isGlobalBest;
};

// Static method to get leaderboard
gameScoreSchema.statics.getLeaderboard = function(options = {}) {
  const {
    gameType = 'rescue-rush',
    mode = 'desktop',
    school = null,
    region = null,
    limit = 10,
    timeRange = null
  } = options;
  
  let query = { gameType, mode };
  
  if (school) {
    query.school = school;
  }
  
  if (region) {
    query.region = region;
  }
  
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
    .sort({ score: -1 })
    .limit(limit);
};

// Static method to get user's best scores
gameScoreSchema.statics.getUserBestScores = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { gameType: '$gameType', mode: '$mode' },
        bestScore: { $max: '$score' },
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        lastPlayed: { $max: '$createdAt' }
      }
    },
    { $sort: { bestScore: -1 } }
  ]);
};

// Static method to get school statistics
gameScoreSchema.statics.getSchoolStats = function(schoolName) {
  return this.aggregate([
    { $match: { school: schoolName } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalPlayers: { $addToSet: '$user' },
        gameTypes: { $addToSet: '$gameType' }
      }
    },
    {
      $project: {
        totalGames: 1,
        averageScore: { $round: ['$averageScore', 2] },
        bestScore: 1,
        totalPlayers: { $size: '$totalPlayers' },
        gameTypes: 1
      }
    }
  ]);
};

// Static method to get top performers by region
gameScoreSchema.statics.getRegionalStats = function(region = 'Punjab') {
  return this.aggregate([
    { $match: { region } },
    {
      $group: {
        _id: '$school',
        totalGames: { $sum: 1 },
        averageScore: { $avg: '$score' },
        bestScore: { $max: '$score' },
        totalPlayers: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        school: '$_id',
        totalGames: 1,
        averageScore: { $round: ['$averageScore', 2] },
        bestScore: 1,
        totalPlayers: { $size: '$totalPlayers' }
      }
    },
    { $sort: { averageScore: -1 } }
  ]);
};

const GameScore = mongoose.model('GameScore', gameScoreSchema);

module.exports = GameScore;
