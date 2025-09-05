const express = require('express');
const router = express.Router();
const {
  chat,
  getDisasterTips,
  getEmergencyContacts
} = require('../controllers/chatbotController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Routes
router.post('/chat', protect, chat);
router.get('/tips', getDisasterTips);
router.get('/emergency-contacts', getEmergencyContacts);

module.exports = router;