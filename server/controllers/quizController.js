const Quiz = require('../models/Quiz');
const Score = require('../models/Score');
const User = require('../models/User');
// 1. Import the Google Generative AI package
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// 2. Initialize the Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-development');

// @desc    Get all quizzes
// @route   GET /api/quiz
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const { category, difficulty, language, region } = req.query;
    
    // Build query
    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;
    if (region) query.region = region;

    const quizzes = await Quiz.find(query)
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching quizzes'
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quiz/:id
// @access  Public
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer -questions.options.isCorrect');

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
    console.error('Get quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching quiz'
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quiz/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quizId = req.params.id;
    const userId = req.user._id;

    // Get quiz with correct answers
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const processedAnswers = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;

      if (question.questionType === 'multiple-choice') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = userAnswer === correctOption?.text;
      } else if (question.questionType === 'true-false') {
        isCorrect = userAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
      } else {
        isCorrect = userAnswer?.toLowerCase().includes(question.correctAnswer?.toLowerCase());
      }

      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }

      processedAnswers.push({
        questionId: question._id,
        userAnswer,
        isCorrect,
        pointsEarned: isCorrect ? (question.points || 10) : 0
      });
    });

    const percentage = (correctAnswers / quiz.questions.length) * 100;
    const passed = percentage >= quiz.passingScore;

    // Create score record
    const score = await Score.create({
      user: userId,
      quiz: quizId,
      score: totalPoints,
      percentage,
      pointsEarned: totalPoints,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      answers: processedAnswers,
      timeTaken,
      passed
    });

    // Update user stats
    const user = await User.findById(userId);
    user.points += totalPoints;
    user.quizzesTaken.push({
      quizId,
      score: totalPoints,
      completedAt: new Date()
    });

    // Award badges based on performance
    const badges = [];
    
    if (percentage === 100) {
      const perfectBadge = {
        name: 'Perfect Score',
        description: 'Achieved 100% in a quiz',
        icon: '🌟',
        points: 50
      };
      user.addBadge(perfectBadge);
      badges.push(perfectBadge);
    }

    if (user.quizzesTaken.length === 1) {
      const firstQuizBadge = {
        name: 'First Steps',
        description: 'Completed first quiz',
        icon: '👣',
        points: 20
      };
      user.addBadge(firstQuizBadge);
      badges.push(firstQuizBadge);
    }

    if (user.quizzesTaken.length === 10) {
      const tenQuizzesBadge = {
        name: 'Quiz Master',
        description: 'Completed 10 quizzes',
        icon: '🏆',
        points: 100
      };
      user.addBadge(tenQuizzesBadge);
      badges.push(tenQuizzesBadge);
    }

    // Category-specific badges
    if (quiz.category === 'earthquake' && passed) {
      const earthquakeBadge = {
        name: 'Earthquake Expert',
        description: 'Passed earthquake preparedness quiz',
        icon: '🏔️',
        points: 30
      };
      user.addBadge(earthquakeBadge);
      badges.push(earthquakeBadge);
    }

    user.calculateLevel();
    await user.save();

    // Update quiz stats
    await quiz.updateAverageScore(percentage);

    res.json({
      status: 'success',
      data: {
        score: {
          totalPoints,
          percentage,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          passed,
          timeTaken
        },
        badgesEarned: badges,
        userStats: {
          totalPoints: user.points,
          level: user.level
        },
        detailedResults: processedAnswers.map((answer, index) => ({
          questionIndex: index,
          question: quiz.questions[index],
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned
        }))
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error submitting quiz'
    });
  }
};

