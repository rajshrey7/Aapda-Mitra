// server/services/socketService.js
// Socket.IO service for real-time communication and game events

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GameSession = require('../models/GameSession');
const GameScore = require('../models/GameScore');

function initialize(io) {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.user = {
        id: user._id,
        name: user.name,
        role: user.role,
        school: user.school,
        region: user.region
      };

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ${socket.id}`);

    // Join user to their school room
    socket.join(`school:${socket.user.school}`);
    
    // Join user to their region room
    socket.join(`region:${socket.user.region}`);

    // Join user to their role room (student/teacher/admin)
    if (socket.user.role) {
      socket.join(`role:${socket.user.role}`);
    }

    // Join lobby for game sessions. Mark role membership for server-side checks
    socket.join('lobby');
    socket.join(`user:${socket.user.id}`);

    // Admin users join admin room
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    // Chat room management
    socket.on('joinRoom', (roomId) => {
      socket.join(`chat:${roomId}`);
      socket.to(`chat:${roomId}`).emit('user:joined', {
        user: socket.user,
        timestamp: new Date()
      });
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(`chat:${roomId}`);
      socket.to(`chat:${roomId}`).emit('user:left', {
        user: socket.user,
        timestamp: new Date()
      });
    });

    socket.on('chat:message', async (data) => {
      try {
        const { roomId, message, type = 'text' } = data;
        
        const chatMessage = {
          id: Date.now().toString(),
          user: socket.user,
          message,
          type,
          timestamp: new Date()
        };

        // Broadcast to room
        io.to(`chat:${roomId}`).emit('chat:message', chatMessage);
        
        // Store message (in production, save to database)
        console.log(`Chat message in room ${roomId}:`, chatMessage);
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Game session management
    socket.on('createSession', async (data) => {
      try {
        // Authorize: only teacher/admin can create via socket channel as well
        if (socket.user.role !== 'teacher' && socket.user.role !== 'admin') {
          return socket.emit('error', { message: 'Only teachers can create sessions' });
        }
        const { name, gameType, mode, maxParticipants, settings } = data;
        
        const gameSession = new GameSession({
          name,
          gameType,
          mode,
          host: socket.user.id,
          maxParticipants: maxParticipants || 10,
          settings: settings || {},
          school: socket.user.school,
          region: socket.user.region
        });

        await gameSession.save();
        await gameSession.populate('host', 'name email school');

        // Join game room
        socket.join(`game:${gameSession._id}`);
        
        // Notify lobby
        io.to('lobby').emit('game:created', gameSession);
        
        socket.emit('session:created', gameSession);
      } catch (error) {
        console.error('Create session error:', error);
        socket.emit('error', { message: 'Failed to create game session' });
      }
    });

    socket.on('joinSession', async (data) => {
      try {
        const { sessionId } = data;
        
        const gameSession = await GameSession.findById(sessionId);
        if (!gameSession) {
          return socket.emit('error', { message: 'Game session not found' });
        }

        if (gameSession.status !== 'waiting') {
          return socket.emit('error', { message: 'Game session is not accepting new players' });
        }

        await gameSession.addParticipant(socket.user.id);
        await gameSession.populate('participants.user', 'name school profileImage');

        // Join game room
        socket.join(`game:${sessionId}`);
        
        // Notify game room
        io.to(`game:${sessionId}`).emit('player:joined', {
          user: socket.user,
          participants: gameSession.participants
        });
        
        socket.emit('session:joined', gameSession);
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('leaveSession', async (data) => {
      try {
        const { sessionId } = data;
        
        const gameSession = await GameSession.findById(sessionId);
        if (gameSession) {
          await gameSession.removeParticipant(socket.user.id);
          await gameSession.populate('participants.user', 'name school profileImage');

          // Leave game room
          socket.leave(`game:${sessionId}`);
          
          // Notify game room
          io.to(`game:${sessionId}`).emit('player:left', {
            user: socket.user,
            participants: gameSession.participants
          });
        }
      } catch (error) {
        console.error('Leave session error:', error);
      }
    });

    socket.on('startSession', async (data) => {
      try {
        const { sessionId } = data;
        
        const gameSession = await GameSession.findById(sessionId);
        if (!gameSession) {
          return socket.emit('error', { message: 'Game session not found' });
        }

        if (gameSession.host.toString() !== socket.user.id) {
          return socket.emit('error', { message: 'Only the host can start the game' });
        }

        await gameSession.startGame();

        // Notify game room
        io.to(`game:${sessionId}`).emit('game:started', gameSession);
      } catch (error) {
        console.error('Start session error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('playerScore', async (data) => {
      try {
        const { sessionId, score, gameData } = data;
        
        const gameSession = await GameSession.findById(sessionId);
        if (!gameSession) {
          return socket.emit('error', { message: 'Game session not found' });
        }

        // Update participant score
        await gameSession.updateScore(socket.user.id, score);

        // Save to GameScore collection
        const gameScore = new GameScore({
          user: socket.user.id,
          gameSession: gameSession._id,
          gameType: gameSession.gameType,
          mode: gameSession.mode,
          score: parseInt(score),
          gameData: gameData || {},
          school: socket.user.school,
          region: socket.user.region,
          difficulty: gameSession.settings.difficulty || 'medium'
        });

        await gameScore.save();

        // Check for personal/school/global bests
        await gameScore.checkPersonalBest();
        await gameScore.checkSchoolBest();
        await gameScore.checkGlobalBest();
        await gameScore.save();

        // Notify game room
        io.to(`game:${sessionId}`).emit('score:updated', {
          user: socket.user,
          score: score,
          gameScore: gameScore
        });

        // Emit leaderboard update
        io.to('lobby').emit('leaderboard:update', {
          type: 'game',
          gameType: gameSession.gameType,
          mode: gameSession.mode
        });

        // Emit to school and region rooms
        io.to(`school:${socket.user.school}`).emit('leaderboard:update', {
          type: 'school',
          gameType: gameSession.gameType,
          mode: gameSession.mode
        });

        io.to(`region:${socket.user.region}`).emit('leaderboard:update', {
          type: 'region',
          gameType: gameSession.gameType,
          mode: gameSession.mode
        });

        socket.emit('score:saved', gameScore);
      } catch (error) {
        console.error('Player score error:', error);
        socket.emit('error', { message: 'Failed to save score' });
      }
    });

    // Admin broadcast
    socket.on('admin:broadcast', async (data) => {
      try {
        if (socket.user.role !== 'admin') {
          return socket.emit('error', { message: 'Admin privileges required' });
        }

        const { message, priority, targetType, targetId, title } = data;
        
        const broadcast = {
          id: Date.now().toString(),
          title: title || 'Admin Broadcast',
          message,
          priority,
          targetType,
          targetId,
          sentBy: socket.user,
          sentAt: new Date()
        };

        // Broadcast to appropriate rooms
        if (targetType === 'all') {
          io.emit('admin:broadcast', broadcast);
        } else if (targetType === 'school') {
          io.to(`school:${targetId}`).emit('admin:broadcast', broadcast);
        } else if (targetType === 'region') {
          io.to(`region:${targetId}`).emit('admin:broadcast', broadcast);
        }

        socket.emit('broadcast:sent', broadcast);
      } catch (error) {
        console.error('Admin broadcast error:', error);
        socket.emit('error', { message: 'Failed to send broadcast' });
      }
    });

    // Alert events (server relays to rooms)
    socket.on('alert:issued', (alert) => {
      const payload = { ...alert };
      // Backward-compatible event
      io.emit('alert:issued', payload);
      io.emit('alert:new', payload);
      if (alert.targetRole && ['student', 'teacher'].includes(alert.targetRole)) {
        io.to(`role:${alert.targetRole}`).emit('alert:new', payload);
      }
      if (alert.region) {
        io.to(`region:${alert.region}`).emit('alert:new', payload);
      }
      if (alert.school) {
        io.to(`school:${alert.school}`).emit('alert:new', payload);
      }
    });

    socket.on('alert:update', (alert) => {
      const payload = { ...alert };
      io.emit('alert:update', payload);
      if (alert.targetRole && ['student', 'teacher'].includes(alert.targetRole)) {
        io.to(`role:${alert.targetRole}`).emit('alert:update', payload);
      }
      if (alert.region) {
        io.to(`region:${alert.region}`).emit('alert:update', payload);
      }
      if (alert.school) {
        io.to(`school:${alert.school}`).emit('alert:update', payload);
      }
    });

    // Alert cancel event
    socket.on('alert:cancel', (data) => {
      const { alertId, targetRole, region, school } = data || {};
      const payload = { alertId };
      io.emit('alert:cancel', payload);
      if (targetRole && ['student', 'teacher'].includes(targetRole)) {
        io.to(`role:${targetRole}`).emit('alert:cancel', payload);
      }
      if (region) {
        io.to(`region:${region}`).emit('alert:cancel', payload);
      }
      if (school) {
        io.to(`school:${school}`).emit('alert:cancel', payload);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      // Leave all rooms
      socket.leaveAll();
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Periodic cleanup of inactive game sessions
  setInterval(async () => {
    try {
      const cutoffTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      
      const inactiveSessions = await GameSession.find({
        status: 'waiting',
        createdAt: { $lt: cutoffTime }
      });

      for (const session of inactiveSessions) {
        session.status = 'cancelled';
        await session.save();
        
        io.to(`game:${session._id}`).emit('session:cancelled', {
          reason: 'Inactive session timeout'
        });
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, 30 * 60 * 1000); // Run every 30 minutes

  return io;
}

module.exports = { initialize };
