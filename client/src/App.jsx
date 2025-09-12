import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import './styles/global.css';
import './styles/dark-mode.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyContacts from "./pages/EmergencyContacts";
import EmergencyKitBuilder from "./pages/EmergencyKitBuilder";
import EmergencyCardSwap from "./pages/EmergencyCardSwap";
import ChatPage from "./pages/ChatPage";
import DisasterMap from "./components/DisasterMap";
import MapTest from "./components/MapTest";
import SimpleMapTest from "./components/SimpleMapTest";
import MapTestSuite from "./components/MapTestSuite";
import MapTestComponent from "./components/MapTest";
import SimpleAlertMap from "./components/SimpleAlertMap";
import ErrorBoundary from "./components/ErrorBoundary";
import QuizList from "./pages/QuizList";
import QuizPage from "./pages/QuizPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import DrillsPage from "./pages/DrillsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lobby from "./pages/Lobby";
import GamePlay from "./pages/GamePlay";
import Modules from "./pages/Modules";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingChatIcon from "./components/FloatingChatIcon";
// WeatherAlertBanner deprecated; using AlertDropdown in Navbar
import gameSocketService from "./utils/gameSocket";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('am_token') || localStorage.getItem('token');
    if (token) {
      try {
        gameSocketService.connect(token);
      } catch (error) {
        console.error('Failed to connect to game socket:', error);
      }
    }

    return () => {
      gameSocketService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800">Aapda Mitra</h2>
          <p className="mt-2 text-gray-600">Loading disaster preparedness platform...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
          <Navbar />
          <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/emergency" element={<EmergencyContacts />} />
                <Route path="/emergency-kit" element={<EmergencyKitBuilder />} />
                <Route path="/emergency-card-swap" element={<EmergencyCardSwap />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/disaster-map" element={<ErrorBoundary><DisasterMap /></ErrorBoundary>} />
                <Route path="/map-test" element={<MapTest />} />
                <Route path="/simple-map" element={<SimpleMapTest />} />
                <Route path="/map-tests" element={<MapTestSuite />} />
                <Route path="/map-debug" element={<MapTestComponent />} />
                <Route path="/simple-alert-map" element={
                  <SimpleAlertMap 
                    isOpen={true} 
                    onClose={() => {}} 
                    alert={{ 
                      title: 'Earthquake Alert - Punjab Region', 
                      description: 'Moderate earthquake detected in Punjab region',
                      type: 'earthquake',
                      severity: 'moderate',
                      location: 'Punjab, India',
                      coordinates: { lat: 31.1471, lng: 75.3412 }
                    }}
                  />
                } />
                <Route path="/test-map-loading" element={
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Google Maps API Test</h1>
                    <div className="mb-4">
                      <p>Google Maps Available: {window.google ? 'Yes' : 'No'}</p>
                      <p>Google Maps Object: {window.google?.maps ? 'Yes' : 'No'}</p>
                      <p>Google Maps Map Constructor: {window.google?.maps?.Map ? 'Yes' : 'No'}</p>
                    </div>
                    <SimpleAlertMap 
                      isOpen={true} 
                      onClose={() => {}} 
                      alert={{ 
                        title: 'API Test Alert', 
                        description: 'Testing Google Maps API loading',
                        location: 'Delhi, India',
                        coordinates: { lat: 28.6139, lng: 77.2090 }
                      }}
                    />
                  </div>
                } />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/quizzes" element={<QuizList />} />
                <Route path="/modules" element={<Modules />} />

                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/drills" element={<ProtectedRoute><DrillsPage /></ProtectedRoute>} />
                <Route path="/game/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
                <Route path="/game/play/:sessionId" element={<ProtectedRoute><GamePlay /></ProtectedRoute>} />
                <Route path="/modules/:id" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          <FloatingChatIcon />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
