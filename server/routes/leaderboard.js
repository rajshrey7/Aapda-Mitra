// server/routes/leaderboard.js
// Leaderboard endpoints for global and school rankings

const express = require('express');
const GameScore = require('../models/GameScore');
const Score = require('../models/Score');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Global leaderboard
router.get('/global', optionalAuth, async (req, res) => {
  try {
    const { 
      gameType = 'rescue-rush', 
      mode = 'desktop', 
      timeRange = 'week',
      limit = 10 
    } = req.query;

    const leaderboard = await GameScore.getLeaderboard({
      gameType,
      mode,
      timeRange,
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        filters: { gameType, mode, timeRange, limit: parseInt(limit) }
      }
    });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch global leaderboard'
    });
  }
});

// School leaderboard
router.get('/school/:schoolId', optionalAuth, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { 
      gameType = 'rescue-rush', 
      mode = 'desktop', 
      timeRange = 'week',
      limit = 10 
    } = req.query;

    const leaderboard = await GameScore.getLeaderboard({
      gameType,
      mode,
      school: schoolId,
      timeRange,
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        school: schoolId,
        filters: { gameType, mode, timeRange, limit: parseInt(limit) }
      }
    });
  } catch (error) {
    console.error('School leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch school leaderboard'
    });
  }
});

// Regional leaderboard
router.get('/region/:region', optionalAuth, async (req, res) => {
  try {
    const { region } = req.params;
    const { 
      gameType = 'rescue-rush', 
      mode = 'desktop', 
      timeRange = 'week',
      limit = 10 
    } = req.query;

    const leaderboard = await GameScore.getLeaderboard({
      gameType,
      mode,
      region,
      timeRange,
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: {
        leaderboard,
        region,
        filters: { gameType, mode, timeRange, limit: parseInt(limit) }
      }
    });
  } catch (error) {
    console.error('Regional leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch regional leaderboard'
    });
  }
});

// Quiz leaderboard
router.get('/quiz', optionalAuth, async (req, res) => {
  try {
    const { quizId, limit = 10 } = req.query;

    const leaderboard = await Score.getLeaderboard(quizId, parseInt(limit));

    res.json({
      status: 'success',
      data: {
        leaderboard,
        quizId,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Quiz leaderboard error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz leaderboard'
    });
  }
});

// User's personal stats
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const [gameStats, quizStats] = await Promise.all([
      GameScore.getUserBestScores(userId),
      Score.getUserStats(userId)
    ]);

    res.json({
      status: 'success',
      data: {
        gameStats,
        quizStats
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics'
    });
  }
});

// School statistics
router.get('/school/:schoolId/stats', optionalAuth, async (req, res) => {
  try {
    const { schoolId } = req.params;

    const [gameStats, quizStats] = await Promise.all([
      GameScore.getSchoolStats(schoolId),
      Score.aggregate([
        { $match: { 'userDetails.school': schoolId } },
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            averageScore: { $avg: '$percentage' },
            totalStudents: { $addToSet: '$user' }
          }
        }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        school: schoolId,
        gameStats: gameStats[0] || {},
        quizStats: quizStats[0] || {}
      }
    });
  } catch (error) {
    console.error('School stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch school statistics'
    });
  }
});

// Regional statistics
router.get('/region/:region/stats', optionalAuth, async (req, res) => {
  try {
    const { region } = req.params;

    const regionalStats = await GameScore.getRegionalStats(region);

    res.json({
      status: 'success',
      data: {
        region,
        stats: regionalStats
      }
    });
  } catch (error) {
    console.error('Regional stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch regional statistics'
    });
  }
});

// Top performers across all categories
router.get('/top-performers', optionalAuth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const [topGames, topQuizzes] = await Promise.all([
      GameScore.aggregate([
        {
          $group: {
            _id: '$user',
            totalScore: { $sum: '$score' },
            totalGames: { $sum: 1 },
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
            totalGames: 1,
            bestScore: 1
          }
        },
        { $sort: { totalScore: -1 } },
        { $limit: parseInt(limit) }
      ]),
      Score.aggregate([
        {
          $group: {
            _id: '$user',
            totalScore: { $sum: '$score' },
            totalQuizzes: { $sum: 1 },
            averageScore: { $avg: '$percentage' }
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
            totalQuizzes: 1,
            averageScore: { $round: ['$averageScore', 2] }
          }
        },
        { $sort: { totalScore: -1 } },
        { $limit: parseInt(limit) }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        topGamePlayers: topGames,
        topQuizPlayers: topQuizzes
      }
    });
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch top performers'
    });
  }
});

module.exports = router;
