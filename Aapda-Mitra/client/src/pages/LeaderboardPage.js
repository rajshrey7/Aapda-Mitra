import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

const LeaderboardPage = () => {
  const leaderboard = [
    { rank: 1, name: 'Priya Sharma', school: 'DAV Public School', points: 2450, badges: 15 },
    { rank: 2, name: 'Rajesh Kumar', school: 'Spring Dale School', points: 2200, badges: 12 },
    { rank: 3, name: 'Simran Kaur', school: 'Modern School', points: 2100, badges: 11 },
    { rank: 4, name: 'Amit Singh', school: 'DPS Punjab', points: 1950, badges: 10 },
    { rank: 5, name: 'Neha Patel', school: 'Convent School', points: 1800, badges: 9 }
  ];

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-yellow-100 border-yellow-400';
    if (rank === 2) return 'bg-gray-100 border-gray-400';
    if (rank === 3) return 'bg-orange-100 border-orange-400';
    return 'bg-white border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
        <p className="text-gray-600">Top performers in disaster preparedness</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="flex items-center justify-center">
              <FiTrendingUp className="mr-2" size={24} />
              <span className="text-xl font-semibold">Top Students</span>
            </div>
          </div>

          <div className="p-6">
            {leaderboard.map((student, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 mb-3 rounded-lg border-2 ${getRankStyle(student.rank)}`}
              >
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-4 w-12 text-center">
                    {student.rank === 1 && '🥇'}
                    {student.rank === 2 && '🥈'}
                    {student.rank === 3 && '🥉'}
                    {student.rank > 3 && `#${student.rank}`}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p className="text-gray-600 text-sm">{student.school}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{student.points}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center">
                      <FiAward className="text-yellow-500 mr-1" />
                      <span className="font-semibold">{student.badges}</span>
                    </div>
                    <p className="text-xs text-gray-500">Badges</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardPage;