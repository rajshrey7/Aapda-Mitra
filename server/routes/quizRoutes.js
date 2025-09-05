const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  submitQuiz,
  generateAIQuiz
} = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Routes
router.get('/', optionalAuth, getQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.post('/generate', protect, generateAIQuiz);

module.exports = router;