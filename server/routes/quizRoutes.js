const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  submitQuiz,
  generateAIQuiz
} = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { generateQuiz } = require('../services/quiz.services');

// Routes
router.get('/', optionalAuth, getQuizzes);
router.get('/:id', optionalAuth, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.post('/generate', optionalAuth, generateAIQuiz);
router.get('/dynamic-quiz', generateQuiz);

module.exports = router;