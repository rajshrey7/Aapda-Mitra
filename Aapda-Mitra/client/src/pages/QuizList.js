import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiClock, FiAward } from 'react-icons/fi';

const QuizList = () => {
  const quizzes = [
    {
      id: 1,
      title: 'Earthquake Safety Basics',
      category: 'earthquake',
      difficulty: 'Beginner',
      questions: 10,
      duration: 15,
      points: 100
    },
    {
      id: 2,
      title: 'Fire Emergency Response',
      category: 'fire',
      difficulty: 'Intermediate',
      questions: 15,
      duration: 20,
      points: 150
    },
    {
      id: 3,
      title: 'Flood Preparedness',
      category: 'flood',
      difficulty: 'Beginner',
      questions: 12,
      duration: 15,
      points: 120
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      earthquake: 'bg-orange-100 text-orange-800',
      fire: 'bg-red-100 text-red-800',
      flood: 'bg-blue-100 text-blue-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Disaster Preparedness Quizzes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <motion.div
            key={quiz.id}
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
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <FiBookOpen className="mr-2" />
                  <span>{quiz.questions} Questions</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiClock className="mr-2" />
                  <span>{quiz.duration} Minutes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiAward className="mr-2" />
                  <span>{quiz.points} Points</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{quiz.difficulty}</span>
                <Link
                  to={`/quiz/${quiz.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Quiz
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuizList;