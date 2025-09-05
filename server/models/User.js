const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters'],
    maxLength: [100, 'Name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  school: {
    type: String,
    required: [true, 'School name is required'],
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  quizzesTaken: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    },
    score: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  drillsCompleted: [{
    drillType: String,
    completedAt: Date,
    score: Number
  }],
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  region: {
    type: String,
    default: 'Punjab'
  },
  profileImage: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate user level based on points
userSchema.methods.calculateLevel = function() {
  const pointThresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  for (let i = pointThresholds.length - 1; i >= 0; i--) {
    if (this.points >= pointThresholds[i]) {
      this.level = i + 1;
      break;
    }
  }
  return this.level;
};

// Add badge method
userSchema.methods.addBadge = function(badge) {
  const existingBadge = this.badges.find(b => b.name === badge.name);
  if (!existingBadge) {
    this.badges.push(badge);
    this.points += badge.points || 10;
    this.calculateLevel();
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;