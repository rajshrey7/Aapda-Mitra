// server/routes/modules.js
// CRUD endpoints for education modules with quiz integration

const express = require('express');
const { body, validationResult } = require('express-validator');
const Module = require('../models/Module');
const QuizQuestion = require('../models/QuizQuestion');
const { protect, admin, teacher } = require('../middleware/authMiddleware');

const router = express.Router();

// List modules with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      language, 
      region, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    let query = { isActive: true, isPublished: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;
    if (region) query.region = region;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [modules, total] = await Promise.all([
      Module.find(query)
        .populate('createdBy', 'name')
        .sort({ averageRating: -1, totalRatings: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Module.countDocuments(query)
    ]);

    res.json({
      status: 'success',
      data: {
        modules,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('List modules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch modules'
    });
  }
});

// Get module details with lessons
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lessons.quizReference');

    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    res.json({
      status: 'success',
      data: module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module'
    });
  }
});

// Create module (admin/teacher only)
router.post('/', protect, teacher, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('category').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'first-aid', 'evacuation', 'communication', 'preparedness']).withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const moduleData = {
      ...req.body,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    };

    const module = new Module(moduleData);
    await module.save();
    await module.populate('createdBy', 'name email');

    res.status(201).json({
      status: 'success',
      data: module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create module'
    });
  }
});

// Update module (admin/teacher only)
router.put('/:id', protect, teacher, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && module.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this module'
      });
    }

    Object.assign(module, req.body);
    module.lastModifiedBy = req.user._id;
    module.version += 1;
    
    // Add to changelog
    module.changelog.push({
      version: module.version,
      changes: 'Module updated',
      modifiedBy: req.user._id,
      modifiedAt: new Date()
    });

    await module.save();
    await module.populate('createdBy', 'name email');

    res.json({
      status: 'success',
      data: module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update module'
    });
  }
});

// Delete module (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    module.isActive = false;
    await module.save();

    res.json({
      status: 'success',
      message: 'Module deactivated successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete module'
    });
  }
});

// Submit quiz answers
router.post('/:id/submit-quiz', protect, [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('timeSpent').isNumeric().withMessage('Time spent must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { answers, timeSpent } = req.body;
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = await QuizQuestion.findById(answer.questionId);
      if (question) {
        let isCorrect = false;
        let pointsEarned = 0;

        if (question.questionType === 'multiple-choice') {
          isCorrect = question.correctIndex === answer.selectedIndex;
        } else if (question.questionType === 'true-false') {
          isCorrect = question.correctAnswer.toLowerCase() === answer.answer.toLowerCase();
        } else {
          // For short answer, basic string comparison
          isCorrect = question.correctAnswer.toLowerCase().includes(answer.answer.toLowerCase());
        }

        if (isCorrect) {
          correctAnswers++;
          pointsEarned = question.points;
        }

        totalPoints += pointsEarned;

        detailedAnswers.push({
          questionId: answer.questionId,
          userAnswer: answer.answer || answer.selectedIndex,
          isCorrect,
          pointsEarned
        });

        // Update question usage stats
        await question.updateUsageStats(isCorrect, answer.timeSpent || 30);
      }
    }

    const percentage = (correctAnswers / answers.length) * 100;
    const passed = percentage >= 70;

    // Update module completion stats
    await module.updateCompletionStats(percentage, timeSpent);

    // Award points to user
    if (passed) {
      req.user.points += totalPoints;
      req.user.calculateLevel();
      await req.user.save();
    }

    // Generate adaptive next question using AI
    let nextQuestion = null;
    try {
      const aiService = require('../services/aiService');
      const lastQuestion = answers.length > 0 ? await QuizQuestion.findById(answers[answers.length - 1].questionId) : null;
      
      if (lastQuestion) {
        nextQuestion = await lastQuestion.getAdaptiveNext({
          averageScore: percentage,
          recentScores: [percentage],
          timeSpent: timeSpent
        }, module._id);
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Continue without AI-generated question
    }

    res.json({
      status: 'success',
      data: {
        score: percentage,
        correctAnswers,
        totalQuestions: answers.length,
        pointsEarned: totalPoints,
        passed,
        detailedAnswers,
        nextQuestion,
        userPoints: req.user.points,
        userLevel: req.user.level
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit quiz'
    });
  }
});

// Add rating to module
router.post('/:id/rate', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, review } = req.body;
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        status: 'error',
        message: 'Module not found'
      });
    }

    await module.addRating(req.user._id, rating, review);

    res.json({
      status: 'success',
      data: {
        averageRating: module.averageRating,
        totalRatings: module.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate module error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to rate module'
    });
  }
});

// Get module statistics
router.get('/stats/overview', protect, admin, async (req, res) => {
  try {
    const stats = await Module.getModuleStats();

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Module stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module statistics'
    });
  }
});

// Get recommended modules for user
router.get('/recommended/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own recommendations or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view these recommendations'
      });
    }

    const recommendations = await Module.findRecommended(userId, { limit: 5 });

    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    console.error('Recommended modules error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommended modules'
    });
  }
});

module.exports = router;
