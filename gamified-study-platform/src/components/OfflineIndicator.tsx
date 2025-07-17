// Offline status indicator component
import React from 'react';
import { useOffline } from '@/hooks/useOffline';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className = '', showDetails = false }: OfflineIndicatorProps) {
  const { isOnline, isOffline, syncStatus, isSyncing, triggerSync } = useOffline();

  const hasPendingData = syncStatus.pendingActions > 0 || 
                        syncStatus.unsyncedSessions > 0 || 
                        syncStatus.unsyncedNotes > 0;

  if (isOnline && !hasPendingData && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 ${className}`}
      >
        <div className={`
          px-4 py-2 rounded-lg shadow-lg border backdrop-blur-sm
          ${isOffline 
            ? 'bg-red-500/90 border-red-400 text-white' 
            : hasPendingData || isSyncing
              ? 'bg-yellow-500/90 border-yellow-400 text-white'
              : 'bg-green-500/90 border-green-400 text-white'
          }
        `}>
          <div className="flex items-center gap-2">
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {isOffline ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : isSyncing ? (
                <motion.svg 
                  className="w-4 h-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </motion.svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {isOffline ? 'Offline' : isSyncing ? 'Syncing...' : 'Sync Pending'}
              </div>
              
              {showDetails && (
                <div className="text-xs opacity-90 mt-1">
                  {isOffline ? (
                    'Working offline - data will sync when connected'
                  ) : isSyncing ? (
                    'Syncing your offline data...'
                  ) : hasPendingData ? (
                    `${syncStatus.pendingActions + syncStatus.unsyncedSessions + syncStatus.unsyncedNotes} items to sync`
                  ) : (
                    'All data synced'
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            {isOnline && hasPendingData && !isSyncing && (
              <button
                onClick={triggerSync}
                className="flex-shrink-0 text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                disabled={isSyncing}
              >
                Sync Now
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact version for mobile
export function OfflineIndicatorCompact({ className = '' }: { className?: string }) {
  const { isOnline, isOffline, syncStatus, isSyncing } = useOffline();

  const hasPendingData = syncStatus.pendingActions > 0 || 
                        syncStatus.unsyncedSessions > 0 || 
                        syncStatus.unsyncedNotes > 0;

  if (isOnline && !hasPendingData && !isSyncing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={`
          w-3 h-3 rounded-full flex-shrink-0
          ${isOffline 
            ? 'bg-red-500' 
            : hasPendingData || isSyncing
              ? 'bg-yellow-500'
              : 'bg-green-500'
          }
          ${className}
        `}
        title={
          isOffline ? 'Offline' : 
          isSyncing ? 'Syncing...' : 
          hasPendingData ? 'Sync pending' : 
          'Online'
        }
      >
        {isSyncing && (
          <motion.div
            className="w-full h-full rounded-full border-2 border-white border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}