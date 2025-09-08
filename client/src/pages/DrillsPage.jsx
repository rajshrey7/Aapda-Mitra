import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiDroplet, FiZap, FiPlay, FiPause, FiRotateCcw, FiCheckCircle, FiClock, FiTarget } from 'react-icons/fi';
import axios from 'axios';

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

  // Fetch available drills
  const fetchDrills = async () => {
    try {
      setLoading(true);
      // Since there's no direct drills endpoint, we'll use mock data
      // In a real implementation, you would create a drills endpoint
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
      title: 'Earthquake Response Drill',
      icon: FiZap,
      color: 'orange',
      description: 'Practice Drop, Cover, and Hold On technique in a virtual classroom',
      duration: 300, // 5 minutes in seconds
      difficulty: 'Basic',
      vrScene: '/assets/vr/earthquake-classroom.html',
      checkpoints: [
        { id: 1, title: 'Drop to the ground', description: 'Get down on your hands and knees', points: 50 },
        { id: 2, title: 'Cover your head', description: 'Protect your head and neck with your arms', points: 50 },
        { id: 3, title: 'Hold on', description: 'Hold on to your shelter until shaking stops', points: 50 },
        { id: 4, title: 'Evacuate safely', description: 'Exit the building when safe to do so', points: 50 }
      ]
    },
    {
      id: 2,
      title: 'Fire Evacuation Drill',
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
      title: 'Flood Response Drill',
      icon: FiDroplet,
      color: 'blue',
      description: 'Understand flood safety and response measures',
      duration: 360, // 6 minutes in seconds
      difficulty: 'Basic',
      // Use existing scene for now to ensure it loads; can replace with /assets/vr/flood-scenario.html if added
      vrScene: '/assets/vr/earthquake-classroom.html',
      checkpoints: [
        { id: 1, title: 'Move to higher ground', description: 'Get to the highest floor possible', points: 60 },
        { id: 2, title: 'Avoid floodwaters', description: 'Never walk or drive through floodwaters', points: 60 },
        { id: 3, title: 'Turn off utilities', description: 'Turn off electricity and gas if safe', points: 60 },
        { id: 4, title: 'Stay informed', description: 'Listen to emergency broadcasts', points: 60 }
      ]
    }
  ];

  const currentDrills = drills.length > 0 ? drills : mockDrills;

  const startDrill = (drill) => {
    setSelectedDrill(drill);
    setTimeLeft(drill.duration);
    setScore(0);
    setCheckpoints(drill.checkpoints);
    setCurrentCheckpoint(0);
    setIsPlaying(true);
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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            🎮 Virtual Emergency Drills
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Practice emergency response through immersive VR simulations
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
                  className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer"
                  onClick={() => startDrill(drill)}
                >
                  <div className={`bg-gradient-to-br from-${drill.color}-500 to-${drill.color}-600 p-8 text-white`}>
                    <drill.icon size={64} className="mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-center">{drill.title}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 text-center">{drill.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duration:</span>
                        <span className="font-semibold">{formatTime(drill.duration)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Difficulty:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${drill.color}-100 text-${drill.color}-800`}>
                          {drill.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Checkpoints:</span>
                        <span className="font-semibold">{drill.checkpoints.length}</span>
                      </div>
                    </div>
                    
                    <button className={`w-full py-3 bg-gradient-to-r from-${drill.color}-500 to-${drill.color}-600 text-white rounded-lg hover:from-${drill.color}-600 hover:to-${drill.color}-700 transition-all font-semibold flex items-center justify-center space-x-2`}>
                      <FiPlay className="w-5 h-5" />
                      <span>Start VR Drill</span>
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
              <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-${selectedDrill.color}-100`}>
                      <selectedDrill.icon className={`w-8 h-8 text-${selectedDrill.color}-600`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedDrill.title}</h2>
                      <p className="text-gray-600">{selectedDrill.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDrill(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* VR Scene */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                      <h3 className="text-lg font-semibold flex items-center">
                        <span className="mr-2">🥽</span>
                        VR Simulation
                      </h3>
                    </div>
                    <div className="relative" style={{ height: '500px' }}>
                      <iframe
                        src={selectedDrill.vrScene}
                        className="w-full h-full border-0"
                        title={`VR Scene for ${selectedDrill.title}`}
                        allow="vr; accelerometer; gyroscope; magnetometer"
                      />
                      {!isPlaying && (
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
                    </div>
                  </div>
                </div>

                {/* Drill Controls & Progress */}
                <div className="space-y-6">
                  {/* Timer & Score */}
                  <div className="bg-white rounded-xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Drill Progress</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiClock className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600">Time Left:</span>
                        </div>
                        <span className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiTarget className="w-5 h-5 text-green-600" />
                          <span className="text-gray-600">Score:</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{score}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiCheckCircle className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-600">Checkpoints:</span>
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

                  {/* Checkpoints */}
                  <div className="bg-white rounded-xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkpoints</h3>
                    <div className="space-y-3">
                      {checkpoints.map((checkpoint, index) => (
                        <motion.div
                          key={checkpoint.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            index < currentCheckpoint
                              ? 'bg-green-50 border-green-300'
                              : index === currentCheckpoint
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-semibold ${
                                index < currentCheckpoint ? 'text-green-800' : 
                                index === currentCheckpoint ? 'text-blue-800' : 'text-gray-600'
                              }`}>
                                {checkpoint.title}
                              </h4>
                              <p className={`text-sm ${
                                index < currentCheckpoint ? 'text-green-600' : 
                                index === currentCheckpoint ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {checkpoint.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-semibold ${
                                index < currentCheckpoint ? 'text-green-600' : 
                                index === currentCheckpoint ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                {checkpoint.points} pts
                              </span>
                              {index < currentCheckpoint && (
                                <FiCheckCircle className="w-5 h-5 text-green-600 mt-1" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
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
            className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8"
          >
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Why Practice VR Drills?</h2>
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-8 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DrillsPage;