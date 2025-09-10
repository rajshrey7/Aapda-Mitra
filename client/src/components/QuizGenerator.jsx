import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../config/api';

const QuizGenerator = ({ onQuizGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const quizTopics = [
    { value: 'earthquake', label: 'Earthquake Safety', difficulty: 'beginner' },
    { value: 'fire', label: 'Fire Safety', difficulty: 'intermediate' },
    { value: 'flood', label: 'Flood Preparedness', difficulty: 'beginner' },
    { value: 'cyclone', label: 'Cyclone Safety', difficulty: 'intermediate' },
    { value: 'first-aid', label: 'First Aid', difficulty: 'advanced' }
  ];

  const generateQuiz = async (topic, difficulty, numberOfQuestions = 15) => {
    try {
      setIsGenerating(true);
      setGeneratedQuiz(null);
      
      toast.loading('🤖 Generating quiz with Gemini AI...', { duration: 2000 });

      const response = await api.generateQuiz({
        topic,
        difficulty,
        numberOfQuestions,
        language: 'en'
      });

      if (response.status === 'success') {
        setGeneratedQuiz(response.data);
        toast.success(`✅ Generated ${response.data.questions.length} questions!`);
        
        if (onQuizGenerated) {
          onQuizGenerated(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error(`❌ ${error.message || 'Failed to generate quiz'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <FiZap className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">AI Quiz Generator</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Generate dynamic quizzes with 15 questions using Gemini AI. Each quiz is tailored for disaster preparedness education.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quizTopics.map((topic) => (
          <motion.button
            key={topic.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateQuiz(topic.value, topic.difficulty)}
            disabled={isGenerating}
            className={`p-4 rounded-lg border-2 transition-all ${
              isGenerating
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
            }`}
          >
            <div className="text-left">
              <h3 className="font-semibold text-gray-800">{topic.label}</h3>
              <p className="text-sm text-gray-600 capitalize">{topic.difficulty}</p>
              <p className="text-xs text-gray-500 mt-1">15 questions</p>
            </div>
          </motion.button>
        ))}
      </div>

      {isGenerating && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Generating quiz with Gemini AI...</p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        </div>
      )}

      {generatedQuiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start">
            <FiCheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2">
                ✅ Quiz Generated Successfully!
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Title:</strong> {generatedQuiz.title}</p>
                <p><strong>Questions:</strong> {generatedQuiz.questions.length}</p>
                <p><strong>Category:</strong> {generatedQuiz.category}</p>
                <p><strong>Difficulty:</strong> {generatedQuiz.difficulty}</p>
                <p><strong>Duration:</strong> {generatedQuiz.duration} minutes</p>
              </div>
              <div className="mt-3">
                <a
                  href={`/quiz/${generatedQuiz._id}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiZap className="w-4 h-4 mr-2" />
                  Take Quiz
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FiAlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">💡 How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uses Google's Gemini AI to generate contextual questions</li>
              <li>Questions are tailored for Punjab, India region</li>
              <li>Each quiz contains exactly 15 questions</li>
              <li>Questions cover practical disaster preparedness scenarios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
