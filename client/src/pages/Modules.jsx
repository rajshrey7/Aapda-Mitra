// client/src/pages/Modules.jsx
// Education modules page with filtering and search

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  PlayIcon
} from '@heroicons/react/24/solid';
import ModulePlayer from '../components/ModulePlayer';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'earthquake', 'flood', 'fire', 'cyclone', 'first-aid', 
    'evacuation', 'communication', 'preparedness'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const languages = ['en', 'hi', 'pa'];

  // Fetch modules
  const fetchModules = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedLanguage) params.append('language', selectedLanguage);

      const response = await fetch(`/api/modules?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setModules(data.data.modules);
        setTotalPages(data.data.pagination.pages);
        setCurrentPage(data.data.pagination.page);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch modules');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchModules();
  }, []);

  // Search and filter
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchModules(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedLanguage]);

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleModuleComplete = (results) => {
    console.log('Module completed:', results);
    setSelectedModule(null);
    // Refresh modules to update completion stats
    fetchModules(currentPage);
  };

  const handleModuleProgress = (progress) => {
    console.log('Module progress:', progress);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'earthquake':
        return '🌍';
      case 'flood':
        return '🌊';
      case 'fire':
        return '🔥';
      case 'cyclone':
        return '🌀';
      case 'first-aid':
        return '🏥';
      case 'evacuation':
        return '🚪';
      case 'communication':
        return '📡';
      case 'preparedness':
        return '🛡️';
      default:
        return '📚';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setSelectedModule(null)}
            className="mb-6 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Modules
          </button>
          <ModulePlayer
            moduleId={selectedModule._id}
            onComplete={handleModuleComplete}
            onProgress={handleModuleProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Education Modules</h1>
          <p className="text-gray-600">Learn disaster preparedness through interactive modules</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Languages</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="pa">Punjabi</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modules Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {modules.map((module, index) => (
                <motion.div
                  key={module._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleModuleSelect(module)}
                >
                  {/* Module Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <div className="text-6xl">{getCategoryIcon(module.category)}</div>
                  </div>

                  {/* Module Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-sm text-gray-600">
                          {module.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {module.shortDescription || module.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDuration(module.estimatedDuration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{module.lessons.length} lessons</span>
                      </div>
                    </div>

                    <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <PlayIcon className="w-4 h-4" />
                      <span>Start Module</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && modules.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No modules found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={() => fetchModules(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => fetchModules(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchModules(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules;
