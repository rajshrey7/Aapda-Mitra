import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiShield, FiZap, FiCloudRain, FiSun, FiPlay, FiStar, FiUsers, FiClock } from 'react-icons/fi';
import LearningModule from './LearningModule';

const LearningModulesSection = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModuleOpen, setIsModuleOpen] = useState(false);

  const modules = [
    {
      id: 'earthquake',
      title: 'Earthquake Safety',
      description: 'Learn how earthquakes happen and how to stay safe during shaking',
      icon: '🌍',
      color: 'from-amber-500 to-orange-600',
      duration: '15 min',
      difficulty: 'Beginner',
      students: '1,250',
      rating: 4.8,
      features: ['Interactive Activities', 'Safety Tips', 'Real Stories', 'Certificate']
    },
    {
      id: 'fire',
      title: 'Fire Safety',
      description: 'Discover fire prevention and what to do in case of a fire emergency',
      icon: '🔥',
      color: 'from-red-500 to-orange-600',
      duration: '12 min',
      difficulty: 'Beginner',
      students: '980',
      rating: 4.9,
      features: ['Fire Triangle', 'Prevention Tips', 'Emergency Response', 'Certificate']
    },
    {
      id: 'thunderstorm',
      title: 'Thunderstorm Safety',
      description: 'Understand lightning, thunder, and how to stay safe during storms',
      icon: '⛈️',
      color: 'from-blue-500 to-purple-600',
      duration: '10 min',
      difficulty: 'Beginner',
      students: '750',
      rating: 4.7,
      features: ['Storm Formation', 'Lightning Safety', 'Weather Tracking', 'Certificate']
    },
    {
      id: 'heatwave',
      title: 'Heatwave Safety',
      description: 'Learn about heatwaves and how to stay cool and hydrated',
      icon: '☀️',
      color: 'from-yellow-500 to-orange-600',
      duration: '8 min',
      difficulty: 'Beginner',
      students: '650',
      rating: 4.6,
      features: ['Heat Effects', 'Hydration Tips', 'Cooling Strategies', 'Certificate']
    }
  ];

  const openModule = (moduleId) => {
    setSelectedModule(moduleId);
    setIsModuleOpen(true);
  };

  const closeModule = () => {
    setIsModuleOpen(false);
    setSelectedModule(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <FiBook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Interactive Learning Modules
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Learn about different hazards through fun, interactive books
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <FiUsers className="w-4 h-4" />
          <span>3,630+ students</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 cursor-pointer group hover:shadow-lg transition-all duration-300"
            onClick={() => openModule(module.id)}
          >
            {/* Module Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {module.icon}
              </div>
              <div className="flex items-center space-x-1 text-yellow-500">
                <FiStar className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{module.rating}</span>
              </div>
            </div>

            {/* Module Info */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {module.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-1">
                <FiClock className="w-3 h-3" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiUsers className="w-3 h-3" />
                <span>{module.students}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-4">
              {module.features.slice(0, 2).map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                >
                  {feature}
                </span>
              ))}
              {module.features.length > 2 && (
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  +{module.features.length - 2} more
                </span>
              )}
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 bg-gradient-to-r ${module.color} text-white rounded-lg font-semibold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2`}
            >
              <FiPlay className="w-4 h-4" />
              <span>Start Learning</span>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FiShield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Safety First!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Each module includes interactive activities, real stories, and a completion certificate. 
              Perfect for students aged 8-16.
            </p>
          </div>
        </div>
      </div>

      {/* Learning Module Modal */}
      {isModuleOpen && selectedModule && (
        <LearningModule
          isOpen={isModuleOpen}
          onClose={closeModule}
          moduleType={selectedModule}
        />
      )}
    </div>
  );
};

export default LearningModulesSection;
