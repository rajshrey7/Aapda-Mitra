// server/models/Module.js
// Schema for education modules with lessons, quizzes, and progress tracking

const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxLength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description must be less than 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'interactive', 'vr'],
      default: 'image'
    },
    url: String,
    thumbnail: String,
    duration: Number, // in seconds for video/audio
    caption: String
  },
  interactiveElements: [{
    type: {
      type: String,
      enum: ['quiz', 'simulation', 'drag-drop', 'matching', 'timeline']
    },
    data: mongoose.Schema.Types.Mixed,
    points: {
      type: Number,
      default: 10
    }
  }],
  quizReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion'
  },
  order: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }]
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxLength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    trim: true,
    maxLength: [1000, 'Description must be less than 1000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxLength: [300, 'Short description must be less than 300 characters']
  },
  lessons: [lessonSchema],
  category: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'cyclone', 'first-aid', 'evacuation', 'communication', 'preparedness'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'pa'],
    default: 'en'
  },
  points: {
    type: Number,
    default: 100
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 30
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  targetAudience: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'all'],
    default: 'all'
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
  region: {
    type: String,
    default: 'Punjab'
  },
  tags: [String],
  media: {
    thumbnail: String,
    banner: String,
    preview: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isAIGenerated: {
    type: Boolean,
    default: false
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
  completionStats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number, // in minutes
      default: 0
    }
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  version: {
    type: Number,
    default: 1
  },
  changelog: [{
    version: Number,
    changes: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
moduleSchema.index({ category: 1, difficulty: 1 });
moduleSchema.index({ language: 1, region: 1 });
moduleSchema.index({ isActive: 1, isPublished: 1 });
moduleSchema.index({ createdBy: 1 });
moduleSchema.index({ tags: 1 });
moduleSchema.index({ averageRating: -1, totalRatings: -1 });

// Update timestamp before saving
moduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate max points from lessons
  if (this.lessons && this.lessons.length > 0) {
    this.maxPoints = this.lessons.reduce((total, lesson) => {
      let lessonPoints = 0;
      
      // Points from interactive elements
      if (lesson.interactiveElements) {
        lessonPoints += lesson.interactiveElements.reduce((sum, element) => sum + element.points, 0);
      }
      
      // Points from quiz
      if (lesson.quizReference) {
        lessonPoints += 20; // Default quiz points
      }
      
      return total + lessonPoints;
    }, 0);
  }
  
  // Calculate average rating
  if (this.ratings && this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0) / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  
  next();
});

// Method to add a lesson
moduleSchema.methods.addLesson = function(lessonData) {
  const maxOrder = this.lessons.length > 0 ? Math.max(...this.lessons.map(l => l.order)) : 0;
  lessonData.order = maxOrder + 1;
  this.lessons.push(lessonData);
  return this.save();
};

// Method to reorder lessons
moduleSchema.methods.reorderLessons = function(lessonIds) {
  lessonIds.forEach((lessonId, index) => {
    const lesson = this.lessons.id(lessonId);
    if (lesson) {
      lesson.order = index + 1;
    }
  });
  return this.save();
};

// Method to add rating
moduleSchema.methods.addRating = function(userId, rating, review = '') {
  // Remove existing rating from same user
  this.ratings = this.ratings.filter(r => r.user.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({
    user: userId,
    rating,
    review,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to update completion stats
moduleSchema.methods.updateCompletionStats = function(score, timeSpent) {
  this.completionStats.totalAttempts += 1;
  
  if (score >= 70) { // 70% passing score
    this.completionStats.totalCompletions += 1;
  }
  
  // Update average score
  const totalScore = this.completionStats.averageScore * (this.completionStats.totalAttempts - 1);
  this.completionStats.averageScore = (totalScore + score) / this.completionStats.totalAttempts;
  
  // Update average time
  const totalTime = this.completionStats.averageTime * (this.completionStats.totalAttempts - 1);
  this.completionStats.averageTime = (totalTime + timeSpent) / this.completionStats.totalAttempts;
  
  return this.save();
};

// Static method to find modules by category
moduleSchema.statics.findByCategory = function(category, options = {}) {
  const { difficulty, language, region, limit = 10 } = options;
  
  let query = { category, isActive: true, isPublished: true };
  
  if (difficulty) query.difficulty = difficulty;
  if (language) query.language = language;
  if (region) query.region = region;
  
  return this.find(query)
    .populate('createdBy', 'name')
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(limit);
};

// Static method to find recommended modules
moduleSchema.statics.findRecommended = function(userId, options = {}) {
  const { limit = 5 } = options;
  
  // This would typically use user's completion history and preferences
  // For now, return top-rated modules
  return this.find({ isActive: true, isPublished: true })
    .populate('createdBy', 'name')
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(limit);
};

// Static method to get module statistics
moduleSchema.statics.getModuleStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$category',
        totalModules: { $sum: 1 },
        publishedModules: {
          $sum: { $cond: ['$isPublished', 1, 0] }
        },
        averageRating: { $avg: '$averageRating' },
        totalCompletions: { $sum: '$completionStats.totalCompletions' }
      }
    },
    { $sort: { totalModules: -1 } }
  ]);
};

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
