import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  
  // Sample quiz data
  const quiz = {
    title: 'Earthquake Safety Basics',
    questions: [
      {
        question: 'What should you do first during an earthquake?',
        options: ['Run outside', 'Drop, Cover, and Hold On', 'Call emergency services', 'Stand in a doorway'],
        correct: 1
      },
      {
        question: 'Where is the safest place during an earthquake if you are indoors?',
        options: ['Near windows', 'Under a sturdy table', 'In the elevator', 'Near exterior walls'],
        correct: 1
      }
    ]
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
      toast.success('Quiz completed!');
      navigate('/quizzes');
    }
  };

  const question = quiz.questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
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
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
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
            {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next Question'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizPage;