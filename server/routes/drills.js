const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
  startDrill,
  submitDrillResult,
  getDrillLeaderboard
} = require('../controllers/drillController');

const router = express.Router();

// Start a drill session (auth optional to support quick demos)
router.post(
  '/start',
  optionalAuth,
  [
    body('drillType').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'flood-evacuation']).withMessage('Invalid drill type'),
    body('duration').optional().isInt({ min: 15, max: 600 }),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard'])
  ],
  startDrill
);

// Submit drill result (prefer auth, but allow optional for demo)
router.post(
  '/:id/result',
  optionalAuth,
  [
    param('id').isString().withMessage('Session id required'),
    body('drillType').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'flood-evacuation']).withMessage('Invalid drill type'),
    body('score').isInt({ min: 0, max: 100 }),
    body('timeTaken').isInt({ min: 0 }),
    body('totalTime').isInt({ min: 1 })
  ],
  submitDrillResult
);

// Drill leaderboard
router.get(
  '/leaderboard',
  optionalAuth,
  [
    query('drillType').optional().isIn(['earthquake', 'flood', 'fire', 'cyclone', 'flood-evacuation']),
    query('drillMode').optional().isIn(['vr', 'simulation', 'physical', 'quiz']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('timeRange').optional().isIn(['day', 'week', 'month'])
  ],
  getDrillLeaderboard
);

module.exports = router;


