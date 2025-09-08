const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get overall statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });c
    const totalQuizzes = await Quiz.countDocuments();
    const totalScores = await Score.countDocuments();

    // Get user distribution by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    const recentScores = await Score.countDocuments({
      completedAt: { $gte: sevenDaysAgo }
    });

    // Get quiz statistics
    const quizStats = await Quiz.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAttempts: { $sum: '$attempts' },
          avgScore: { $avg: '$averageScore' }
        }
      }
    ]);

    // Get top performers
    const topPerformers = await User.find()
      .select('name school points level badges')
      .sort({ points: -1 })
      .limit(5);

    // Get school-wise statistics
    const schoolStats = await User.aggregate([
      {
        $group: {
          _id: '$school',
          totalStudents: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          avgLevel: { $avg: '$level' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);

    // Get drill completion statistics
    const drillStats = await User.aggregate([
      { $unwind: '$drillsCompleted' },
      {
        $group: {
          _id: '$drillsCompleted.drillType',
          count: { $sum: 1 },
          avgScore: { $avg: '$drillsCompleted.score' }
        }
      }
    ]);

    // Calculate preparedness score (0-100)
    const avgQuizScore = await Score.aggregate([
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' }
        }
      }
    ]);

    const preparednessScore = avgQuizScore[0]?.avgPercentage || 0;

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalQuizzes,
          totalScores,
          preparednessScore: Math.round(preparednessScore),
          recentUsers,
          recentScores
        },
        usersByRole,
        quizStats,
        topPerformers,
        schoolStats,
        drillStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, school, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (role) query.role = role;
    if (school) query.school = school;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating user status'
    });
  }
};

// @desc    Create new quiz
// @route   POST /api/admin/quiz
// @access  Private/Admin
const createQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user._id
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating quiz'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/admin/quiz/:id
// @access  Private/Admin
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    res.json({
      status: 'success',
      data: quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating quiz'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/admin/quiz/:id
// @access  Private/Admin
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Quiz deactivated successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting quiz'
    });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    
    // Build date query
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    let report = {};

    switch (reportType) {
      case 'participation':
        // Get participation report
        report = await Score.aggregate([
          {
            $match: dateQuery.createdAt ? { createdAt: dateQuery } : {}
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
              },
              totalAttempts: { $sum: 1 },
              avgScore: { $avg: '$percentage' },
              uniqueUsers: { $addToSet: '$user' }
            }
          },
          {
            $project: {
              date: '$_id.date',
              totalAttempts: 1,
              avgScore: 1,
              uniqueUsers: { $size: '$uniqueUsers' }
            }
          },
          { $sort: { date: -1 } }
        ]);
        break;

      case 'school':
        // Get school-wise report
        report = await User.aggregate([
          {
            $group: {
              _id: '$school',
              totalUsers: { $sum: 1 },
              avgPoints: { $avg: '$points' },
              avgLevel: { $avg: '$level' },
              totalBadges: { $sum: { $size: '$badges' } }
            }
          },
          { $sort: { totalUsers: -1 } }
        ]);
        break;

      case 'preparedness':
        // Get overall preparedness report
        const categories = ['earthquake', 'flood', 'fire', 'cyclone'];
        report = await Promise.all(
          categories.map(async (category) => {
            const scores = await Score.aggregate([
              {
                $lookup: {
                  from: 'quizzes',
                  localField: 'quiz',
                  foreignField: '_id',
                  as: 'quizDetails'
                }
              },
              { $unwind: '$quizDetails' },
              {
                $match: { 'quizDetails.category': category }
              },
              {
                $group: {
                  _id: null,
                  avgScore: { $avg: '$percentage' },
                  totalAttempts: { $sum: 1 }
                }
              }
            ]);
            
            return {
              category,
              avgScore: scores[0]?.avgScore || 0,
              totalAttempts: scores[0]?.totalAttempts || 0
            };
          })
        );
        break;

      default:
        // General summary report
        report = {
          totalUsers: await User.countDocuments(),
          totalQuizzes: await Quiz.countDocuments(),
          totalAttempts: await Score.countDocuments(),
          avgPreparedness: (await Score.aggregate([
            { $group: { _id: null, avg: { $avg: '$percentage' } } }
          ]))[0]?.avg || 0
        };
    }

    res.json({
      status: 'success',
      data: report
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error generating reports'
    });
  }
};

// @desc    Send announcement
// @route   POST /api/admin/announcement
// @access  Private/Admin
const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, targetAudience } = req.body;

    // In a real app, this would send emails/notifications
    // For now, we'll just log it
    console.log('Announcement sent:', { title, message, targetAudience });

    res.json({
      status: 'success',
      message: 'Announcement sent successfully',
      data: {
        title,
        message,
        targetAudience,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending announcement'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getReports,
  sendAnnouncement
};