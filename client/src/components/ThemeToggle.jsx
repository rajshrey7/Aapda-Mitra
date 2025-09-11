import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ variant = 'button', size = 'md', showLabel = false }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 p-1';
      case 'md':
        return 'w-10 h-10 p-2';
      case 'lg':
        return 'w-12 h-12 p-3';
      default:
        return 'w-10 h-10 p-2';
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <button
          className={`${getSizeClasses()} rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center`}
          title="Theme options"
        >
          {getIcon()}
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <button
              onClick={setLightTheme}
              className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                theme === 'light' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
              {theme === 'light' && <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto" />}
            </button>
            
            <button
              onClick={setDarkTheme}
              className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                theme === 'dark' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
              {theme === 'dark' && <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto" />}
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                theme === 'system' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>System</span>
              {theme === 'system' && <div className="w-2 h-2 bg-blue-600 rounded-full ml-auto" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={`${getSizeClasses()} rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center group`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </motion.button>
  );
};

export default ThemeToggle;