// @desc    Generate AI quiz
// @route   POST /api/quiz/generate
// @access  Private
const generateAIQuiz = async (req, res) => {
  try {
    const { topic, difficulty, numberOfQuestions, language } = req.body;
    
    // 3. Update environment variable check
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key-for-development') {
      // Return expanded sample quiz if no API key
      const desired = Math.max(parseInt(numberOfQuestions) || 15, 5);
      const baseQuestions = [
        {
          question: `What is the first thing to do during a ${topic}?`,
          questionType: 'multiple-choice',
          options: [
            { text: 'Run outside immediately', isCorrect: false },
            { text: 'Take cover under a sturdy desk', isCorrect: true },
            { text: 'Stand in a doorway', isCorrect: false },
            { text: 'Call emergency services', isCorrect: false }
          ],
          correctAnswer: 'Take cover under a sturdy desk',
          explanation: 'Taking cover protects you from falling objects and debris.',
          points: 10
        },
        {
          question: `Emergency supplies should include water for how many days?`,
          questionType: 'multiple-choice',
          options: [
            { text: '1 day', isCorrect: false },
            { text: '3 days', isCorrect: true },
            { text: '7 days', isCorrect: false },
            { text: '14 days', isCorrect: false }
          ],
          correctAnswer: '3 days',
          explanation: 'Keep at least a 3-day supply of water per person.',
          points: 10
        },
        {
          question: `Which item is essential in a basic emergency kit?`,
          questionType: 'multiple-choice',
          options: [
            { text: 'Scented candles', isCorrect: false },
            { text: 'Battery-powered or hand-crank radio', isCorrect: true },
            { text: 'Decorative lights', isCorrect: false },
            { text: 'Room freshener', isCorrect: false }
          ],
          correctAnswer: 'Battery-powered or hand-crank radio',
          explanation: 'A radio helps you receive official updates during outages.',
          points: 10
        },
        {
          question: `During a flood warning, what is recommended?`,
          questionType: 'multiple-choice',
          options: [
            { text: 'Walk through moving water', isCorrect: false },
            { text: 'Move to higher ground immediately', isCorrect: true },
            { text: 'Drive across flooded roads', isCorrect: false },
            { text: 'Wait at low-lying areas', isCorrect: false }
          ],
          correctAnswer: 'Move to higher ground immediately',
          explanation: 'Avoid floodwaters and move to higher ground promptly.',
          points: 10
        },
        {
          question: `For fire safety at home, you should:`,
          questionType: 'multiple-choice',
          options: [
            { text: 'Disable smoke alarms to avoid false alerts', isCorrect: false },
            { text: 'Test smoke alarms monthly', isCorrect: true },
            { text: 'Store gasoline indoors', isCorrect: false },
            { text: 'Use water on grease fires', isCorrect: false }
          ],
          correctAnswer: 'Test smoke alarms monthly',
          explanation: 'Regular testing ensures early warning in case of fire.',
          points: 10
        }
      ];

      // Expand to desired length by cycling variations
      const questions = Array.from({ length: desired }).map((_, i) => {
        const base = baseQuestions[i % baseQuestions.length];
        // Slight variation by appending index to avoid identical IDs after DB save
        return {
          ...base,
          question: base.question,
          points: base.points
        };
      });

      const sampleQuiz = {
        title: `AI Generated Quiz: ${topic}`,
        description: `Practice quiz on ${topic} for disaster preparedness`,
        category: topic?.toLowerCase?.() || 'general',
        difficulty: difficulty || 'beginner',
        isAIGenerated: true,
        questions
      };

      const createdQuiz = await Quiz.create(sampleQuiz);
      
      return res.json({
        status: 'success',
        data: createdQuiz,
        message: 'Sample quiz generated (Gemini API key not configured)'
      });
    }

    // 4. Get the Gemini model (using flash model for better rate limits)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 5. Define the JSON schema for reliable, structured output
    const schema = {
        type: "OBJECT",
        properties: {
          questions: {
            type: "ARRAY",
            description: "A list of quiz questions.",
            items: {
              type: "OBJECT",
              properties: {
                question: {
                  type: "STRING",
                  description: "The question text.",
                },
                options: {
                  type: "ARRAY",
                  description: "A list of 4 possible answers.",
                  items: { type: "STRING" }
                },
                correctIndex: {
                  type: "NUMBER",
                  description: "The 0-based index of the correct answer in the 'options' array.",
                },
                explanation: {
                  type: "STRING",
                  description: "A brief explanation of why the answer is correct.",
                },
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["questions"]
      };

    // 6. Create the prompt for the model
    const prompt = `Generate exactly ${numberOfQuestions || 15} quiz questions about ${topic} disaster preparedness at a ${difficulty || 'beginner'} difficulty level. 
    The quiz is for students in Punjab, India, so focus on practical, region-specific knowledge where applicable.
    The language for the quiz should be ${language || 'English'}.
    Ensure there are 4 options for each question.
    `;

    // 7. Make the API call with the defined schema
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.8, // A little more creative for varied questions
        },
        // Optional: Add safety settings if needed
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
    });

    const aiResponseText = result.response.text();
    const aiResponse = JSON.parse(aiResponseText);
    
    // Format questions for our database schema
    const formattedQuestions = aiResponse.questions.map(q => {
        // Basic validation
        if (!q.options || q.correctIndex === undefined || q.correctIndex >= q.options.length) {
            console.warn('Skipping malformed AI question:', q);
            return null; // Skip this question
        }
        return {
            question: q.question,
            questionType: 'multiple-choice',
            options: q.options.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === q.correctIndex
            })),
            correctAnswer: q.options[q.correctIndex],
            explanation: q.explanation,
            points: 10, // Default points
            difficulty: difficulty || 'beginner'
        }
    }).filter(q => q !== null); // Remove any skipped questions

    if (formattedQuestions.length === 0) {
        throw new Error("AI failed to generate valid questions.");
    }

    // Create quiz in the database
    const newQuiz = await Quiz.create({
      title: `AI Quiz: ${topic}`,
      description: `An AI-generated quiz about ${topic}.`,
      category: topic.toLowerCase(),
      questions: formattedQuestions,
      difficulty: difficulty || 'beginner',
      isAIGenerated: true,
      createdBy: req.user ? req.user._id : null,   // ✅ safe
      region: req.user?.region || 'Punjab',        // ✅ safe
      language: language || 'en'
    });
    

    res.status(201).json({
      status: 'success',
      data: newQuiz
    });
  } catch (error) {
    console.error('Generate AI quiz error:', error);
    
    // Check for specific error types
    if (error.message.includes('response was blocked')) {
        return res.status(400).json({
            status: 'error',
            message: 'Quiz generation failed because the topic was deemed unsafe. Please try a different topic.'
        });
    } else if (error.message.includes('API_KEY_INVALID')) {
        return res.status(400).json({
            status: 'error',
            message: 'AI service configuration issue. Please contact administrator.'
        });
    } else if (error.message.includes('429')) {
        return res.status(429).json({
            status: 'error',
            message: 'AI service is temporarily unavailable due to high usage. Please try again later.'
        });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while generating the AI quiz. Please try again.'
    });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  submitQuiz,
  generateAIQuiz
};
