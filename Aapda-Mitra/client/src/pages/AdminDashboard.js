import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiActivity, FiBookOpen, FiAward } from 'react-icons/fi';

const AdminDashboard = () => {
  const stats = [
    { icon: FiUsers, label: 'Total Users', value: '1,234', color: 'blue' },
    { icon: FiActivity, label: 'Active Today', value: '456', color: 'green' },
    { icon: FiBookOpen, label: 'Quizzes Created', value: '78', color: 'purple' },
    { icon: FiAward, label: 'Badges Awarded', value: '2,345', color: 'yellow' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <stat.icon className={`text-${stat.color}-500 mb-3`} size={32} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">School Preparedness</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>Overall Preparedness</span>
                <span>85%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity tracking will be displayed here</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;