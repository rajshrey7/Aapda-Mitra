import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiClock, FiCheckCircle, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getQuiz(id);
        
        if (response.status === 'success') {
          setQuiz(response.data);
          setTimeLeft(response.data.timeLimit || 15);
        } else {
          throw new Error(response.message || 'Failed to fetch quiz');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 60000); // Decrease every minute

      return () => clearTimeout(timer);
    } else if (quizStarted && timeLeft === 0) {
      // Time's up - auto submit
      handleSubmitQuiz();
    }
  }, [quizStarted, timeLeft]);

  const startQuiz = () => {
    setQuizStarted(true);
    toast.success('Quiz started! Good luck!');
  };

  const handleAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    // Check if answer is correct
    const currentQ = quiz.questions[currentQuestion];
    let isCorrect = false;
    let correctAnswer = '';

    if (currentQ.questionType === 'multiple-choice') {
      const correctOption = currentQ.options.find(opt => opt.isCorrect);
      isCorrect = selectedAnswer === correctOption?.text;
      correctAnswer = correctOption?.text || '';
    } else if (currentQ.questionType === 'true-false') {
      isCorrect = selectedAnswer?.toLowerCase() === currentQ.correctAnswer?.toLowerCase();
      correctAnswer = currentQ.correctAnswer || '';
    } else {
      isCorrect = selectedAnswer?.toLowerCase().includes(currentQ.correctAnswer?.toLowerCase());
      correctAnswer = currentQ.correctAnswer || '';
    }

    // Show immediate feedback
    setCurrentAnswerResult({
      isCorrect,
      userAnswer: selectedAnswer,
      correctAnswer,
      explanation: currentQ.explanation || 'No explanation available.',
      question: currentQ.question
    });
    setShowAnswerFeedback(true);

    setAnswers([...answers, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    setShowAnswerFeedback(false);
    setCurrentAnswerResult(null);
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      // Quiz completed
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const response = await api.submitQuiz(id, {
        answers,
        timeTaken: (quiz.timeLimit || 15) - timeLeft
      });

      if (response.status === 'success') {
        const { score, badgesEarned, userStats } = response.data;
        
        toast.success(`Quiz completed! Score: ${score.percentage}%`);
        
        if (badgesEarned && badgesEarned.length > 0) {
          toast.success(`Congratulations! You earned ${badgesEarned.length} badge(s)!`);
        }
        
        // Show results instead of navigating away
        setQuizResults(response.data);
        setQuizCompleted(true);
        setShowAnswerFeedback(false);
      } else {
        throw new Error(response.message || 'Failed to submit quiz');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      if (err.message.includes('Not authorized')) {
        setShowLoginPrompt(true);
      } else {
        toast.error(err.message || 'Failed to submit quiz');
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <FiRefreshCw className="animate-spin text-blue-600" />
            <span className="text-lg">Loading quiz...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!quiz) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <div className="text-center">
          <p className="text-gray-600">Quiz not found</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </motion.div>
    );
  }

  if (!quizStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-3xl"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-gray-600 mb-6">{quiz.description}</p>
          )}
          
          {/* Authentication Status */}
          <div className="mb-6">
            {isAuthenticated ? (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <FiUser className="w-4 h-4 mr-2" />
                <span>Logged in as {user?.name || user?.email}</span>
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                <FiUser className="w-4 h-4 mr-2" />
                <span>Not logged in - Login to save progress</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <FiCheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold">{quiz.questions?.length || 0} Questions</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <FiClock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold">{quiz.timeLimit || 15} Minutes</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <FiCheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">{quiz.passingScore || 70}% Required</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={startQuiz}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Start Quiz
            </button>
            <div>
              <button
                onClick={() => navigate('/quizzes')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show quiz results if completed
  if (quizCompleted && quizResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600">{quiz.title}</p>
          </div>

          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {quizResults.score.percentage}%
              </div>
              <p className="text-blue-800 font-semibold">Final Score</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {quizResults.score.correctAnswers}/{quizResults.score.totalQuestions}
              </div>
              <p className="text-green-800 font-semibold">Correct Answers</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {quizResults.score.passed ? '✅' : '❌'}
              </div>
              <p className="text-purple-800 font-semibold">
                {quizResults.score.passed ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>

          {/* Badges Earned */}
          {quizResults.badgesEarned && quizResults.badgesEarned.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Badges Earned</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizResults.badgesEarned.map((badge, index) => (
                  <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-semibold text-yellow-800">{badge.name}</p>
                        <p className="text-sm text-yellow-600">{badge.description}</p>
                        <p className="text-xs text-yellow-500">+{badge.points} points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Detailed Results</h3>
            <div className="space-y-4">
              {quizResults.detailedResults?.map((result, index) => {
                const question = result.question;
                const userAnswer = result.userAnswer;
                const isCorrect = result.isCorrect;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm font-semibold text-blue-800">Your Answer:</p>
                            <p className="text-blue-700">{userAnswer || 'No answer'}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm font-semibold text-green-800">Correct Answer:</p>
                            <p className="text-green-700">
                              {question.options?.find(opt => opt.isCorrect)?.text || question.correctAnswer}
                            </p>
                          </div>
                        </div>
                        {question.explanation && (
                          <div className="mt-3 bg-yellow-50 p-3 rounded">
                            <p className="text-sm font-semibold text-yellow-800">Explanation:</p>
                            <p className="text-yellow-700">{question.explanation}</p>
                          </div>
                        )}
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Points: {result.pointsEarned}/{question.points || 10}
                          </div>
                          <div className={`text-sm font-semibold ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }) || quiz.questions.map((question, index) => {
                // Fallback if detailedResults is not available
                const userAnswer = answers[index];
                const isCorrect = quizResults.score.correctAnswers > index || 
                  (index < answers.length && userAnswer === question.options?.find(opt => opt.isCorrect)?.text);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-sm font-semibold text-blue-800">Your Answer:</p>
                            <p className="text-blue-700">{userAnswer || 'No answer'}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <p className="text-sm font-semibold text-green-800">Correct Answer:</p>
                            <p className="text-green-700">
                              {question.options?.find(opt => opt.isCorrect)?.text || question.correctAnswer}
                            </p>
                          </div>
                        </div>
                        {question.explanation && (
                          <div className="mt-3 bg-yellow-50 p-3 rounded">
                            <p className="text-sm font-semibold text-yellow-800">Explanation:</p>
                            <p className="text-yellow-700">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setQuizCompleted(false);
                setQuizResults(null);
                setCurrentQuestion(0);
                setAnswers([]);
                setSelectedAnswer('');
                setQuizStarted(false);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            {timeLeft !== null && (
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <FiClock className="text-red-600" />
                <span className={`${timeLeft <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                  {timeLeft} min{timeLeft !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>Progress: {Math.round((currentQuestion / quiz.questions.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option.text)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === option.text 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate('/quizzes')}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Exit Quiz
          </button>
          <button
            onClick={handleAnswer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </div>
      </div>

      {/* Answer Feedback Modal */}
      {showAnswerFeedback && currentAnswerResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {currentAnswerResult.isCorrect ? '✅' : '❌'}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${
                currentAnswerResult.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentAnswerResult.isCorrect ? 'Correct!' : 'Incorrect!'}
              </h3>
              
              <div className="text-left mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-gray-800 mb-2">Question:</p>
                  <p className="text-gray-700">{currentAnswerResult.question}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-blue-800 mb-2">Your Answer:</p>
                  <p className="text-blue-700">{currentAnswerResult.userAnswer}</p>
                </div>
                
                {!currentAnswerResult.isCorrect && (
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <p className="font-semibold text-green-800 mb-2">Correct Answer:</p>
                    <p className="text-green-700">{currentAnswerResult.correctAnswer}</p>
                  </div>
                )}
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="font-semibold text-yellow-800 mb-2">Explanation:</p>
                  <p className="text-yellow-700">{currentAnswerResult.explanation}</p>
                </div>
              </div>
              
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md mx-4"
          >
            <div className="text-center">
              <FiUser className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                You need to be logged in to submit your quiz and save your progress.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Continue Without Saving
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-blue-600">student@demo.com / demo123</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default QuizPage;