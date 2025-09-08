// server/models/GameSession.js
// Schema for multiplayer game/drill sessions with participants, state, and timing

const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Game session name is required'],
    trim: true,
    maxLength: [100, 'Name must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description must be less than 500 characters']
  },
  gameType: {
    type: String,
    enum: ['rescue-rush', 'vr-drill', 'quiz-battle', 'disaster-sim'],
    required: true,
    default: 'rescue-rush'
  },
  mode: {
    type: String,
    enum: ['vr', 'desktop', 'mobile'],
    required: true,
    default: 'desktop'
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'completed', 'disconnected'],
      default: 'waiting'
    }
  }],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  status: {
    type: String,
    enum: ['waiting', 'starting', 'active', 'paused', 'completed', 'cancelled'],
    default: 'waiting'
  },
  settings: {
    duration: {
      type: Number, // in seconds
      default: 300 // 5 minutes
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    allowSpectators: {
      type: Boolean,
      default: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      select: false
    }
  },
  gameData: {
    currentLevel: {
      type: Number,
      default: 1
    },
    totalTargets: {
      type: Number,
      default: 0
    },
    targetsHit: {
      type: Number,
      default: 0
    },
    hazards: [{
      type: String,
      x: Number,
      y: Number,
      active: Boolean
    }],
    powerups: [{
      type: String,
      x: Number,
      y: Number,
      active: Boolean
    }]
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  results: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    finalScore: Number,
    rank: Number,
    accuracy: Number,
    timeBonus: Number,
    survivalBonus: Number
  }],
  school: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: 'Punjab'
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
gameSessionSchema.index({ status: 1, createdAt: -1 });
gameSessionSchema.index({ host: 1 });
gameSessionSchema.index({ school: 1, region: 1 });
gameSessionSchema.index({ 'participants.user': 1 });

// Update timestamp before saving
gameSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add participant
gameSessionSchema.methods.addParticipant = function(userId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Game session is full');
  }
  
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User already in session');
  }
  
  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    score: 0,
    status: 'waiting'
  });
  
  return this.save();
};

// Method to remove participant
gameSessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Method to start game
gameSessionSchema.methods.startGame = function() {
  if (this.status !== 'waiting') {
    throw new Error('Game can only be started from waiting status');
  }
  
  if (this.participants.length < 2) {
    throw new Error('Need at least 2 participants to start');
  }
  
  this.status = 'active';
  this.startedAt = new Date();
  
  // Update all participants to playing status
  this.participants.forEach(participant => {
    participant.status = 'playing';
  });
  
  return this.save();
};

// Method to end game
gameSessionSchema.methods.endGame = function() {
  this.status = 'completed';
  this.endedAt = new Date();
  
  // Calculate final results
  const sortedParticipants = this.participants
    .sort((a, b) => b.score - a.score)
    .map((participant, index) => ({
      user: participant.user,
      finalScore: participant.score,
      rank: index + 1,
      accuracy: this.gameData.totalTargets > 0 ? 
        (this.gameData.targetsHit / this.gameData.totalTargets) * 100 : 0,
      timeBonus: 0,
      survivalBonus: 0
    }));
  
  this.results = sortedParticipants;
  
  return this.save();
};

// Method to update participant score
gameSessionSchema.methods.updateScore = function(userId, score) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.score = score;
    return this.save();
  }
  throw new Error('Participant not found');
};

// Static method to find active sessions
gameSessionSchema.statics.findActive = function() {
  return this.find({ 
    status: { $in: ['waiting', 'starting', 'active'] },
    startedAt: { $exists: true }
  }).populate('host', 'name email school').populate('participants.user', 'name school');
};

// Static method to find sessions by school
gameSessionSchema.statics.findBySchool = function(schoolName) {
  return this.find({ school: schoolName })
    .populate('host', 'name email school')
    .populate('participants.user', 'name school')
    .sort({ createdAt: -1 });
};

const GameSession = mongoose.model('GameSession', gameSessionSchema);

module.exports = GameSession;
