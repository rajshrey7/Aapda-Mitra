import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const severityClasses = {
  critical: 'from-red-600 to-red-800 border-red-400',
  high: 'from-orange-600 to-red-600 border-orange-400',
  moderate: 'from-yellow-500 to-orange-600 border-yellow-400',
  info: 'from-blue-600 to-blue-800 border-blue-400',
  safe: 'from-green-600 to-green-800 border-green-400'
};

const severityEmoji = {
  critical: '🚨',
  high: '🚨',
  moderate: '⚠️',
  info: 'ℹ️',
  safe: '✅'
};

const CriticalAlertBanner = ({ alert, onDismiss, enableSound = false, enableVibration = false }) => {
  useEffect(() => {
    if (!alert) return;
    if (enableSound) {
      try {
        const audio = new Audio('/assets/alert-tone.mp3');
        audio.volume = 0.6;
        audio.play().catch(() => {});
      } catch (_) {}
    }
    if (enableVibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [alert, enableSound, enableVibration]);

  if (!alert) return null;

  const sev = (alert.severity || 'critical').toLowerCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={`sticky top-0 z-[60] w-full shadow-2xl`}
      >
        <div
          className={`bg-gradient-to-r ${severityClasses[sev] || severityClasses.critical} text-white`}
          style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.08) inset' }}
        >
          <div className={`border-b px-4 py-3 ${severityClasses[sev]?.split(' ').pop()} animate-[pulse_1.6s_ease-out_infinite]`}
            style={{ borderBottomWidth: 2 }}
          >
            <div className="container mx-auto flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl animate-pulse">{severityEmoji[sev] || '🚨'}</div>
                <div>
                  <div className="font-bold text-base">
                    {alert.title || 'Critical Alert'}
                  </div>
                  <div className="text-sm opacity-95">
                    {alert.description || 'Please take immediate action.'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {alert.location && (
                  <span className="text-xs bg-white/15 rounded px-2 py-1">{alert.location}</span>
                )}
                <button
                  onClick={onDismiss}
                  className="text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded px-3 py-1 text-xs transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CriticalAlertBanner;


