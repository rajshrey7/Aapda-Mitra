// server/routes/adminRoutes.js
// Enhanced admin routes with dashboard metrics and export functionality

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const GameScore = require('../models/GameScore');
const DrillResult = require('../models/DrillResult');
const Module = require('../models/Module');
const Score = require('../models/Score');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Get dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalSchools,
      totalDrillsCompleted,
      totalGameSessions,
      totalModules,
      recentActivity,
      schoolStats,
      drillParticipation
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.distinct('school').then(schools => schools.length),
      DrillResult.countDocuments(),
      GameScore.countDocuments(),
      Module.countDocuments({ isActive: true, isPublished: true }),
      getRecentActivity(),
      getSchoolStatistics(),
      getDrillParticipationStats()
    ]);

    // Calculate average scores
    const [avgGameScore, avgDrillScore] = await Promise.all([
      GameScore.aggregate([
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ]),
      DrillResult.aggregate([
        { $group: { _id: null, averageScore: { $avg: '$score' } } }
      ])
    ]);

    const dashboardData = {
      overview: {
        totalUsers,
        totalSchools,
        totalDrillsCompleted,
        totalGameSessions,
        totalModules,
        averageGameScore: avgGameScore[0]?.averageScore || 0,
        averageDrillScore: avgDrillScore[0]?.averageScore || 0
      },
      recentActivity,
      schoolStats,
      drillParticipation,
      lastUpdated: new Date()
    };

    res.json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Export data as CSV
router.get('/export', [
  body('type').isIn(['drills', 'games', 'modules', 'users']).withMessage('Invalid export type'),
  body('format').optional().isIn(['csv', 'json']).withMessage('Invalid format')
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

    const { type, format = 'csv', startDate, endDate } = req.query;
    let data = [];
    let filename = '';

    switch (type) {
      case 'drills':
        data = await exportDrillResults(startDate, endDate);
        filename = `drill_results_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'games':
        data = await exportGameResults(startDate, endDate);
        filename = `game_results_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'modules':
        data = await exportModuleCompletions(startDate, endDate);
        filename = `module_completions_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'users':
        data = await exportUserData();
        filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    if (format === 'json') {
      res.json({
        status: 'success',
        data: {
          type,
          count: data.length,
          data
        }
      });
    } else {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export data'
    });
  }
});

// Get drill participation heatmap
router.get('/drills/participation', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    const participation = await DrillResult.aggregate([
      {
        $match: {
          createdAt: {
            $gte: getDateRange(timeRange)
          }
        }
      },
      {
        $group: {
          _id: {
            school: '$school',
            drillType: '$drillType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $group: {
          _id: '$_id.school',
          drillTypes: {
            $push: {
              type: '$_id.drillType',
              date: '$_id.date',
              count: '$count',
              averageScore: { $round: ['$averageScore', 2] }
            }
          },
          totalDrills: { $sum: '$count' }
        }
      },
      { $sort: { totalDrills: -1 } }
    ]);

    res.json({
      status: 'success',
      data: participation
    });
  } catch (error) {
    console.error('Drill participation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch drill participation data'
    });
  }
});

// Get module completion rates
router.get('/modules/completion-rates', async (req, res) => {
  try {
    const completionRates = await Module.aggregate([
      {
        $project: {
          title: 1,
          category: 1,
          difficulty: 1,
          completionStats: 1,
          completionRate: {
            $cond: [
              { $gt: ['$completionStats.totalAttempts', 0] },
              { $multiply: [{ $divide: ['$completionStats.totalCompletions', '$completionStats.totalAttempts'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.json({
      status: 'success',
      data: completionRates
    });
  } catch (error) {
    console.error('Module completion rates error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch module completion rates'
    });
  }
});

// Schedule drill
router.post('/drills/schedule', [
  body('drillType').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'evacuation', 'first-aid', 'flood-evacuation']).withMessage('Invalid drill type'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date required'),
  body('targetSchools').isArray().withMessage('Target schools must be an array'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters')
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

    const { drillType, scheduledDate, targetSchools, description, duration = 30 } = req.body;

    const scheduledDrill = {
      id: Date.now().toString(),
      drillType,
      scheduledDate: new Date(scheduledDate),
      targetSchools,
      description,
      duration,
      createdBy: req.user._id,
      createdAt: new Date(),
      status: 'scheduled'
    };

    // Emit to socket clients
    if (global.io) {
      targetSchools.forEach(school => {
        global.io.to(`school:${school}`).emit('drill:scheduled', scheduledDrill);
      });
    }

    res.status(201).json({
      status: 'success',
      data: scheduledDrill
    });
  } catch (error) {
    console.error('Schedule drill error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to schedule drill'
    });
  }
});

// Helper functions
async function getRecentActivity() {
  const [recentUsers, recentDrills, recentGames] = await Promise.all([
    User.find({ isActive: true })
      .sort({ lastLogin: -1 })
      .limit(5)
      .select('name school lastLogin'),
    DrillResult.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name school'),
    GameScore.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name school')
  ]);

  return {
    recentUsers,
    recentDrills,
    recentGames
  };
}

async function getSchoolStatistics() {
  return User.aggregate([
    {
      $group: {
        _id: '$school',
        totalStudents: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        averageLevel: { $avg: '$level' }
      }
    },
    { $sort: { totalStudents: -1 } },
    { $limit: 10 }
  ]);
}

async function getDrillParticipationStats() {
  return DrillResult.aggregate([
    {
      $group: {
        _id: {
          school: '$school',
          drillType: '$drillType'
        },
        count: { $sum: 1 },
        averageScore: { $avg: '$score' }
      }
    },
    {
      $group: {
        _id: '$_id.school',
        drillTypes: {
          $push: {
            type: '$_id.drillType',
            count: '$count',
            averageScore: { $round: ['$averageScore', 2] }
          }
        },
        totalDrills: { $sum: '$count' }
      }
    },
    { $sort: { totalDrills: -1 } }
  ]);
}

async function exportDrillResults(startDate, endDate) {
  let query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return DrillResult.find(query)
    .populate('user', 'name email school')
    .lean();
}

async function exportGameResults(startDate, endDate) {
  let query = {};
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return GameScore.find(query)
    .populate('user', 'name email school')
    .lean();
}

async function exportModuleCompletions(startDate, endDate) {
  // This would need to be implemented based on how module completions are tracked
  return [];
}

async function exportUserData() {
  return User.find({ isActive: true })
    .select('-password')
    .lean();
}

function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

function getDateRange(timeRange) {
  const now = new Date();
  const ranges = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  };
  
  return new Date(now.getTime() - (ranges[timeRange] || ranges.week));
}

module.exports = router;