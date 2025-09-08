// client/src/components/ModulePlayer.jsx
// Interactive module player with lessons and quizzes

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';

const ModulePlayer = ({ moduleId, onComplete, onProgress }) => {
  const [module, setModule] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Fetch module data
  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/modules/${moduleId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setModule(data.data);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch module');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  // Update progress
  useEffect(() => {
    if (module && module.lessons) {
      const progressPercent = (completedLessons.size / module.lessons.length) * 100;
      setProgress(progressPercent);
      
      if (onProgress) {
        onProgress(progressPercent);
      }
    }
  }, [completedLessons, module, onProgress]);

  const currentLesson = module?.lessons?.[currentLessonIndex];

  const handleNextLesson = () => {
    if (currentLessonIndex < module.lessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    } else {
      // Module completed
      if (onComplete) {
        onComplete({
          moduleId,
          score: points,
          completedLessons: completedLessons.size,
          totalLessons: module.lessons.length,
          progress: 100
        });
      }
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  const handleLessonComplete = (lessonPoints = 10) => {
    setCompletedLessons(prev => new Set([...prev, currentLessonIndex]));
    setPoints(prev => prev + lessonPoints);
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/submit-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer: answer.answer || answer.selectedIndex,
            timeSpent: answer.timeSpent || 30
          })),
          timeSpent: 300 // 5 minutes default
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setQuizResult(data.data);
        setPoints(prev => prev + data.data.pointsEarned);
        handleLessonComplete(data.data.pointsEarned);
      } else {
        setError(data.message || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const renderMedia = (media) => {
    if (!media || !media.url) return null;

    switch (media.type) {
      case 'image':
        return (
          <img
            src={media.url}
            alt={media.caption || 'Lesson media'}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        );
      case 'video':
        return (
          <video
            src={media.url}
            controls
            className="w-full h-64 rounded-lg mb-4"
            poster={media.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio
            src={media.url}
            controls
            className="w-full mb-4"
          >
            Your browser does not support the audio element.
          </audio>
        );
      default:
        return null;
    }
  };

  const renderInteractiveElement = (element, index) => {
    switch (element.type) {
      case 'quiz':
        return (
          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Quiz</h4>
            <p className="text-blue-800 text-sm mb-3">{element.data.question}</p>
            <div className="space-y-2">
              {element.data.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`quiz-${index}`}
                    value={optIndex}
                    className="text-blue-600"
                  />
                  <span className="text-blue-800">{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleLessonComplete(element.points)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        );
      case 'simulation':
        return (
          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 mb-2">Interactive Simulation</h4>
            <p className="text-green-800 text-sm mb-3">{element.data.description}</p>
            <div className="bg-white border border-green-300 rounded-lg p-4 min-h-32 flex items-center justify-center">
              <span className="text-green-600">Simulation placeholder</span>
            </div>
            <button
              onClick={() => handleLessonComplete(element.points)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Complete Simulation
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <p className="text-gray-500">Module not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{module.title}</h2>
            <p className="text-blue-100 mt-1">{module.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <StarIcon className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">{points} points</span>
            </div>
            <div className="text-sm text-blue-100">
              {completedLessons.size} / {module.lessons.length} lessons
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-300 rounded-full h-3">
          <motion.div
            className="bg-yellow-300 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6">
        {currentLesson && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLessonIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Lesson Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentLesson.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Lesson {currentLessonIndex + 1} of {module.lessons.length}
                  </p>
                </div>
                
                {completedLessons.has(currentLessonIndex) && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>

              {/* Lesson Media */}
              {renderMedia(currentLesson.media)}

              {/* Lesson Content */}
              <div className="prose max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
              </div>

              {/* Interactive Elements */}
              {currentLesson.interactiveElements?.map((element, index) => 
                renderInteractiveElement(element, index)
              )}

              {/* Quiz Section */}
              {currentLesson.quizReference && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Lesson Quiz</h4>
                  <p className="text-yellow-800 text-sm mb-3">
                    Test your understanding of this lesson
                  </p>
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              )}

              {/* Quiz Result */}
              {quizResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrophyIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Quiz Complete!</span>
                  </div>
                  <p className="text-green-800">
                    Score: {quizResult.score}% | Points earned: {quizResult.pointsEarned}
                  </p>
                  {quizResult.passed && (
                    <p className="text-green-700 text-sm mt-1">Great job! You passed the quiz.</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePreviousLesson}
            disabled={currentLessonIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {currentLessonIndex + 1} of {module.lessons.length}
            </span>
          </div>

          <button
            onClick={handleNextLesson}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>
              {currentLessonIndex === module.lessons.length - 1 ? 'Complete Module' : 'Next'}
            </span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePlayer;
