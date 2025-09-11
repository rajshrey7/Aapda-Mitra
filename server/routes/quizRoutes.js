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
router.get('/dynamic-quiz', async (req, res) => {
	try {
		const { topic = 'general', numQuestions, numberOfQuestions } = req.query;
		const requested = numQuestions ?? numberOfQuestions;
		const count = parseInt(requested, 10) || 15;
		const quiz = await generateQuiz(topic, count);
		return res.json({ status: 'success', requested: count, received: Array.isArray(quiz) ? quiz.length : undefined, data: quiz });
	} catch (error) {
		console.error('Dynamic quiz generation error:', error);
		return res.status(500).json({ status: 'error', message: 'Failed to generate dynamic quiz' });
	}
});
router.get('/:id', optionalAuth, getQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.post('/generate', optionalAuth, generateAIQuiz);

module.exports = router;