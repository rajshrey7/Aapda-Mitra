import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiAward, FiTarget, FiTrendingUp } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FiUser size={40} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-2">{user?.school}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <FiAward className="text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{user?.badges?.length || 0}</p>
              <p className="text-gray-600">Badges Earned</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <FiTarget className="text-green-500 mb-2" size={24} />
              <p className="text-2xl font-bold">{user?.points || 0}</p>
              <p className="text-gray-600">Total Points</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <FiTrendingUp className="text-purple-500 mb-2" size={24} />
              <p className="text-2xl font-bold">Level {user?.level || 1}</p>
              <p className="text-gray-600">Current Level</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-2xl font-bold">{user?.quizzesTaken?.length || 0}</p>
              <p className="text-gray-600">Quizzes Completed</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Badges</h3>
            {user?.badges?.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {user.badges.slice(0, 6).map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <p className="text-sm">{badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No badges earned yet. Start taking quizzes!</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;