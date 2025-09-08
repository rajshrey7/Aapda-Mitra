import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiStar, FiTarget, FiTrendingUp, FiZap, FiShield, FiHeart } from 'react-icons/fi';

const PointsAnimation = ({ points, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
            <div className="flex items-center space-x-2">
              <FiZap className="w-6 h-6" />
              <span className="text-2xl font-bold">+{points}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BadgeUnlock = ({ badge, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-2xl text-center max-w-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-6xl mb-4"
            >
              {badge.icon}
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Badge Unlocked!</h3>
            <p className="text-lg font-semibold mb-1">{badge.name}</p>
            <p className="text-sm opacity-90">{badge.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProgressBar = ({ current, max, label, color = 'blue' }) => {
  const percentage = (current / max) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{current}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className={`h-3 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement, isUnlocked = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-lg border-2 transition-all ${
        isUnlocked
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {achievement.name}
          </h3>
          <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          {isUnlocked && (
            <div className="flex items-center mt-2">
              <FiAward className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-xs font-semibold text-yellow-600">
                {achievement.points} points
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardEntry = ({ rank, user, score, isCurrentUser = false }) => {
  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex items-center justify-between p-3 rounded-lg ${
        isCurrentUser ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-xl font-bold w-8 text-center">
          {getRankIcon(rank)}
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h4 className={`font-semibold ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
            {user.name}
          </h4>
          <p className="text-sm text-gray-600">{user.school}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
          {score.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">points</p>
      </div>
    </motion.div>
  );
};

const StreakCounter = ({ streak, type = 'daily' }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center"
    >
      <div className="flex items-center justify-center space-x-2 mb-2">
        <FiTrendingUp className="w-6 h-6" />
        <span className="text-lg font-semibold">
          {type === 'daily' ? 'Daily' : 'Weekly'} Streak
        </span>
      </div>
      <div className="text-3xl font-bold">{streak}</div>
      <div className="text-sm opacity-90">
        {type === 'daily' ? 'days in a row' : 'weeks in a row'}
      </div>
    </motion.div>
  );
};

const LevelProgress = ({ level, experience, nextLevelExp }) => {
  const progressPercentage = (experience / nextLevelExp) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
        <span className="text-2xl font-bold text-blue-600">Level {level}</span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{experience} XP</span>
          <span>{nextLevelExp} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-sm text-gray-500">
          {nextLevelExp - experience} XP to next level
        </span>
      </div>
    </div>
  );
};

const GamificationElements = {
  PointsAnimation,
  BadgeUnlock,
  ProgressBar,
  AchievementCard,
  LeaderboardEntry,
  StreakCounter,
  LevelProgress
};

export default GamificationElements;
