import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import WeatherAlertBanner from "./components/WeatherAlertBanner";
import LeaderboardPage from "./pages/LeaderboardPage";
import DrillsPage from "./pages/DrillsPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <WeatherAlertBanner />
        
        {/* Simple Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🛡️</span>
                </div>
                <span className="font-bold text-xl text-gray-800">Aapda Mitra</span>
              </div>
              
              <div className="flex space-x-4">
                <a href="/leaderboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Leaderboard
                </a>
                <a href="/drills" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  VR Drills
                </a>
                <a href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Admin
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-gray-800 mb-8">
                    🚀 Aapda Mitra - Disaster Preparedness Platform
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <a href="/leaderboard" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard</h3>
                      <p className="text-gray-600">View top performers and school rankings</p>
                    </a>
                    <a href="/drills" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl font-semibold mb-4">🎮 VR Drills</h3>
                      <p className="text-gray-600">Practice emergency response in virtual reality</p>
                    </a>
                    <a href="/admin" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl font-semibold mb-4">📊 Admin Dashboard</h3>
                      <p className="text-gray-600">Manage users, view analytics, and schedule drills</p>
                    </a>
                  </div>
                </div>
              } />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/drills" element={<DrillsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-white mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-gray-400">© 2024 Aapda Mitra. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
