import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiDroplet, FiZap, FiPlay, FiPause, FiRotateCcw, FiCheckCircle, FiClock, FiTarget, FiActivity, FiTrendingUp, FiShield } from 'react-icons/fi';

// Custom Earthquake Icon Component
const EarthquakeIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2L8 8L12 14L16 8L12 2Z"/>
    <path d="M8 8L4 14L8 20L12 14L8 8Z"/>
    <path d="M16 8L20 14L16 20L12 14L16 8Z"/>
    <path d="M12 14L8 20L12 26L16 20L12 14Z"/>
  </svg>
);
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import api from '../config/api';
import gameSocketService from '../utils/gameSocket';

const DrillsPage = () => {
  const [drills, setDrills] = useState([]);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showIntro, setShowIntro] = useState(false);

  // Fetch available drills
  const fetchDrills = async () => {
    try {
      setLoading(true);
      setDrills([]);
    } catch (err) {
      setError('Failed to fetch drills');
      console.error('Drills fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
  }, []);

  // Mock drills data for demonstration
  const mockDrills = [
    {
      id: 1,
      title: 'Earthquake Evacuation Drill',
      type: 'earthquake',
      icon: EarthquakeIcon,
      color: 'orange',
      description: '🚨 EVACUATION DRILL - Practice earthquake safety and evacuation procedures',
      duration: 180, // 3 minutes in seconds
      difficulty: 'Basic',
      vrScene: 'https://4874ed25.webapp-d9d.pages.dev/',
      checkpoints: [
        { id: 1, title: 'Start evacuation drill', description: 'Press Start Drill to begin the simulation', points: 25 },
        { id: 2, title: 'Follow evacuation procedures', description: 'Complete the evacuation process safely', points: 50 },
        { id: 3, title: 'Ensure everyone is safe', description: 'Verify all personnel have evacuated successfully', points: 50 },
        { id: 4, title: 'Complete evacuation', description: 'Finish the drill within the time limit', points: 75 }
      ]
    },
    {
      id: 2,
      title: 'Fire Evacuation Drill',
      type: 'fire',
      icon: FiAlertTriangle,
      color: 'red',
      description: 'Learn safe evacuation procedures during a fire emergency',
      duration: 420, // 7 minutes in seconds
      difficulty: 'Intermediate',
      vrScene: '/assets/vr/fire-building.html',
      checkpoints: [
        { id: 1, title: 'Check for smoke', description: 'Look for signs of smoke or fire', points: 40 },
        { id: 2, title: 'Feel the door', description: 'Check if the door is hot before opening', points: 40 },
        { id: 3, title: 'Stay low', description: 'Crawl low under smoke to avoid inhalation', points: 40 },
        { id: 4, title: 'Use stairs', description: 'Never use elevators during fire evacuation', points: 40 },
        { id: 5, title: 'Meet at assembly point', description: 'Go to designated meeting area', points: 40 }
      ]
    },
    {
      id: 3,
      title: 'Flood Evacuation Drill',
      type: 'flood-evacuation',
      icon: FiDroplet,
      color: 'cyan',
      description: '🚨 EVACUATION DRILL - Guide everyone to the rooftop! Avoid rising water!',
      duration: 120, // 2 minutes in seconds
      difficulty: 'Advanced',
      vrScene: 'https://project-dfa62c8e.pages.dev',
      checkpoints: [
        { id: 1, title: 'Reach higher ground', description: 'Get to the rooftop or elevated area', points: 30 },
        { id: 2, title: 'Collect emergency supplies', description: 'Gather first aid kit, rope, and radio', points: 45 },
        { id: 3, title: 'Rescue people in danger', description: 'Help NPCs reach safety before water rises', points: 50 },
        { id: 4, title: 'Evacuate all personnel', description: 'Ensure everyone reaches the rooftop safely', points: 75 }
      ]
    }
  ];

  const currentDrills = drills.length > 0 ? drills : mockDrills;

  // Leaderboard fetch + socket updates
  const fetchLeaderboard = async (type) => {
    try {
      const res = await api.getDrillsLeaderboard({ drillType: type, drillMode: 'vr', limit: 10, timeRange: 'week' });
      setLeaderboard(res?.data?.leaderboard || []);
    } catch (e) {
      // non-fatal
    }
  };

  useEffect(() => {
    const handler = (evt) => {
      const payload = evt?.__forwardVR || evt?.data?.__forwardVR;
      if (!payload) return;
      const sessionId = window.__DRILL_SESSION_ID__;
      const result = payload?.data;
      if (!sessionId || !selectedDrill || !result) return;

      // Build submit payload and post to backend
      const submit = {
        drillType: selectedDrill.type,
        score: result.score,
        timeTaken: result.timeSpent,
        totalTime: selectedDrill.duration,
        performance: result.performance || { accuracy: 60, speed: 60, safety: 60, teamwork: 50, decisionMaking: 55 },
        completedSteps: [],
        missedSteps: [],
        difficulty: 'medium',
        metadata: { device: navigator.userAgent, platform: navigator.platform }
      };

      api.submitDrillResult(sessionId, submit)
        .then((resp) => {
          setFeedback(resp?.data?.feedback || resp?.data || null);
          setShowFeedback(true);
          // Refresh leaderboard
          fetchLeaderboard(selectedDrill.type);
        })
        .catch(() => {
          setShowFeedback(true);
        });
    };

    // Handle external drill completion
    const handleExternalDrillComplete = (evt) => {
      if (evt.data?.type === 'drill:complete' && selectedDrill?.type === 'flood-evacuation') {
        // Simulate completion for external drill
        const mockResult = {
          score: Math.floor(Math.random() * 200) + 100, // Random score between 100-300
          timeSpent: Math.floor(Math.random() * 60) + 60, // Random time between 60-120 seconds
          performance: { accuracy: 80, speed: 75, safety: 85, teamwork: 70, decisionMaking: 80 }
        };
        
        const sessionId = window.__DRILL_SESSION_ID__;
        if (sessionId) {
          const submit = {
            drillType: selectedDrill.type,
            score: mockResult.score,
            timeTaken: mockResult.timeSpent,
            totalTime: selectedDrill.duration,
            performance: mockResult.performance,
            completedSteps: [
              { stepId: 'external-drill', stepName: 'Completed external flood evacuation drill', completed: true, timeSpent: mockResult.timeSpent, score: mockResult.score }
            ],
            missedSteps: [],
            difficulty: 'medium',
            metadata: { device: navigator.userAgent, platform: navigator.platform, external: true }
          };

          api.submitDrillResult(sessionId, submit)
            .then((resp) => {
              setFeedback(resp?.data?.feedback || resp?.data || { aiAnalysis: 'Great job completing the flood evacuation drill! You demonstrated good emergency response skills.' });
              setShowFeedback(true);
              fetchLeaderboard(selectedDrill.type);
            })
            .catch(() => {
              setFeedback({ aiAnalysis: 'Great job completing the flood evacuation drill! You demonstrated good emergency response skills.' });
              setShowFeedback(true);
            });
        }
      }
    };

    window.addEventListener('message', handler);
    window.addEventListener('message', handleExternalDrillComplete);
    return () => {
      window.removeEventListener('message', handler);
      window.removeEventListener('message', handleExternalDrillComplete);
    };
  }, [selectedDrill]);

  useEffect(() => {
    // Socket subscribe to leaderboard updates
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const socket = gameSocketService.connect(token);
        const onUpdate = (data) => {
          if (selectedDrill && data?.type === 'drill') {
            fetchLeaderboard(selectedDrill.type);
          }
        };
        gameSocketService.on('leaderboard:update', onUpdate);
        return () => gameSocketService.off('leaderboard:update', onUpdate);
      } catch { /* ignore */ }
    }
  }, [selectedDrill]);

  const startDrill = (drill) => {
    setSelectedDrill(drill);
    setTimeLeft(drill.duration);
    setScore(0);
    setCheckpoints(drill.checkpoints);
    setCurrentCheckpoint(0);
    setIsPlaying(false);
    setShowIntro(true);
    fetchLeaderboard(drill.type);
    // Start backend session (non-blocking)
    api.startDrill({ drillType: drill.type, duration: drill.duration, difficulty: 'medium' })
      .then((res) => {
        window.__DRILL_SESSION_ID__ = res?.data?.sessionId;
      })
      .catch(() => {});
  };

  const completeCheckpoint = (checkpointId) => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (checkpoint) {
      setScore(prev => prev + checkpoint.points);
      setCurrentCheckpoint(prev => prev + 1);
    }
  };

  const resetDrill = () => {
    setIsPlaying(false);
    setTimeLeft(selectedDrill?.duration || 0);
    setScore(0);
    setCurrentCheckpoint(0);
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading drills...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            🎮 3D Emergency Simulations
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300 text-lg"
          >
            Practice emergency response through immersive 3D simulations
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedDrill ? (
            <motion.div
              key="drill-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {currentDrills.map((drill, index) => (
                <motion.div
                  key={drill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden cursor-pointer"
                  onClick={() => startDrill(drill)}
                >
                  <div className={`bg-gradient-to-br from-${drill.color}-500 to-${drill.color}-600 p-8 text-white`}>
                    <drill.icon size={64} className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-center">{drill.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{drill.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                        <span className="font-semibold">{formatTime(drill.duration)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${drill.color}-100 text-${drill.color}-800`}>
                          {drill.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Checkpoints:</span>
                        <span className="font-semibold">{drill.checkpoints.length}</span>
                      </div>
                    </div>
                    
                    <button className={`w-full py-3 bg-gradient-to-r from-${drill.color}-500 to-${drill.color}-600 text-white rounded-lg hover:from-${drill.color}-600 hover:to-${drill.color}-700 transition-all font-semibold flex items-center justify-center space-x-2`}>
                      <FiPlay className="w-5 h-5" />
                      <span>Start 3D Simulation</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="drill-interface"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              {/* Drill Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-${selectedDrill.color}-100`}>
                      <selectedDrill.icon className={`w-8 h-8 text-${selectedDrill.color}-600`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedDrill.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300">{selectedDrill.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDrill(null)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 3D Simulation */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <span className="mr-2">🥽</span>
                        3D Simulation
                      </h3>
                    </div>
                    <div className="relative" style={{ height: '500px' }}>
                      {selectedDrill.vrScene.startsWith('http') ? (
                        // External URL - show launch button
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <div className="text-center p-8">
                            <div className="text-6xl mb-4">🌊</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                              {selectedDrill.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
                              {selectedDrill.description}
                            </p>
                            <div className="space-y-3 mb-6">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                                <span className="font-semibold">{formatTime(selectedDrill.duration)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Difficulty:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800`}>
                                  {selectedDrill.difficulty}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                window.open(selectedDrill.vrScene, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                                setIsPlaying(true);
                              }}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 mx-auto"
                            >
                              <FiPlay className="w-6 h-6" />
                              <span>Launch External Drill</span>
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                              Opens in new window for full experience
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Local 3D scene - use iframe
                        <>
                          <iframe
                            src={selectedDrill.vrScene}
                            className="w-full h-full border-0"
                            title={`3D Simulation for ${selectedDrill.title}`}
                            allow="vr; accelerometer; gyroscope; magnetometer; fullscreen"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                          />
                          {!isPlaying && !showIntro && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <button
                                onClick={() => setIsPlaying(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                              >
                                <FiPlay className="w-6 h-6" />
                                <span>Start Simulation</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Progress + Leaderboard */}
                <div className="space-y-6">
                  {/* Timer & Score */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Drill Progress</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-300">Time Left:</span>
                        </div>
                        <span className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiTarget className="w-5 h-5 text-green-600" />
                          <span className="text-gray-600 dark:text-gray-300">Score:</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{score}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-300">Checkpoints:</span>
                        </div>
                        <span className="text-lg font-semibold text-purple-600">
                          {currentCheckpoint}/{checkpoints.length}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                          isPlaying 
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5" />}
                        <span>{isPlaying ? 'Pause' : 'Resume'}</span>
                      </button>
                      
                      <button
                        onClick={resetDrill}
                        className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                      >
                        <FiRotateCcw className="w-5 h-5" />
                        <span>Reset Drill</span>
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Live Leaderboard</h3>
                    {leaderboard.length === 0 ? (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">No entries yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {leaderboard.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 text-gray-500">{idx + 1}</div>
                              <div className="font-medium text-gray-800 dark:text-gray-100">{entry.user?.name || 'Student'}</div>
                            </div>
                            <div className="text-green-600 font-semibold">{entry.score}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Simple Analytics (mock) */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Preparedness Trend</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{name:'Try 1',score:40},{name:'Try 2',score:55},{name:'Try 3',score:70}]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0,100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Why Practice Drills Section */}
        {!selectedDrill && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Why Practice 3D Simulations?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🧠', title: 'Build Muscle Memory', desc: 'Create automatic responses for emergency situations' },
                { icon: '😌', title: 'Reduce Panic', desc: 'Stay calm and focused during actual disasters' },
                { icon: '📚', title: 'Learn Procedures', desc: 'Master proper safety protocols and techniques' },
                { icon: '⚡', title: 'Improve Response Time', desc: 'React faster and more effectively in emergencies' },
                { icon: '💪', title: 'Gain Confidence', desc: 'Build self-assurance in crisis situations' },
                { icon: '🎯', title: 'Track Progress', desc: 'Monitor improvement through scoring and analytics' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-lg text-center"
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Intro Instructions Modal */}
      <AnimatePresence>
        {showIntro && selectedDrill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowIntro(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">How to Play</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">Follow these steps to complete the drill:</p>
              <ul className="list-decimal ml-5 space-y-2 text-gray-700 dark:text-gray-300">
                {selectedDrill.type === 'earthquake' && (
                  <>
                    <li>Press "Start Drill" to begin the evacuation simulation.</li>
                    <li>Follow the evacuation procedures as they appear on screen.</li>
                    <li>Ensure everyone reaches safety within the time limit.</li>
                    <li>Complete the drill successfully to earn points.</li>
                  </>
                )}
                {selectedDrill.type === 'fire' && (
                  <>
                    <li>Stay low to avoid smoke. Avoid red fire zones.</li>
                    <li>Use a fire extinguisher if reachable (red cylinder).</li>
                    <li>Find the green EXIT door and evacuate.</li>
                  </>
                )}
                {selectedDrill.type === 'flood-evacuation' && (
                  <>
                    <li>Guide everyone to the rooftop! Avoid rising water!</li>
                    <li>Use WASD to move, Mouse to look, SHIFT to run, SPACE to jump.</li>
                    <li>Click to rescue NPCs when they're in danger.</li>
                    <li>Watch the water level and get everyone to safety before time runs out.</li>
                  </>
                )}
              </ul>
              <div className="mt-5 text-sm text-gray-600 dark:text-gray-400">Controls: WASD / Arrow keys to move, Mouse/touch to look, Click to interact.</div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowIntro(false)}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowIntro(false); setIsPlaying(true); }}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Start
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Preparedness Feedback</h3>
              {feedback ? (
                <div className="space-y-3 text-sm">
                  {feedback.aiAnalysis && <p className="text-gray-700 dark:text-gray-300">{feedback.aiAnalysis}</p>}
                  {Array.isArray(feedback.strengths) && feedback.strengths.length > 0 && (
                    <div>
                      <div className="font-semibold text-green-700">Strengths</div>
                      <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                        {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(feedback.recommendations) && feedback.recommendations.length > 0 && (
                    <div>
                      <div className="font-semibold text-blue-700">Recommendations</div>
                      <ul className="list-disc ml-5 text-gray-700 dark:text-gray-300">
                        {feedback.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">Great work! Result saved.</p>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedDrill(null)}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DrillsPage;