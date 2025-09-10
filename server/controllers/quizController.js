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
        }
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
      // Return sample quiz if no API key (logic remains the same)
      const sampleQuiz = {
        title: `AI Generated Quiz: ${topic}`,
        description: `Practice quiz on ${topic} for disaster preparedness`,
        category: topic.toLowerCase() || 'general',
        difficulty: difficulty || 'beginner',
        isAIGenerated: true,
        questions: [
          {
            question: `What is the first thing to do during an ${topic}?`,
            questionType: 'multiple-choice',
            options: [
              { text: 'Run outside immediately', isCorrect: false },
              { text: 'Take cover under a sturdy desk', isCorrect: true },
              { text: 'Stand in a doorway', isCorrect: false },
              { text: 'Call emergency services', isCorrect: false }
            ],
            correctAnswer: 'Take cover under a sturdy desk',
            explanation: 'Taking cover under a sturdy desk or table protects you from falling objects.',
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
            explanation: 'Emergency kits should have at least 3 days of water supply per person.',
            points: 10
          }
        ]
      };

      const createdQuiz = await Quiz.create(sampleQuiz);
      
      return res.json({
        status: 'success',
        data: createdQuiz,
        message: 'Sample quiz generated (Gemini API key not configured)'
      });
    }

    // 4. Get the Gemini model
    // Using gemini-1.5-flash-latest is efficient for this task
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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
    const prompt = `Generate exactly ${numberOfQuestions || 5} quiz questions about ${topic} disaster preparedness at a ${difficulty || 'beginner'} difficulty level. 
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
    // Check if the error is from the Gemini API (e.g., content blocked)
    if (error.message.includes('response was blocked')) {
        return res.status(400).json({
            status: 'error',
            message: 'Quiz generation failed because the topic was deemed unsafe. Please try a different topic.'
        });
    }
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while generating the AI quiz.'
    });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  submitQuiz,
  generateAIQuiz
};
