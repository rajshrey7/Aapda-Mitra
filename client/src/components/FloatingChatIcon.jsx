import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Bot, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FloatingChatIcon = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated } = useAuth();

  const chatOptions = [
    {
      id: 'ai-chat',
      label: 'AI Assistant',
      icon: Bot,
      description: 'Get help from AI',
      color: 'bg-blue-500 hover:bg-blue-600',
      path: '/chat?tab=ai-chat'
    },
    {
      id: 'community-chat',
      label: 'Community Chat',
      icon: Users,
      description: 'Connect with others',
      color: 'bg-green-500 hover:bg-green-600',
      path: '/chat?tab=user-chat'
    }
  ];

  const handleOptionClick = () => {
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Chat Options</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-2">
                {chatOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Link
                      key={option.id}
                      to={option.path}
                      onClick={handleOptionClick}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${option.color} text-white hover:shadow-lg group`}
                    >
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <IconComponent size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-90">{option.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {!isAuthenticated && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Login required</strong> to access chat features
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isExpanded 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white hover:shadow-xl hover:scale-105`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {isAuthenticated && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </motion.div>
        )}
      </motion.button>

      {/* Pulse Animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-blue-400 opacity-30"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default FloatingChatIcon;
