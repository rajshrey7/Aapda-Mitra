import React, { useEffect, useMemo, useState } from 'react';
import { FiBell, FiX, FiCheck, FiMapPin } from 'react-icons/fi';
import gameSocketService from '../utils/gameSocket';
import api from '../config/api';
import SimpleAlertMap from './SimpleAlertMap';

const AlertDropdown = () => {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [alerts]);

  useEffect(() => {
    const handleNew = (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setUnread((c) => c + 1);
    };
    const handleUpdate = (alert) => {
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, ...alert } : a)));
    };
    const handleCancel = ({ alertId }) => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    };

    // Ensure socket connection exists (token handled globally in App)
    try {
      gameSocketService.on('alert:new', handleNew);
      gameSocketService.on('alert:update', handleUpdate);
      gameSocketService.on('alert:cancel', handleCancel);
    } catch (e) {
      // no-op if socket not ready
    }

    // Load active alerts from API
    (async () => {
      try {
        // Try to get alerts from the /active endpoint
        const response = await fetch('/api/alerts/active');
        const data = await response.json();
        
        if (data?.status === 'success' && Array.isArray(data.data)) {
          console.log('Loaded alerts from API:', data.data);
          setAlerts(data.data);
        } else {
          // Fallback to test alerts with coordinates
          const testAlerts = [
            {
              id: 'test-1',
              title: 'Earthquake Alert - Punjab Region',
              description: 'Moderate earthquake detected in Punjab region',
              type: 'earthquake',
              severity: 'moderate',
              location: 'Punjab, India',
              coordinates: { lat: 31.1471, lng: 75.3412 },
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              isActive: true
            },
            {
              id: 'test-2',
              title: 'Flood Warning - River Areas',
              description: 'Heavy rainfall causing flood risk in river areas',
              type: 'flood',
              severity: 'high',
              location: 'River areas, Punjab',
              coordinates: { lat: 30.7333, lng: 76.7794 },
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              isActive: true
            }
          ];
          console.log('Using test alerts:', testAlerts);
          setAlerts(testAlerts);
        }
      } catch (error) {
        console.log('Failed to load alerts from API:', error.message);
        // Fallback to test alerts
        const testAlerts = [
          {
            id: 'test-1',
            title: 'Earthquake Alert - Punjab Region',
            description: 'Moderate earthquake detected in Punjab region',
            type: 'earthquake',
            severity: 'moderate',
            location: 'Punjab, India',
            coordinates: { lat: 31.1471, lng: 75.3412 },
            createdAt: new Date().toISOString(),
            isActive: true
          }
        ];
        console.log('Using fallback test alerts:', testAlerts);
        setAlerts(testAlerts);
      }
    })();

    return () => {
      try {
        gameSocketService.off('alert:new', handleNew);
        gameSocketService.off('alert:update', handleUpdate);
        gameSocketService.off('alert:cancel', handleCancel);
      } catch (e) {}
    };
  }, []);

  const markAllRead = () => setUnread(0);

  const dismiss = async (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const showAlertOnMap = (alert) => {
    setSelectedAlert(alert);
    setShowMap(true);
    setOpen(false); // Close dropdown when showing map
  };

  const closeMap = () => {
    setShowMap(false);
    setSelectedAlert(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100"
        title="Alerts"
      >
        <FiBell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1 min-w-[18px] text-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="font-semibold">Alerts</div>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <FiCheck /> Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {sortedAlerts.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No alerts</div>
            ) : (
              sortedAlerts.map((alert) => (
                <div key={alert.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{alert.title || 'Alert'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description || alert.message}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {alert.location} • {alert.severity?.toUpperCase?.()}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => showAlertOnMap(alert)}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Show on Map"
                        >
                          <FiMapPin className="w-3 h-3" />
                          <span>View on Map</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => dismiss(alert.id)}
                        className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
                        title="Dismiss"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Alert Map Modal */}
      <SimpleAlertMap
        alert={selectedAlert}
        isOpen={showMap}
        onClose={closeMap}
      />
    </div>
  );
};

export default AlertDropdown;


