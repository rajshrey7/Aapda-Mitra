import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiNavigation, FiShield, FiInfo, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FallbackMap = ({ alert, userLocation, escapeRoute, expandedSections, toggleSection, showDirections, clearDirections }) => {
  const getEmergencyTips = (alertType) => {
    const tips = {
      earthquake: [
        'Drop, cover, and hold on',
        'Stay away from windows and heavy objects',
        'If outdoors, move to open area away from buildings',
        'If in vehicle, stop and stay inside',
        'Be prepared for aftershocks'
      ],
      flood: [
        'Move to higher ground immediately',
        'Avoid walking or driving through floodwaters',
        'Stay away from downed power lines',
        'Listen to emergency broadcasts',
        'Evacuate if instructed by authorities'
      ],
      fire: [
        'Evacuate immediately if ordered',
        'Close all doors and windows',
        'Turn off gas and electricity',
        'Wear protective clothing',
        'Follow evacuation routes'
      ],
      cyclone: [
        'Stay indoors and away from windows',
        'Secure outdoor objects',
        'Listen to weather updates',
        'Have emergency supplies ready',
        'Evacuate if in low-lying areas'
      ],
      tsunami: [
        'Move to higher ground immediately',
        'Stay away from beaches and coastal areas',
        'Listen to tsunami warnings',
        'Do not return until authorities say it\'s safe',
        'Follow evacuation routes'
      ]
    };
    return tips[alertType] || [
      'Follow emergency instructions',
      'Stay calm and alert',
      'Listen to authorities',
      'Have emergency supplies ready',
      'Evacuate if necessary'
    ];
  };

  return (
    <div className="p-6">
      {/* Location Information */}
      <div className="mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <FiMapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800 dark:text-blue-300">Alert Location</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">{alert?.location || 'Unknown Location'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Latitude:</span>
              <span className="ml-2 font-mono">{alert?.coordinates?.lat || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Longitude:</span>
              <span className="ml-2 font-mono">{alert?.coordinates?.lng || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Map Representation */}
      <div className="mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FiMapPin className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Alert Location: {alert?.location || 'Unknown'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
              Interactive map unavailable due to browser restrictions
            </p>
          </div>
          
          {/* Decorative map elements */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-8 left-8 w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Escape Route Section */}
      {escapeRoute && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
            <div 
              className="flex items-center justify-between mb-3 cursor-pointer"
              onClick={() => toggleSection('route')}
            >
              <h3 className="font-bold text-green-800 dark:text-green-300 flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-200 dark:bg-green-800/50 rounded-lg flex items-center justify-center">
                  <FiNavigation className="w-4 h-4" />
                </div>
                <span>Escape Route</span>
              </h3>
              {expandedSections.route ? (
                <FiChevronDown className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <FiChevronRight className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            
            {expandedSections.route && (
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Distance:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.distance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{escapeRoute.duration}</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Interactive route display is unavailable. Please use a navigation app for turn-by-turn directions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer"
          onClick={() => toggleSection('tips')}
        >
          <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
              <FiShield className="w-4 h-4" />
            </div>
            <span>Emergency Tips</span>
          </h3>
          {expandedSections.tips ? (
            <FiChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <FiChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        
        {expandedSections.tips && (
          <div className="space-y-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <ul className="space-y-2">
                {getEmergencyTips(alert?.type).map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <FiInfo className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackMap;
