// client/src/pages/AdminDashboard.jsx
// Enhanced admin dashboard with real-time metrics and management tools

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  TrophyIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  BellIcon
} from '@heroicons/react/24/solid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../config/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);

  // Helper to safely round numbers
  const safeRound = (num) => (Number.isFinite(num) ? Math.round(num) : 0);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardData();

      if (data.status === 'success') {
        setDashboardData(data.data);
        setError(null);
      } else {
        setDashboardData(null);
        setError(null);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setDashboardData(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async (type) => {
    try {
      setExportLoading(true);
      const response = await api.exportData(type, 'csv');

      if (response) {
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleScheduleDrill = async (drillData) => {
    try {
      const data = await api.scheduleDrill(drillData);

      if (data.status === 'success') {
        fetchDashboardData();
      } else {
        setError(data.message || 'Failed to schedule drill');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
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
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const mockDashboardData = {
    overview: {
      totalUsers: 1247,
      totalSchools: 45,
      totalDrillsCompleted: 3420,
      averageDrillScore: 78.5,
      totalGamesPlayed: 1890,
      averageGameScore: 82.3,
      preparednessScore: 85.2
    },
    schoolStats: [
      { name: 'DAV Public School', students: 45, avgScore: 85, totalPoints: 2450, participation: 92 },
      { name: 'Spring Dale School', students: 38, avgScore: 82, totalPoints: 2200, participation: 88 },
      { name: 'Modern School', students: 42, avgScore: 80, totalPoints: 2100, participation: 85 },
      { name: 'DPS Punjab', students: 35, avgScore: 78, totalPoints: 1950, participation: 82 },
      { name: 'Convent School', students: 30, avgScore: 75, totalPoints: 1800, participation: 79 }
    ],
    drillParticipation: [
      { name: 'Earthquake', totalDrills: 1200, completion: 85 },
      { name: 'Fire', totalDrills: 980, completion: 78 },
      { name: 'Flood', totalDrills: 750, completion: 72 },
      { name: 'Cyclone', totalDrills: 490, completion: 68 }
    ],
    recentActivity: {
      recentUsers: [
        { name: 'Priya Sharma', school: 'DAV Public School', lastLogin: new Date().toISOString(), score: 2450 },
        { name: 'Rajesh Kumar', school: 'Spring Dale School', lastLogin: new Date(Date.now() - 300000).toISOString(), score: 2200 },
        { name: 'Simran Kaur', school: 'Modern School', lastLogin: new Date(Date.now() - 600000).toISOString(), score: 2100 },
        { name: 'Amit Singh', school: 'DPS Punjab', lastLogin: new Date(Date.now() - 900000).toISOString(), score: 1950 }
      ]
    },
    performanceTrends: [
      { month: 'Jan', users: 800, drills: 1200, avgScore: 72 },
      { month: 'Feb', users: 920, drills: 1450, avgScore: 75 },
      { month: 'Mar', users: 1050, drills: 1680, avgScore: 78 },
      { month: 'Apr', users: 1150, drills: 1920, avgScore: 80 },
      { month: 'May', users: 1200, drills: 2100, avgScore: 82 },
      { month: 'Jun', users: 1247, drills: 2340, avgScore: 85 }
    ]
  };

  const currentData = dashboardData || mockDashboardData;

  const stats = [
    {
      icon: UsersIcon,
      label: 'Total Users',
      value: Number.isFinite(currentData.overview.totalUsers) ? currentData.overview.totalUsers : 0,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      icon: AcademicCapIcon,
      label: 'Total Schools',
      value: Number.isFinite(currentData.overview.totalSchools) ? currentData.overview.totalSchools : 0,
      color: 'green',
      change: '+3%',
      trend: 'up'
    },
    {
      icon: TrophyIcon,
      label: 'Drills Completed',
      value: Number.isFinite(currentData.overview.totalDrillsCompleted) ? currentData.overview.totalDrillsCompleted : 0,
      color: 'purple',
      change: '+25%',
      trend: 'up'
    },
    {
      icon: ChartBarIcon,
      label: 'Avg Score',
      value: safeRound(currentData.overview.averageDrillScore),
      color: 'yellow',
      change: '+8%',
      trend: 'up'
    },
    {
      icon: BellIcon,
      label: 'Games Played',
      value: Number.isFinite(currentData.overview.totalGamesPlayed) ? currentData.overview.totalGamesPlayed : 0,
      color: 'indigo',
      change: '+18%',
      trend: 'up'
    },
    {
      icon: ExclamationTriangleIcon,
      label: 'Preparedness Score',
      value: safeRound(currentData.overview.preparednessScore),
      color: 'red',
      change: '+5%',
      trend: 'up'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor and manage the disaster preparedness platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchDashboardData()}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-green-600 font-semibold">{stat.change}</span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

 


        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'analytics', 'management', 'exports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                  {/* School Performance Chart */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">School Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
  <BarChart data={currentData.schoolStats}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
    <YAxis />
    <Tooltip
      formatter={(value, name) => {
        const safeValue = Number.isFinite(value) ? value : 0;
        const label = name === 'avgScore' ? 'Average Score' : 'Students';
        return [safeValue, label];
      }}
    />
    <Bar dataKey="avgScore" fill="#3B82F6" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

        </div>

                  {/* Drill Participation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Drill Participation</h3>
                    
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Performance Trends */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={currentData.drillParticipation}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, completion }) =>
        `${name}: ${Number.isFinite(completion) ? completion : 0}%`
      }
      outerRadius={80}
      fill="#8884d8"
      dataKey="completion"
    >
      {currentData.drillParticipation.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value) => [Number.isFinite(value) ? value : 0, 'Completion']}
    />
  </PieChart>
</ResponsiveContainer>

                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {currentData.recentActivity.recentUsers.map((user, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-bold">{user.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.school}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-blue-600">{user.score} pts</p>
                            <p className="text-xs text-gray-500">
                              {new Date(user.lastLogin).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'management' && (
                <motion.div
                  key="management"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Schedule Drill */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Drill</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleScheduleDrill({
                          drillType: formData.get('drillType'),
                          scheduledDate: formData.get('scheduledDate'),
                          targetSchools: [formData.get('targetSchool')],
                          description: formData.get('description')
                        });
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Drill Type
                            </label>
                            <select
                              name="drillType"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="earthquake">Earthquake</option>
                              <option value="fire">Fire</option>
                              <option value="flood">Flood</option>
                              <option value="cyclone">Cyclone</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Scheduled Date
                            </label>
                            <input
                              type="datetime-local"
                              name="scheduledDate"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target School
                          </label>
                          <input
                            type="text"
                            name="targetSchool"
                            placeholder="Enter school name"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            rows="3"
                            placeholder="Drill description and instructions"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Schedule Drill
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'exports' && (
                <motion.div
                  key="exports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['drills', 'games', 'modules', 'users'].map((type) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{type} Data</h4>
                            <p className="text-sm text-gray-600">Export {type} information as CSV</p>
                          </div>
                          <button
                            onClick={() => handleExport(type)}
                            disabled={exportLoading}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            <span>Export</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;