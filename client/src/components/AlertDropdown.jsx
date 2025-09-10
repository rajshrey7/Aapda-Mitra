import React, { useEffect, useMemo, useState } from 'react';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import gameSocketService from '../utils/gameSocket';
import api from '../config/api';

const AlertDropdown = () => {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unread, setUnread] = useState(0);

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

    // Optionally load any recent active alerts
    (async () => {
      try {
        const res = await api.getCurrentAlerts?.();
        if (res?.status === 'success' && Array.isArray(res.data)) {
          setAlerts(res.data);
        }
      } catch (error) {
        console.log('No alerts endpoint available:', error.message);
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
                <div key={alert.id} className="px-4 py-3 border-b last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{alert.title || 'Alert'}</div>
                      <div className="text-sm text-gray-600">{alert.description || alert.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {alert.location} • {alert.severity?.toUpperCase?.()}
                      </div>
                    </div>
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="p-1 text-gray-500 hover:text-gray-800"
                      title="Dismiss"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDropdown;


