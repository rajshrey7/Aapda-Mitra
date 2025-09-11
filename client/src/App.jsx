import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
  );
}

export default App;
