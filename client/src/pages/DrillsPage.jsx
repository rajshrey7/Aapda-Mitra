import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiDroplet, FiZap } from 'react-icons/fi';

const DrillsPage = () => {
  const drills = [
    {
      id: 1,
      title: 'Earthquake Response Drill',
      icon: FiZap,
      color: 'orange',
      description: 'Practice Drop, Cover, and Hold On technique',
      duration: '5 minutes',
      difficulty: 'Basic'
    },
    {
      id: 2,
      title: 'Fire Evacuation Drill',
      icon: FiAlertTriangle,
      color: 'red',
      description: 'Learn safe evacuation procedures during fire',
      duration: '7 minutes',
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      title: 'Flood Response Drill',
      icon: FiDroplet,
      color: 'blue',
      description: 'Understand flood safety and response measures',
      duration: '6 minutes',
      difficulty: 'Basic'
    }
  ];

  const startDrill = (drillId) => {
    // This would start the actual drill simulation
    console.log(`Starting drill ${drillId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Virtual Emergency Drills</h1>
        <p className="text-gray-600">Practice emergency response through interactive simulations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drills.map((drill, index) => (
          <motion.div
            key={drill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className={`bg-${drill.color}-500 p-6 text-white`}>
              <drill.icon size={48} className="mx-auto" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{drill.title}</h3>
              <p className="text-gray-600 mb-4">{drill.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Duration: {drill.duration}</span>
                <span className={`px-2 py-1 rounded text-xs bg-${drill.color}-100 text-${drill.color}-800`}>
                  {drill.difficulty}
                </span>
              </div>
              
              <button
                onClick={() => startDrill(drill.id)}
                className={`w-full py-2 bg-${drill.color}-500 text-white rounded-lg hover:bg-${drill.color}-600 transition-colors`}
              >
                Start Drill
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Why Practice Drills?</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✓ Build muscle memory for emergency situations</li>
          <li>✓ Reduce panic during actual disasters</li>
          <li>✓ Learn proper safety procedures</li>
          <li>✓ Improve response time in emergencies</li>
          <li>✓ Gain confidence in handling crisis situations</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default DrillsPage;