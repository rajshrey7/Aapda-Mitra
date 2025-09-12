import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🚀 Aapda Mitra - Disaster Preparedness Platform
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🏆 Leaderboard</h3>
            <p className="text-gray-600 mb-4">View top performers and school rankings</p>
            <a href="/leaderboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Leaderboard
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">🎮 3D Simulations</h3>
            <p className="text-gray-600 mb-4">Practice emergency response in 3D simulations</p>
            <a href="/drills" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Start Drills
            </a>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">📊 Admin Dashboard</h3>
            <p className="text-gray-600 mb-4">Manage users, view analytics, and schedule drills</p>
            <a href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Admin Panel
            </a>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Frontend is working! ✅ Backend is running on port 5000 ✅
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
