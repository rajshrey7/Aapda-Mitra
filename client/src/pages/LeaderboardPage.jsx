import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiUsers, FiHome, FiTarget } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../config/api';

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [schoolStats, setSchoolStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('global');

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [globalResponse, schoolResponse] = await Promise.all([
        api.getLeaderboard('global'),
        api.getLeaderboard('schools')
      ]);

      if (globalResponse.status === 'success') {
        setLeaderboardData(globalResponse.data.leaderboard || []);
      }
      if (schoolResponse.status === 'success') {
        setSchoolStats(schoolResponse.data || []);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      // Continue with mock data if API fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Mock data for demonstration if API fails
  const mockLeaderboard = [
    { rank: 1, name: 'Priya Sharma', school: 'DAV Public School', points: 2450, badges: 15, avatar: 'PS' },
    { rank: 2, name: 'Rajesh Kumar', school: 'Spring Dale School', points: 2200, badges: 12, avatar: 'RK' },
    { rank: 3, name: 'Simran Kaur', school: 'Modern School', points: 2100, badges: 11, avatar: 'SK' },
    { rank: 4, name: 'Amit Singh', school: 'DPS Punjab', points: 1950, badges: 10, avatar: 'AS' },
    { rank: 5, name: 'Neha Patel', school: 'Convent School', points: 1800, badges: 9, avatar: 'NP' },
    { rank: 6, name: 'Vikram Singh', school: 'St. Mary School', points: 1750, badges: 8, avatar: 'VS' },
    { rank: 7, name: 'Kavya Reddy', school: 'Kendriya Vidyalaya', points: 1650, badges: 7, avatar: 'KR' },
    { rank: 8, name: 'Arjun Mehta', school: 'Delhi Public School', points: 1550, badges: 6, avatar: 'AM' },
    { rank: 9, name: 'Sneha Gupta', school: 'Ryan International', points: 1450, badges: 5, avatar: 'SG' },
    { rank: 10, name: 'Rohit Sharma', school: 'Army Public School', points: 1350, badges: 4, avatar: 'RS' }
  ];

  const mockSchoolStats = [
    { name: 'DAV Public School', students: 45, avgScore: 85, totalPoints: 2450 },
    { name: 'Spring Dale School', students: 38, avgScore: 82, totalPoints: 2200 },
    { name: 'Modern School', students: 42, avgScore: 80, totalPoints: 2100 },
    { name: 'DPS Punjab', students: 35, avgScore: 78, totalPoints: 1950 },
    { name: 'Convent School', students: 30, avgScore: 75, totalPoints: 1800 }
  ];

  const currentData = leaderboardData.length > 0 ? leaderboardData : mockLeaderboard;
  const currentSchoolStats = schoolStats.length > 0 ? schoolStats : mockSchoolStats;

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400 shadow-lg';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400 shadow-md';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400 shadow-md';
    return 'bg-white border-gray-200 hover:shadow-md transition-shadow';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
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
            🏆 Leaderboard
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Top performers in disaster preparedness training
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {[
              { id: 'global', label: 'Global', icon: FiUsers },
              { id: 'schools', label: 'Schools', icon: FiHome },
              { id: 'analytics', label: 'Analytics', icon: FiTarget }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <motion.div
            key="global"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-center">
                  <FiTrendingUp className="mr-3" size={28} />
                  <span className="text-2xl font-bold">Top 10 Students</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Leaderboard List */}
                  <div className="space-y-4">
                    {currentData.slice(0, 10).map((student, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${getRankStyle(student.rank)}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold w-12 text-center">
                            {getRankIcon(student.rank)}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {student.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{student.name}</h3>
                            <p className="text-gray-600 text-sm">{student.school}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <motion.p 
                              className="text-2xl font-bold text-blue-600"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.5 }}
                            >
                              {student.points.toLocaleString()}
                            </motion.p>
                            <p className="text-xs text-gray-500">Points</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <FiAward className="text-yellow-500 mr-1" />
                              <span className="font-bold text-lg">{student.badges}</span>
                            </div>
                            <p className="text-xs text-gray-500">Badges</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Points Distribution Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Points Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currentData.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value.toLocaleString(), 'Points']}
                          labelFormatter={(label) => `Student: ${label}`}
                        />
                        <Bar dataKey="points" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* School Leaderboard */}
        {activeTab === 'schools' && (
          <motion.div
            key="schools"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                <div className="flex items-center justify-center">
                  <FiHome className="mr-3" size={28} />
                  <span className="text-2xl font-bold">School Performance</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* School Stats */}
                  <div className="space-y-4">
                    {currentSchoolStats.map((school, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{school.name}</h3>
                            <p className="text-gray-600">{school.students} students</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{school.avgScore}%</p>
                            <p className="text-sm text-gray-500">Avg Score</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${school.avgScore}%` }}
                              transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* School Performance Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">School Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currentSchoolStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avgScore" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Badge Distribution */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Badge Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Gold', value: 45, color: '#F59E0B' },
                        { name: 'Silver', value: 30, color: '#6B7280' },
                        { name: 'Bronze', value: 25, color: '#CD7F32' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Gold', value: 45, color: '#F59E0B' },
                        { name: 'Silver', value: 30, color: '#6B7280' },
                        { name: 'Bronze', value: 25, color: '#CD7F32' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Trends */}
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { month: 'Jan', points: 1200 },
                    { month: 'Feb', points: 1500 },
                    { month: 'Mar', points: 1800 },
                    { month: 'Apr', points: 2100 },
                    { month: 'May', points: 2400 },
                    { month: 'Jun', points: 2700 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="points" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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

export default LeaderboardPage;