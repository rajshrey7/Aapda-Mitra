// server/routes/games.js
// REST endpoints for game sessions and multiplayer functionality

const express = require('express');
const { body, validationResult } = require('express-validator');
const GameSession = require('../models/GameSession');
const GameScore = require('../models/GameScore');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create game session
router.post('/create', protect, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('gameType').isIn(['rescue-rush', 'vr-drill', 'quiz-battle', 'disaster-sim']).withMessage('Invalid game type'),
  body('mode').isIn(['vr', 'desktop', 'mobile']).withMessage('Invalid mode'),
  body('maxParticipants').optional().isInt({ min: 2, max: 50 }).withMessage('Max participants must be between 2 and 50')
], async (req, res) => {
  try {
    // Only teachers (or admins) can create sessions
    if (!req.user || (req.user.role !== 'teacher' && req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only teachers can create game sessions'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, gameType, mode, maxParticipants, settings } = req.body;

    const gameSession = new GameSession({
      name,
      description,
      gameType,
      mode,
      host: req.user._id,
      maxParticipants: maxParticipants || 10,
      settings: settings || {},
      school: req.user.school,
      region: req.user.region
    });

    await gameSession.save();
    await gameSession.populate('host', 'name email school');

    // Emit to socket clients
    if (global.io) {
      global.io.to('lobby').emit('game:created', gameSession);
    }

    res.status(201).json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('Create game session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create game session'
    });
  }
});

// Join game session
router.post('/:id/join', protect, async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    if (gameSession.status !== 'waiting') {
      return res.status(400).json({
        status: 'error',
        message: 'Game session is not accepting new players'
      });
    }

    await gameSession.addParticipant(req.user._id);
    await gameSession.populate('participants.user', 'name school profileImage');

    // Emit to socket clients
    if (global.io) {
      global.io.to(`game:${req.params.id}`).emit('player:joined', {
        user: req.user,
        participants: gameSession.participants
      });
    }

    res.json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('Join game session error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Save score
router.post('/:id/score', protect, [
  body('score').isNumeric().withMessage('Score must be a number'),
  body('gameData').optional().isObject().withMessage('Game data must be an object')
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

    const { score, gameData } = req.body;
    const gameSession = await GameSession.findById(req.params.id);
    
    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    // Update participant score
    await gameSession.updateScore(req.user._id, score);

    // Save to GameScore collection
    const gameScore = new GameScore({
      user: req.user._id,
      gameSession: gameSession._id,
      gameType: gameSession.gameType,
      mode: gameSession.mode,
      score: parseInt(score),
      gameData: gameData || {},
      school: req.user.school,
      region: req.user.region,
      difficulty: gameSession.settings.difficulty || 'medium'
    });

    await gameScore.save();
    await gameScore.populate('user', 'name school profileImage');

    // Check for personal/school/global bests
    await gameScore.checkPersonalBest();
    await gameScore.checkSchoolBest();
    await gameScore.checkGlobalBest();
    await gameScore.save();

    // Emit leaderboard update
    if (global.io) {
      global.io.to('lobby').emit('leaderboard:update', {
        type: 'game',
        gameType: gameSession.gameType,
        mode: gameSession.mode
      });
      
      global.io.to(`game:${req.params.id}`).emit('score:updated', {
        user: req.user,
        score: score,
        gameScore: gameScore
      });
    }

    res.json({
      status: 'success',
      data: gameScore
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save score'
    });
  }
});

// List available sessions
router.get('/list', async (req, res) => {
  try {
    const { gameType, mode, school, limit = 20 } = req.query;
    
    let query = { status: 'waiting' };
    if (gameType) query.gameType = gameType;
    if (mode) query.mode = mode;
    if (school) query.school = school;

    const sessions = await GameSession.find(query)
      .populate('host', 'name school profileImage')
      .populate('participants.user', 'name school profileImage')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    console.error('List games error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch game sessions'
    });
  }
});

// Get session details
router.get('/:id', async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id)
      .populate('host', 'name email school profileImage')
      .populate('participants.user', 'name school profileImage')
      .populate('results.user', 'name school profileImage');

    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    res.json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('Get game session error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch game session'
    });
  }
});

// Start game session (host only)
router.post('/:id/start', protect, async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    
    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    if (gameSession.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the host can start the game'
      });
    }

    await gameSession.startGame();

    // Emit to socket clients
    if (global.io) {
      global.io.to(`game:${req.params.id}`).emit('game:started', gameSession);
    }

    res.json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// End game session (host only)
router.post('/:id/end', protect, async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    
    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    if (gameSession.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the host can end the game'
      });
    }

    await gameSession.endGame();

    // Emit to socket clients
    if (global.io) {
      global.io.to(`game:${req.params.id}`).emit('game:ended', gameSession);
    }

    res.json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to end game session'
    });
  }
});

// Leave game session
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const gameSession = await GameSession.findById(req.params.id);
    
    if (!gameSession) {
      return res.status(404).json({
        status: 'error',
        message: 'Game session not found'
      });
    }

    await gameSession.removeParticipant(req.user._id);
    await gameSession.populate('participants.user', 'name school profileImage');

    // Emit to socket clients
    if (global.io) {
      global.io.to(`game:${req.params.id}`).emit('player:left', {
        user: req.user,
        participants: gameSession.participants
      });
    }

    res.json({
      status: 'success',
      data: gameSession
    });
  } catch (error) {
    console.error('Leave game error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave game session'
    });
  }
});

module.exports = router;
