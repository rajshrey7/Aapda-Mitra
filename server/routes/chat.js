// server/routes/chat.js
// Chat endpoints for real-time communication

const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// In-memory chat storage (in production, use Redis or database)
const chatRooms = new Map();
const maxMessagesPerRoom = 100;

// Get chat history for a room
router.get('/room/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50 } = req.query;

    const room = chatRooms.get(roomId);
    if (!room) {
      return res.json({
        status: 'success',
        data: {
          messages: [],
          roomId,
          totalMessages: 0
        }
      });
    }

    const messages = room.messages
      .slice(-parseInt(limit))
      .map(msg => ({
        id: msg.id,
        user: msg.user,
        message: msg.message,
        timestamp: msg.timestamp,
        type: msg.type || 'text'
      }));

    res.json({
      status: 'success',
      data: {
        messages,
        roomId,
        totalMessages: room.messages.length
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chat history'
    });
  }
});

// Send message to room
router.post('/room/:roomId/message', protect, [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'file', 'system']).withMessage('Invalid message type')
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

    const { roomId } = req.params;
    const { message, type = 'text', metadata } = req.body;

    const chatMessage = {
      id: Date.now().toString(),
      user: {
        id: req.user._id,
        name: req.user.name,
        school: req.user.school,
        profileImage: req.user.profileImage
      },
      message,
      type,
      metadata: metadata || {},
      timestamp: new Date()
    };

    // Store message in room
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, {
        id: roomId,
        messages: [],
        participants: new Set(),
        createdAt: new Date()
      });
    }

    const room = chatRooms.get(roomId);
    room.messages.push(chatMessage);
    room.participants.add(req.user._id.toString());

    // Keep only last N messages
    if (room.messages.length > maxMessagesPerRoom) {
      room.messages = room.messages.slice(-maxMessagesPerRoom);
    }

    // Emit to socket clients in the room
    if (global.io) {
      global.io.to(`chat:${roomId}`).emit('chat:message', chatMessage);
    }

    res.status(201).json({
      status: 'success',
      data: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
    });
  }
});

// Get active chat rooms
router.get('/rooms', protect, async (req, res) => {
  try {
    const rooms = Array.from(chatRooms.values()).map(room => ({
      id: room.id,
      participantCount: room.participants.size,
      lastMessage: room.messages[room.messages.length - 1] || null,
      createdAt: room.createdAt
    }));

    res.json({
      status: 'success',
      data: rooms
    });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch chat rooms'
    });
  }
});

// Create chat room
router.post('/rooms', protect, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Room name is required and must be less than 100 characters'),
  body('type').isIn(['public', 'private', 'school', 'emergency']).withMessage('Invalid room type')
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

    const { name, type, description } = req.body;
    const roomId = `room_${Date.now()}`;

    const room = {
      id: roomId,
      name,
      type,
      description: description || '',
      createdBy: req.user._id,
      participants: new Set([req.user._id.toString()]),
      messages: [],
      createdAt: new Date()
    };

    chatRooms.set(roomId, room);

    res.status(201).json({
      status: 'success',
      data: {
        id: roomId,
        name,
        type,
        description,
        createdBy: req.user._id,
        participantCount: 1,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create chat room'
    });
  }
});

// Join chat room
router.post('/room/:roomId/join', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!chatRooms.has(roomId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat room not found'
      });
    }

    const room = chatRooms.get(roomId);
    room.participants.add(req.user._id.toString());

    // Emit to socket clients
    if (global.io) {
      global.io.to(`chat:${roomId}`).emit('user:joined', {
        user: {
          id: req.user._id,
          name: req.user.name,
          school: req.user.school
        },
        participantCount: room.participants.size
      });
    }

    res.json({
      status: 'success',
      message: 'Joined chat room successfully'
    });
  } catch (error) {
    console.error('Join chat room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join chat room'
    });
  }
});

// Leave chat room
router.post('/room/:roomId/leave', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!chatRooms.has(roomId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat room not found'
      });
    }

    const room = chatRooms.get(roomId);
    room.participants.delete(req.user._id.toString());

    // Emit to socket clients
    if (global.io) {
      global.io.to(`chat:${roomId}`).emit('user:left', {
        user: {
          id: req.user._id,
          name: req.user.name,
          school: req.user.school
        },
        participantCount: room.participants.size
      });
    }

    res.json({
      status: 'success',
      message: 'Left chat room successfully'
    });
  } catch (error) {
    console.error('Leave chat room error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave chat room'
    });
  }
});

// Get room participants
router.get('/room/:roomId/participants', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!chatRooms.has(roomId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat room not found'
      });
    }

    const room = chatRooms.get(roomId);
    const participants = Array.from(room.participants);

    res.json({
      status: 'success',
      data: {
        roomId,
        participantCount: participants.length,
        participants
      }
    });
  } catch (error) {
    console.error('Get room participants error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch room participants'
    });
  }
});

module.exports = router;
