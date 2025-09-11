import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FiBookOpen, FiAward, FiUsers, FiAlertTriangle, 
  FiShield, FiTarget, FiTrendingUp, FiZap 
} from 'react-icons/fi';

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();

  const features = [
    {
      icon: <FiBookOpen size={24} />,
      title: 'Interactive Learning',
      description: 'Engaging disaster preparedness modules tailored for students',
      color: 'blue'
    },
    {
      icon: <FiAward size={24} />,
      title: 'Gamification',
      description: 'Earn badges, points, and climb the leaderboard',
      color: 'green'
    },
    {
      icon: <FiShield size={24} />,
      title: 'Virtual Drills',
      description: 'Practice emergency response through simulations',
      color: 'purple'
    },
    {
      icon: <FiZap size={24} />,
      title: 'AI-Powered',
      description: 'Personalized learning with AI chatbot assistance',
      color: 'yellow'
    },
    {
      icon: <FiAlertTriangle size={24} />,
      title: 'Disaster Map',
      description: 'Real-time calamity detection with safest escape routes',
      color: 'red',
      link: '/disaster-map',
      badge: 'NEW'
    }
  ];

  const stats = [
    { label: 'Active Schools', value: '150+' },
    { label: 'Students Trained', value: '10,000+' },
    { label: 'Quizzes Completed', value: '50,000+' },
    { label: 'Preparedness Score', value: '85%' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 dark:opacity-20"></div>
        <motion.div variants={itemVariants} className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {t('home.welcome')}
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
              variants={itemVariants}
            >
              {t('home.subtitle')}
            </motion.p>
            
            {isAuthenticated ? (
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link
                  to="/quizzes"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('home.take_quiz')}
                </Link>
                <Link
                  to="/drills"
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('home.practice_drills')}
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  {t('home.view_leaderboard')}
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/drills"
                    className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 text-lg font-semibold"
                  >
                    🥽 Start Drill
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg font-semibold"
                  >
                    {t('home.start_learning')}
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
        <motion.div variants={containerVariants} className="container mx-auto px-4">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12"
          >
            Why Choose Aapda Mitra?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const FeatureContent = (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white dark:bg-gray-700 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-600 relative overflow-hidden group"
                >
                  {feature.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {feature.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 text-${feature.color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-50 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {feature.link && (
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Explore Now
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </motion.div>
              );

              return feature.link ? (
                <Link key={index} to={feature.link}>
                  {FeatureContent}
                </Link>
              ) : (
                <div key={index}>
                  {FeatureContent}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <motion.div variants={containerVariants} className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center text-white"
              >
                <motion.div 
                  className="text-4xl font-bold mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16">
          <motion.div 
            variants={itemVariants}
            className="container mx-auto px-4 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Ready to Make Your School Disaster-Ready?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of students and teachers preparing for emergencies through gamified learning
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg font-semibold"
            >
              Get Started Now
            </Link>
          </motion.div>
        </section>
      )}
    </motion.div>
  );
};

export default Home;