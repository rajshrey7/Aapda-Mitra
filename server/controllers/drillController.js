const DrillResult = require('../models/DrillResult');
const GameSession = require('../models/GameSession');
const aiService = require('../services/aiService');

// Start a VR drill session (optionally authenticated)
// POST /api/drills/start
async function startDrill(req, res) {
  try {
    const {
      drillType = 'earthquake',
      mode = 'vr',
      difficulty = 'medium',
      duration = 60,
      name = `${drillType}-drill`
    } = req.body || {};

    // Create a lightweight GameSession to coordinate multiplayer if needed
    const session = new GameSession({
      name,
      description: `${drillType} preparedness drill`,
      gameType: 'vr-drill',
      mode: 'vr',
      host: req.user?._id || (req.body.hostUserId ?? undefined),
      participants: req.user ? [{ user: req.user._id, status: 'playing' }] : [],
      settings: {
        duration: Number(duration) || 60,
        difficulty,
        allowSpectators: true,
        isPrivate: false
      },
      gameData: {
        currentLevel: 1,
        scoreMultiplier: 1,
        hazards: [drillType],
        items: []
      }
    });

    await session.save();

    res.status(201).json({
      status: 'success',
      data: {
        sessionId: session._id,
        drillType,
        duration: session.settings.duration,
        difficulty
      }
    });
  } catch (error) {
    console.error('startDrill error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start drill' });
  }
}

// Submit VR drill result
// POST /api/drills/:id/result
async function submitDrillResult(req, res) {
  try {
    const { id: sessionId } = req.params;
    const {
      drillType,
      score,
      timeTaken,
      totalTime,
      performance = {},
      completedSteps = [],
      missedSteps = [],
      difficulty = 'medium',
      metadata = {}
    } = req.body || {};

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ status: 'error', message: 'Session not found' });
    }

    const userId = req.user?._id;

    const baseDoc = {
      user: userId || (req.body.userId ?? undefined),
      drillType,
      drillMode: 'vr',
      sessionId: session._id,
      score: Number(score) || 0,
      timeTaken: Number(timeTaken) || 0,
      totalTime: Number(totalTime) || session.settings.duration || 0,
      performance: {
        accuracy: Number(performance.accuracy) || 0,
        speed: Number(performance.speed) || 0,
        safety: Number(performance.safety) || 0,
        teamwork: Number(performance.teamwork) || 0,
        decisionMaking: Number(performance.decisionMaking) || 0
      },
      completedSteps,
      missedSteps,
      school: req.user?.school || req.body.school || 'Unknown',
      region: req.user?.region || req.body.region || 'Punjab',
      difficulty,
      metadata
    };

    // AI analysis
    const analysis = await aiService.analyzeDrillPerformance({
      drillType,
      score: baseDoc.score,
      performance: baseDoc.performance,
      timeTaken: baseDoc.timeTaken,
      completedSteps,
      missedSteps
    });

    const doc = new DrillResult({
      ...baseDoc,
      feedback: {
        aiAnalysis: analysis.analysis || '',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        nextSteps: analysis.nextSteps || [],
        confidence: Math.round((analysis.confidence || 0) * 100)
      }
    });

    await doc.save();

    // Emit live leaderboard update
    if (global.io) {
      global.io.to('lobby').emit('leaderboard:update', {
        type: 'drill',
        drillType,
        mode: 'vr'
      });
      if (req.user?.school) {
        global.io.to(`school:${req.user.school}`).emit('leaderboard:update', {
          type: 'drill',
          drillType,
          mode: 'vr'
        });
      }
    }

    res.status(201).json({ status: 'success', data: doc });
  } catch (error) {
    console.error('submitDrillResult error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit drill result' });
  }
}

// GET /api/drills/leaderboard
async function getDrillLeaderboard(req, res) {
  try {
    const {
      drillType = null,
      drillMode = 'vr',
      school = null,
      region = null,
      limit = 10,
      timeRange = 'week'
    } = req.query;

    const leaderboard = await DrillResult.getLeaderboard({
      drillType,
      drillMode,
      school,
      region,
      limit: parseInt(limit),
      timeRange
    });

    res.json({ status: 'success', data: { leaderboard } });
  } catch (error) {
    console.error('getDrillLeaderboard error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch drill leaderboard' });
  }
}

module.exports = {
  startDrill,
  submitDrillResult,
  getDrillLeaderboard
};


