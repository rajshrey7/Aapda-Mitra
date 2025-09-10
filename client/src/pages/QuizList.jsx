import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiAward, FiRefreshCw, FiZap } from 'react-icons/fi';
import api from '../config/api';
import QuizGenerator from '../components/QuizGenerator';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showGenerator, setShowGenerator] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'fire', label: 'Fire' },
    { value: 'flood', label: 'Flood' },
    { value: 'cyclone', label: 'Cyclone' }
  ];

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await api.getQuizzes(params);
      
      if (response.status === 'success') {
        setQuizzes(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory]);

  const handleQuizGenerated = (newQuiz) => {
    // Refresh the quiz list to include the new quiz
    fetchQuizzes();
    setShowGenerator(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      earthquake: 'bg-orange-100 text-orange-800',
      fire: 'bg-red-100 text-red-800',
      flood: 'bg-blue-100 text-blue-800',
      cyclone: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600',
      intermediate: 'text-yellow-600',
      advanced: 'text-red-600'
    };
    return colors[difficulty] || 'text-gray-600';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <FiRefreshCw className="animate-spin text-blue-600" />
            <span className="text-lg">Loading quizzes...</span>
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
        className="container mx-auto px-4 py-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Disaster Preparedness Quizzes</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchQuizzes}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Disaster Preparedness Quizzes</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiZap className="w-4 h-4" />
            <span>Generate AI Quiz</span>
          </button>
          <button
            onClick={fetchQuizzes}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quiz Generator */}
      {showGenerator && (
        <div className="mb-8">
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <FiBookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes found</h3>
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'No quizzes are available at the moment.' 
              : `No quizzes found for ${categories.find(c => c.value === selectedCategory)?.label}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz._id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{quiz.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(quiz.category)}`}>
                    {quiz.category}
                  </span>
                </div>
                
                {quiz.description && (
                  <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FiBookOpen className="mr-2" />
                    <span>{quiz.questions?.length || 0} Questions</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-2" />
                    <span>{quiz.timeLimit || 15} Minutes</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiAward className="mr-2" />
                    <span>{quiz.passingScore || 70}% Required</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1)}
                  </span>
                  <Link
                    to={`/quiz/${quiz._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QuizList;