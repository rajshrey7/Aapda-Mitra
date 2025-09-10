// client/src/components/LiveAlerts.jsx
// Live alerts component with AI summarization

import React, { useState, useEffect } from 'react';
import { api as apiClient } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  MapPinIcon, 
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

const LiveAlerts = ({ 
  lat = 31.1471, 
  lon = 75.3412, 
  radius = 50,
  location = '',
  autoRefresh = true,
  refreshInterval = 60000 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summarizing, setSummarizing] = useState(new Set());
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch nearby alerts; fallback to WeatherAPI-backed endpoint when empty
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/alerts/nearby?lat=${lat}&lon=${lon}&radius=${radius}`
      );
      const data = await response.json();

      if (data.status === 'success') {
        let nextAlerts = data.data.alerts || [];

        // Fallback: if no alerts and a location is provided, try weather endpoint
        if ((!nextAlerts || nextAlerts.length === 0) && location) {
          try {
            const weather = await apiClient.checkWeatherAlert(location);
            if (weather?.status === 'success' && weather?.data?.alerts?.length) {
              // Normalize WeatherAPI alerts into our UI shape
              nextAlerts = weather.data.alerts.map((a, idx) => ({
                id: `${Date.now()}-${idx}`,
                type: (a.event || 'weather').toLowerCase(),
                severity: (a.severity || 'moderate').toLowerCase(),
                title: a.headline || a.event || 'Weather Alert',
                description: a.desc || a.description || 'Weather alert in your area',
                location: location,
                createdAt: a.effective || new Date().toISOString(),
                source: 'WeatherAPI'
              }));
            }
          } catch (e) {
            // ignore fallback errors; keep previous error handling
          }
        }

        setAlerts(nextAlerts);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get AI summary for alert
  const getAISummary = async (alertId) => {
    try {
      setSummarizing(prev => new Set([...prev, alertId]));
      
      const response = await fetch(`/api/alerts/summarize/${alertId}`);
      const data = await response.json();

      if (data.status === 'success') {
        // Update alert with summary
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, aiSummary: data.data.summary, aiAvailable: true }
            : alert
        ));
      } else {
        // Mark as AI unavailable
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, aiAvailable: false }
            : alert
        ));
      }
    } catch (err) {
      console.error('AI summarization error:', err);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, aiAvailable: false }
          : alert
      ));
    } finally {
      setSummarizing(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  // Initial load
  useEffect(() => {
    fetchAlerts();
  }, [lat, lon, radius]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'moderate':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'moderate':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'earthquake':
        return '🌍';
      case 'flood':
        return '🌊';
      case 'fire':
        return '🔥';
      case 'cyclone':
        return '🌀';
      case 'tsunami':
        return '🌊';
      case 'landslide':
        return '⛰️';
      default:
        return '⚠️';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold text-gray-800">Live Alerts</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              {formatTimeAgo(lastUpdated)}
            </span>
          )}
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
        <MapPinIcon className="w-4 h-4" />
        <span>Monitoring {radius}km radius from your location</span>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchAlerts}
            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{alert.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{formatTimeAgo(alert.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {alert.source}
                  </div>
                </div>
              </div>

              {/* Alert Description */}
              <p className="text-gray-700 text-sm mb-3">{alert.description}</p>

              {/* Location */}
              {alert.location && (
                <div className="flex items-center space-x-1 text-xs text-gray-600 mb-3">
                  <MapPinIcon className="w-3 h-3" />
                  <span>{alert.location}</span>
                </div>
              )}

              {/* AI Summary */}
              <div className="mt-3">
                {alert.aiSummary ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <SparklesIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800">AI Summary</span>
                    </div>
                    <p className="text-sm text-blue-700">{alert.aiSummary}</p>
                  </div>
                ) : summarizing.has(alert.id) ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-600">Generating AI summary...</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => getAISummary(alert.id)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>Get AI Summary</span>
                  </button>
                )}
              </div>

              {/* Instructions */}
              {alert.instructions && alert.instructions.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {alert.instructions.map((instruction, idx) => (
                      <li key={idx} className="text-sm text-gray-700">{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && alerts.length === 0 && (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active alerts</p>
            <p className="text-sm text-gray-400">You're safe! Check back for updates.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && alerts.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Checking for updates...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Auto-refresh {autoRefresh ? 'enabled' : 'disabled'}</span>
          <span>Last checked: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveAlerts;
