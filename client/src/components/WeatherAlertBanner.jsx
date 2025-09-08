import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCloudRain, FiWind, FiZap, FiDroplet, FiSun } from 'react-icons/fi';
import api from '../config/api';
import gameSocketService from '../utils/gameSocket';

const WeatherAlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial alerts
  const fetchAlerts = async () => {
    try {
      const data = await api.getCurrentAlerts();
      
      if (data.status === 'success' && data.data && data.data.length > 0) {
        setAlerts(data.data);
        setCurrentAlert(data.data[0]);
        setIsVisible(true);
      } else {
        // Use mock data for demonstration
        const mockAlerts = [
          {
            id: 1,
            title: 'Heavy Rain Alert',
            description: 'Heavy rainfall expected in your area',
            type: 'rain',
            severity: 'moderate',
            location: 'Delhi, India',
            validUntil: new Date(Date.now() + 3600000).toISOString(),
            instructions: 'Avoid low-lying areas and stay indoors if possible.',
            details: {
              severity: 'moderate',
              location: 'Delhi, India',
              validUntil: new Date(Date.now() + 3600000).toISOString(),
              instructions: 'Avoid low-lying areas and stay indoors if possible.'
            }
          }
        ];
        setAlerts(mockAlerts);
        setCurrentAlert(mockAlerts[0]);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      // Use mock data as fallback
      const mockAlerts = [
        {
          id: 1,
          title: 'Heavy Rain Alert',
          description: 'Heavy rainfall expected in your area',
          type: 'rain',
          severity: 'moderate',
          location: 'Delhi, India',
          validUntil: new Date(Date.now() + 3600000).toISOString(),
          instructions: 'Avoid low-lying areas and stay indoors if possible.',
          details: {
            severity: 'moderate',
            location: 'Delhi, India',
            validUntil: new Date(Date.now() + 3600000).toISOString(),
            instructions: 'Avoid low-lying areas and stay indoors if possible.'
          }
        }
      ];
      setAlerts(mockAlerts);
      setCurrentAlert(mockAlerts[0]);
      setIsVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time alerts via Socket.IO
  useEffect(() => {
    const handleNewAlert = (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setCurrentAlert(alert);
      setIsVisible(true);
    };

    // Connect to socket service
    gameSocketService.connect();
    
    // Listen for new alerts
    gameSocketService.on('alert:new', handleNewAlert);

    // Fetch initial alerts
    fetchAlerts();

    return () => {
      gameSocketService.off('alert:new', handleNewAlert);
    };
  }, []);

  const getAlertIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'rain':
      case 'storm':
        return <FiCloudRain className="w-6 h-6" />;
      case 'wind':
        return <FiWind className="w-6 h-6" />;
      case 'thunderstorm':
        return <FiZap className="w-6 h-6" />;
      case 'flood':
        return <FiDroplet className="w-6 h-6" />;
      default:
        return <FiAlertTriangle className="w-6 h-6" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'from-red-600 to-red-800';
      case 'severe':
        return 'from-orange-600 to-red-600';
      case 'moderate':
        return 'from-yellow-600 to-orange-600';
      case 'minor':
        return 'from-blue-600 to-blue-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const dismissAlert = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentAlert(null);
    }, 300);
  };

  const nextAlert = () => {
    const currentIndex = alerts.findIndex(alert => alert.id === currentAlert?.id);
    const nextIndex = (currentIndex + 1) % alerts.length;
    setCurrentAlert(alerts[nextIndex]);
  };

  // Deprecated in favor of AlertDropdown in Navbar
  return null;

  // Old banner UI removed
};

export default WeatherAlertBanner;
