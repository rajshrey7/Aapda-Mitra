import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, RotateCcw, Trophy, Zap, Heart, AlertTriangle } from 'lucide-react';

const EmergencyCardSwap = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [cardDirection, setCardDirection] = useState('center');

  const questions = [
    {
      id: 1,
      question: "During an earthquake, you should immediately run outside to safety.",
      answer: false,
      explanation: "Running outside during an earthquake is dangerous. Drop, cover, and hold on under sturdy furniture until shaking stops.",
      category: "Earthquake"
    },
    {
      id: 2,
      question: "If you smell gas, you should immediately turn on lights to see better.",
      answer: false,
      explanation: "Never turn on lights or electrical switches if you smell gas. This could cause an explosion. Evacuate immediately and call emergency services.",
      category: "Gas Leak"
    },
    {
      id: 3,
      question: "During a flood, you should move to higher ground immediately.",
      answer: true,
      explanation: "Yes! Move to higher ground immediately during a flood. Do not wait for official evacuation orders if you're in immediate danger.",
      category: "Flood"
    },
    {
      id: 4,
      question: "If someone is having a seizure, you should put something in their mouth to prevent them from biting their tongue.",
      answer: false,
      explanation: "Never put anything in someone's mouth during a seizure. Clear the area, protect their head, and call emergency services.",
      category: "Medical Emergency"
    },
    {
      id: 5,
      question: "During a tornado warning, you should go to the lowest floor of your building.",
      answer: true,
      explanation: "Correct! Go to the lowest floor, preferably a basement, and stay away from windows during a tornado warning.",
      category: "Tornado"
    },
    {
      id: 6,
      question: "If you're caught in a wildfire, you should try to outrun the fire.",
      answer: false,
      explanation: "Never try to outrun a wildfire. Find a body of water or cleared area, lie face down, and cover yourself with wet clothing or soil.",
      category: "Wildfire"
    },
    {
      id: 7,
      question: "During a power outage, you should use candles for lighting.",
      answer: false,
      explanation: "Candles are a fire hazard. Use flashlights, battery-powered lanterns, or headlamps instead for safety.",
      category: "Power Outage"
    },
    {
      id: 8,
      question: "If someone is choking, you should perform the Heimlich maneuver immediately.",
      answer: true,
      explanation: "Yes! If someone is choking and can't speak or breathe, perform the Heimlich maneuver (abdominal thrusts) immediately.",
      category: "Medical Emergency"
    },
    {
      id: 9,
      question: "During a hurricane, you should tape your windows with X's to prevent them from breaking.",
      answer: false,
      explanation: "Taping windows doesn't prevent them from breaking and can create dangerous flying glass. Use proper storm shutters or board up windows.",
      category: "Hurricane"
    },
    {
      id: 10,
      question: "If you're trapped in a building during an emergency, you should make noise to attract rescuers.",
      answer: true,
      explanation: "Correct! Make noise by banging on pipes, walls, or using a whistle to help rescuers locate you.",
      category: "Rescue"
    },
    {
      id: 11,
      question: "During a heatwave, you should drink alcohol to stay cool.",
      answer: false,
      explanation: "Alcohol dehydrates you and makes heat-related illnesses worse. Drink plenty of water and stay in air-conditioned areas.",
      category: "Heatwave"
    },
    {
      id: 12,
      question: "If you see a downed power line, you should stay at least 10 feet away.",
      answer: true,
      explanation: "Yes! Stay at least 10 feet away from downed power lines and call emergency services immediately.",
      category: "Electrical Hazard"
    },
    {
      id: 13,
      question: "During a blizzard, you should try to walk to safety if you're stranded in your car.",
      answer: false,
      explanation: "Stay in your car during a blizzard. Walking in severe weather can be deadly. Run the engine occasionally for heat and make sure the exhaust pipe is clear.",
      category: "Blizzard"
    },
    {
      id: 14,
      question: "If someone is bleeding heavily, you should apply direct pressure to stop the bleeding.",
      answer: true,
      explanation: "Correct! Apply direct pressure with a clean cloth or bandage to stop heavy bleeding. Elevate the injured area if possible.",
      category: "Medical Emergency"
    },
    {
      id: 15,
      question: "During a tsunami warning, you should go to the beach to watch the waves.",
      answer: false,
      explanation: "Never go to the beach during a tsunami warning. Move to higher ground immediately, at least 100 feet above sea level.",
      category: "Tsunami"
    }
  ];

  const handleSwipe = (direction) => {
    if (!gameStarted || gameCompleted) return;

    const currentQuestion = questions[currentCardIndex];
    const isCorrect = (direction === 'right' && currentQuestion.answer) || 
                     (direction === 'left' && !currentQuestion.answer);

    setLastAnswer({ isCorrect, question: currentQuestion });
    setShowResult(true);

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
    } else {
      setStreak(0);
    }

    setCardDirection(direction);

    setTimeout(() => {
      if (currentCardIndex < questions.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setCardDirection('center');
        setShowResult(false);
      } else {
        setGameCompleted(true);
        setShowResult(false);
      }
    }, 2000);
  };

  const startGame = () => {
    setCurrentCardIndex(0);
    setScore(0);
    setStreak(0);
    setGameStarted(true);
    setGameCompleted(false);
    setShowResult(false);
    setCardDirection('center');
  };

  const resetGame = () => {
    setCurrentCardIndex(0);
    setScore(0);
    setStreak(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowResult(false);
    setCardDirection('center');
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return { text: "Emergency Expert! 🏆", color: "text-green-600", emoji: "🏆" };
    if (percentage >= 80) return { text: "Well Prepared! ⭐", color: "text-blue-600", emoji: "⭐" };
    if (percentage >= 70) return { text: "Getting There! 💪", color: "text-yellow-600", emoji: "👍" };
    if (percentage >= 60) return { text: "Keep Learning! 📚", color: "text-orange-600", emoji: "📚" };
    return { text: "More Practice Needed! 🔥", color: "text-red-600", emoji: "🔥" };
  };

  const currentQuestion = questions[currentCardIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
              <Zap className="text-purple-500" />
              Emergency Card Swap
            </h1>
            <p className="text-gray-600">Swipe right if the action is correct, left if it's wrong</p>
          </div>

          {/* Stats */}
          {gameStarted && (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-semibold">Score: {score}/{questions.length}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                <Trophy className="text-blue-600" size={20} />
                <span className="font-semibold">Streak: {streak}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
                <Heart className="text-purple-600" size={20} />
                <span className="font-semibold">Best: {bestStreak}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Area */}
        <div className="relative">
          {!gameStarted ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Test Your Emergency Knowledge?</h2>
              <p className="text-gray-600 mb-6">
                You'll see {questions.length} emergency scenarios. Swipe right if the action is correct, 
                left if it's wrong. Test your disaster preparedness knowledge!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
              >
                Start Game
              </button>
            </div>
          ) : !gameCompleted ? (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Question {currentCardIndex + 1} of {questions.length}
                </p>
              </div>

              {/* Card */}
              <motion.div
                key={currentCardIndex}
                initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  rotateY: 0,
                  x: cardDirection === 'left' ? -100 : cardDirection === 'right' ? 100 : 0
                }}
                exit={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px] flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      {currentQuestion.category}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  {/* Swipe Instructions */}
                  <div className="flex justify-center gap-8 mt-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                        <XCircle className="text-red-600" size={24} />
                      </div>
                      <p className="text-sm text-gray-600">Swipe Left</p>
                      <p className="text-xs text-gray-500">Wrong Action</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle className="text-green-600" size={24} />
                      </div>
                      <p className="text-sm text-gray-600">Swipe Right</p>
                      <p className="text-xs text-gray-500">Correct Action</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Swipe Buttons */}
              <div className="flex justify-center gap-6 mt-8">
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <XCircle size={24} />
                </button>
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
                >
                  <CheckCircle size={24} />
                </button>
              </div>
            </>
          ) : (
            /* Game Completed */
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">{getScoreMessage().emoji}</div>
              <h2 className={`text-3xl font-bold ${getScoreMessage().color} mb-4`}>
                {getScoreMessage().text}
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                You scored {score} out of {questions.length} questions!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Final Score</p>
                  <p className="text-2xl font-bold text-green-600">{score}/{questions.length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Best Streak</p>
                  <p className="text-2xl font-bold text-blue-600">{bestStreak}</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  Play Again
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  <RotateCcw size={20} className="inline mr-2" />
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Result Modal */}
          <AnimatePresence>
            {showResult && lastAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {lastAnswer.isCorrect ? '✅' : '❌'}
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${
                      lastAnswer.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lastAnswer.isCorrect ? 'Correct!' : 'Incorrect!'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-800">{lastAnswer.question.explanation}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Current Score</p>
                        <p className="text-xl font-bold text-green-600">{score + (lastAnswer.isCorrect ? 1 : 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Streak</p>
                        <p className="text-xl font-bold text-blue-600">{streak + (lastAnswer.isCorrect ? 1 : 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCardSwap;

