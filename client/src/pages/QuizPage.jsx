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

    setAnswers([...answers, selectedAnswer]);
    
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
        
        navigate('/quizzes', { 
          state: { 
            quizResult: response.data,
            quizTitle: quiz.title 
          }
        });
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
            {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>

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