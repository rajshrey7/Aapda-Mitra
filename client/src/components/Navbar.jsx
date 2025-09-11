import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AlertDropdown from './AlertDropdown';
import ThemeToggle from './ThemeToggle';
import { FiMenu, FiX, FiUser, FiLogOut, FiGlobe } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, isLoading } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/quizzes', label: t('nav.quizzes') },
    { path: '/drills', label: t('nav.drills'), auth: true },
    { path: '/game/lobby', label: 'Lobby', auth: true },
    { path: '/leaderboard', label: t('nav.leaderboard') },
    { path: '/emergency', label: t('nav.emergency') },
    // { path: '/chat', label: 'Chat Hub', auth: true },
  ];

  const gameLinks = [
    { path: '/emergency-kit', label: 'Emergency Kit Builder' },
    { path: '/emergency-card-swap', label: 'Card Swap Game' },
    { path: '/disaster-map', label: 'Disaster Map' },
  ];

  if (user?.role === 'admin' || user?.role === 'teacher') {
    navLinks.push({ path: '/admin', label: t('nav.admin'), auth: true });
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🛡️</span>
            </div>
            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">{t('app_name')}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* Games Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors flex items-center">
                Games
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {gameLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts */}
            <AlertDropdown />

            {/* Language Selector */}
            <button
              onClick={() => setShowLanguage(!showLanguage)}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors"
            >
              <FiGlobe size={20} />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle variant="dropdown" size="md" />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-blue-600"
                >
                  <FiUser size={20} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <FiLogOut size={20} />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-3">
                {navLinks.map((link) => {
                  if (link.auth && !isAuthenticated) return null;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                    >
                      {link.label}
                    </Link>
                  );
                })}
                
                {/* Games Section */}
                <div className="px-4 py-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Games</div>
                  {gameLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded ml-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Language Selector Dropdown */}
      {showLanguage && (
        <div className="absolute top-16 right-4">
          <LanguageSelector onClose={() => setShowLanguage(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;