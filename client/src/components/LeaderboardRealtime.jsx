// client/src/components/LeaderboardRealtime.jsx
// Real-time leaderboard component with socket updates

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/solid';
import gameSocketService from '../utils/gameSocket';

const LeaderboardRealtime = ({ 
  gameType = 'rescue-rush', 
  mode = 'desktop', 
  schoolId = null,
  limit = 10 
}) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('global'); // 'global', 'school', 'region'
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async (mode = 'global') => {
    try {
      setLoading(true);
      let url = `/api/leaderboard/${mode}`;
      
      if (mode === 'school' && schoolId) {
        url += `/${schoolId}`;
      } else if (mode === 'region') {
        url += '/Punjab'; // Default region
      }
      
      url += `?gameType=${gameType}&mode=${mode}&limit=${limit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'success') {
        setLeaderboard(data.data.leaderboard || []);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLeaderboard(viewMode);
  }, [gameType, mode, schoolId, limit, viewMode]);

  // Socket event listeners
  useEffect(() => {
    const socket = gameSocketService.socket;
    if (!socket) return;

    const handleLeaderboardUpdate = (data) => {
      // Refresh leaderboard when updates are received
      if (data.type === 'game' && data.gameType === gameType && data.mode === mode) {
        fetchLeaderboard(viewMode);
      } else if (data.type === 'school' && viewMode === 'school') {
        fetchLeaderboard(viewMode);
      } else if (data.type === 'region' && viewMode === 'region') {
        fetchLeaderboard(viewMode);
      }
    };

    socket.on('leaderboard:update', handleLeaderboardUpdate);

    return () => {
      socket.off('leaderboard:update', handleLeaderboardUpdate);
    };
  }, [gameType, mode, viewMode]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(viewMode);
    }, 30000);

    return () => clearInterval(interval);
  }, [viewMode]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <TrophyIcon className="w-6 h-6 text-gray-400" />;
      case 3:
        return <TrophyIcon className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 1000) return 'text-green-500';
    if (score >= 500) return 'text-blue-500';
    if (score >= 200) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const formatScore = (score) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toString();
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Leaderboard</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('global')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'global'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setViewMode('school')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'school'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            School
          </button>
          <button
            onClick={() => setViewMode('region')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'region'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Region
          </button>
        </div>
      </div>

      {/* Game Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <FireIcon className="w-4 h-4" />
            <span>{gameType.replace('-', ' ').toUpperCase()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <UserGroupIcon className="w-4 h-4" />
            <span>{mode.toUpperCase()}</span>
          </span>
        </div>
        
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchLeaderboard(viewMode)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        <AnimatePresence>
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.user?._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {entry.user?.profileImage ? (
                    <img
                      src={entry.user.profileImage}
                      alt={entry.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {entry.user?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.user?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {entry.user?.school || 'Unknown School'}
                </p>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <p className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                  {formatScore(entry.score)}
                </p>
                {entry.accuracy && (
                  <p className="text-xs text-gray-500">
                    {entry.accuracy.toFixed(1)}% accuracy
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-8">
            <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No scores yet</p>
            <p className="text-sm text-gray-400">Be the first to play!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && leaderboard.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Updating...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Real-time updates enabled</span>
          <button
            onClick={() => fetchLeaderboard(viewMode)}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardRealtime;
