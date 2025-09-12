// client/src/pages/GamePlay.jsx
// Game play page with VR and desktop modes

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowLeftIcon,
  UsersIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import GameCanvas from '../components/GameCanvas';
import gameSocketService from '../utils/gameSocket';
import { useAuth } from '../contexts/AuthContext';

const GamePlay = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameMode, setGameMode] = useState('desktop');
  const [currentScore, setCurrentScore] = useState(0);
  const [gameResults, setGameResults] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const vrFrameRef = useRef(null);

  // Fetch game session
  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/games/${sessionId}`);
        const data = await response.json();

        if (data.status === 'success') {
          setGameSession(data.data);
          setGameMode(data.data.mode);
          setParticipants(data.data.participants || []);
        } else {
          setError(data.message || 'Failed to fetch game session');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchGameSession();
    }
  }, [sessionId]);

  // Socket event listeners
  useEffect(() => {
    const socket = gameSocketService.socket;
    if (!socket) return;

    const handleGameStarted = (session) => {
      setGameSession(session);
      setGameActive(true);
    };

    const handleGameEnded = (session) => {
      setGameSession(session);
      setGameActive(false);
      setShowResults(true);
    };

    const handlePlayerJoined = (data) => {
      setParticipants(data.participants);
    };

    const handlePlayerLeft = (data) => {
      setParticipants(data.participants);
    };

    const handleScoreUpdated = (data) => {
      // Update participant scores
      setParticipants(prev => prev.map(p => 
        p.user._id === data.user._id 
          ? { ...p, score: data.score }
          : p
      ));
    };

    socket.on('game:started', handleGameStarted);
    socket.on('game:ended', handleGameEnded);
    socket.on('player:joined', handlePlayerJoined);
    socket.on('player:left', handlePlayerLeft);
    socket.on('score:updated', handleScoreUpdated);

    return () => {
      socket.off('game:started', handleGameStarted);
      socket.off('game:ended', handleGameEnded);
      socket.off('player:joined', handlePlayerJoined);
      socket.off('player:left', handlePlayerLeft);
      socket.off('score:updated', handleScoreUpdated);
    };
  }, []);

  // VR message handler
  useEffect(() => {
    const handleVRMessage = (event) => {
      if (event.data.type === 'vr:complete') {
        const vrData = event.data.data;
        setGameResults(vrData);
        setGameActive(false);
        setShowResults(true);
        
        // Submit score
        submitScore(vrData.score, vrData);
      }
    };

    window.addEventListener('message', handleVRMessage);
    return () => window.removeEventListener('message', handleVRMessage);
  }, []);

  const startGame = async () => {
    try {
      const response = await fetch(`/api/games/${sessionId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('am_token')}`
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setGameActive(true);
      } else {
        setError(data.message || 'Failed to start game');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const submitScore = async (score, gameData) => {
    try {
      const response = await fetch(`/api/games/${sessionId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('am_token')}`
        },
        body: JSON.stringify({
          score,
          gameData
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setGameResults(data.data);
      } else {
        setError(data.message || 'Failed to submit score');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const handleGameEnd = (results) => {
    setGameResults(results);
    setGameActive(false);
    setShowResults(true);
    submitScore(results.score, results);
  };

  const handleScoreUpdate = (score) => {
    setCurrentScore(score);
  };

  const renderVRScene = () => {
    if (gameSession?.gameType === 'vr-drill') {
      const vrScene = gameSession.gameType === 'vr-drill' 
        ? 'https://4874ed25.webapp-d9d.pages.dev/'
        : '/assets/vr/fire-building.html';

      return (
        <iframe
          ref={vrFrameRef}
          src={vrScene}
          className="w-full h-full border-0"
          title="3D Simulation Scene"
        />
      );
    }
    return null;
  };

  const renderGameCanvas = () => {
    if (gameSession?.gameType === 'rescue-rush') {
      return (
        <GameCanvas
          onScoreUpdate={handleScoreUpdate}
          onGameEnd={handleGameEnd}
          gameMode={gameMode}
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/game/lobby')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Session Not Found</h2>
          <p className="text-gray-600 mb-4">The game session you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/game/lobby')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/game/lobby')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Lobby</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{gameSession.name}</h1>
                <p className="text-gray-600">{gameSession.gameType.replace('-', ' ').toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>

              {/* Participants */}
              <div className="flex items-center space-x-2">
                <UsersIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{participants.length}/{gameSession.maxParticipants}</span>
              </div>

              {/* Host Badge */}
              {gameSession.host?._id === user._id && (
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  You are the host
                </div>
              )}

              {/* Game Status */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                gameSession.status === 'waiting' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : gameSession.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {gameSession.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Game Controls */}
              {!gameActive && gameSession.status === 'waiting' && (
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Waiting for players...</h3>
                      <p className="text-sm text-gray-600">
                        {participants.length} of {gameSession.maxParticipants} players joined
                      </p>
                    </div>
                    
                    {gameSession.host._id === user._id && (
                      <button
                        onClick={startGame}
                        disabled={participants.length < 2}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <PlayIcon className="w-5 h-5" />
                        <span>Start Game</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Game Display */}
              <div className="relative" style={{ height: '600px' }}>
                {gameActive ? (
                  <AnimatePresence mode="wait">
                    {gameMode === 'vr' ? (
                      <motion.div
                        key="vr"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                        {renderVRScene()}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="desktop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                      >
                        {renderGameCanvas()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎮</div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {gameSession.status === 'waiting' ? 'Waiting to start...' : 'Game ended'}
                      </h3>
                      <p className="text-gray-600">
                        {gameSession.status === 'waiting' 
                          ? 'The host will start the game when ready'
                          : 'Check the results below'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Participants</h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={participant.user._id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {participant.user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{participant.user.name}</p>
                      <p className="text-xs text-gray-500">{participant.user.school}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{participant.score}</p>
                      <p className="text-xs text-gray-500">
                        {participant.status === 'playing' ? 'Playing' : 'Waiting'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Game Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{gameSession.gameType.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium">{gameSession.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Host:</span>
                  <span className="font-medium">{gameSession.host.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(gameSession.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && gameResults && (
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
              className="bg-white rounded-lg p-8 w-full max-w-md text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Complete!</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Score:</span>
                  <span className="font-bold text-2xl text-blue-600">{gameResults.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{gameResults.timeSpent}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{gameResults.performance?.accuracy?.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResults(false);
                    navigate('/game/lobby');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Back to Lobby
                </button>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setGameActive(false);
                    setCurrentScore(0);
                    setGameResults(null);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePlay;
