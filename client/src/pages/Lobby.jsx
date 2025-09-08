// client/src/pages/Lobby.jsx
// Game lobby with session management and real-time updates

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PlayIcon, 
  UsersIcon, 
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import LeaderboardRealtime from '../components/LeaderboardRealtime';
import LiveAlerts from '../components/LiveAlerts';
import gameSocketService from '../utils/gameSocket';
import { useAuth } from '../contexts/AuthContext';

const Lobby = () => {
  const { user } = useAuth();
  const [gameSessions, setGameSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSession, setNewSession] = useState({
    name: '',
    gameType: 'rescue-rush',
    mode: 'desktop',
    maxParticipants: 10,
    description: ''
  });

  // Fetch game sessions
  const fetchGameSessions = async () => {
    try {
      const response = await fetch('/api/games/list');
      const data = await response.json();

      if (data.status === 'success') {
        setGameSessions(data.data);
      } else {
        setError(data.message || 'Failed to fetch game sessions');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  // Fetch modules
  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules?limit=6');
      const data = await response.json();

      if (data.status === 'success') {
        setModules(data.data.modules);
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGameSessions(), fetchModules()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Socket event listeners
  useEffect(() => {
    const socket = gameSocketService.socket;
    if (!socket) return;

    const handleGameCreated = (session) => {
      setGameSessions(prev => [session, ...prev]);
    };

    const handlePlayerJoined = (data) => {
      setGameSessions(prev => prev.map(session => 
        session._id === data.sessionId 
          ? { ...session, participants: data.participants }
          : session
      ));
    };

    const handlePlayerLeft = (data) => {
      setGameSessions(prev => prev.map(session => 
        session._id === data.sessionId 
          ? { ...session, participants: data.participants }
          : session
      ));
    };

    socket.on('game:created', handleGameCreated);
    socket.on('player:joined', handlePlayerJoined);
    socket.on('player:left', handlePlayerLeft);

    return () => {
      socket.off('game:created', handleGameCreated);
      socket.off('player:joined', handlePlayerJoined);
      socket.off('player:left', handlePlayerLeft);
    };
  }, []);

  // Auto-refresh sessions
  useEffect(() => {
    const interval = setInterval(fetchGameSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('am_token')}`
        },
        body: JSON.stringify(newSession)
      });

      const data = await response.json();

      if (data.status === 'success') {
        setShowCreateSession(false);
        setNewSession({
          name: '',
          gameType: 'rescue-rush',
          mode: 'desktop',
          maxParticipants: 10,
          description: ''
        });
        // Navigate to game session
        window.location.href = `/game/play/${data.data._id}`;
      } else {
        setError(data.message || 'Failed to create game session');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/games/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('am_token')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Navigate to game session
        window.location.href = `/game/play/${sessionId}`;
      } else {
        setError(data.message || 'Failed to join game session');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const getGameTypeIcon = (gameType) => {
    switch (gameType) {
      case 'rescue-rush':
        return '🚁';
      case 'vr-drill':
        return '🥽';
      case 'quiz-battle':
        return '🧠';
      case 'disaster-sim':
        return '🌪️';
      default:
        return '🎮';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'desktop':
        return <ComputerDesktopIcon className="w-4 h-4" />;
      case 'mobile':
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case 'vr':
        return <EyeIcon className="w-4 h-4" />;
      default:
        return <ComputerDesktopIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Game Lobby</h1>
          <p className="text-gray-600">Join existing games or create your own session</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Create Session Button */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Game Sessions</h2>
                {user?.role === 'teacher' || user?.role === 'admin' ? (
                  <button
                    onClick={() => setShowCreateSession(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Session</span>
                  </button>
                ) : null}
              </div>

              {/* Game Sessions List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {gameSessions.map((session) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{getGameTypeIcon(session.gameType)}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {session.name}
                              {session.host && user && session.host._id === user._id && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  You are the host
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center space-x-1">
                                {getModeIcon(session.mode)}
                                <span>{session.mode}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <UsersIcon className="w-4 h-4" />
                                <span>{session.participants.length}/{session.maxParticipants}</span>
                              </span>
                              {session.host?.name && (
                                <span className="text-xs text-gray-500">Host: {session.host.name}</span>
                              )}
                              <span className="flex items-center space-x-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{new Date(session.createdAt).toLocaleTimeString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'waiting' 
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                          
                          {session.status === 'waiting' && (
                            <button
                              onClick={() => handleJoinSession(session._id)}
                              className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                            >
                              <PlayIcon className="w-4 h-4" />
                              <span>Join</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {gameSessions.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎮</div>
                    <p className="text-gray-500">No active game sessions</p>
                    <p className="text-sm text-gray-400">Create one to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education Modules */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Education Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <motion.div
                    key={module._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/modules/${module._id}`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{module.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{module.category}</span>
                      <span className="text-xs text-blue-600">{module.lessons.length} lessons</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeaderboardRealtime />
            <LiveAlerts />
          </div>
        </div>

        {/* Create Session Modal */}
        <AnimatePresence>
          {showCreateSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Game Session</h3>
                
                <form onSubmit={handleCreateSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Name
                    </label>
                    <input
                      type="text"
                      value={newSession.name}
                      onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Type
                    </label>
                    <select
                      value={newSession.gameType}
                      onChange={(e) => setNewSession(prev => ({ ...prev, gameType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="rescue-rush">Rescue Rush Pro</option>
                      <option value="vr-drill">VR Drill</option>
                      <option value="quiz-battle">Quiz Battle</option>
                      <option value="disaster-sim">Disaster Simulation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode
                    </label>
                    <select
                      value={newSession.mode}
                      onChange={(e) => setNewSession(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="vr">VR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={newSession.maxParticipants}
                      onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newSession.description}
                      onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateSession(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Session
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Lobby;
