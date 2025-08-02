// Component for managing offline data synchronization
import React, { useState, useEffect } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { offlineService } from '@/services/offlineService';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineDataSyncProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineDataSync({
  className = '',
  showDetails: _showDetails = true,
}: OfflineDataSyncProps) {
  const { isOnline, syncStatus, isSyncing, triggerSync } = useOffline();
  const [syncHistory, setSyncHistory] = useState<
    Array<{
      timestamp: number;
      type: string;
      status: 'success' | 'error';
      message: string;
    }>
  >([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Listen for sync events
    const handleSyncComplete = () => {
      setSyncHistory(prev =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            type: 'auto',
            status: 'success',
            message: 'Automatic sync completed successfully',
          },
        ].slice(-10)
      ); // Keep only last 10 entries
    };

    const handleSyncError = (event: CustomEvent) => {
      setSyncHistory(prev =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            type: 'auto',
            status: 'error',
            message: event.detail?.message || 'Sync failed',
          },
        ].slice(-10)
      );
    };

    window.addEventListener('offlineSyncComplete', handleSyncComplete);
    window.addEventListener(
      'offlineSyncError',
      handleSyncError as EventListener
    );

    return () => {
      window.removeEventListener('offlineSyncComplete', handleSyncComplete);
      window.removeEventListener(
        'offlineSyncError',
        handleSyncError as EventListener
      );
    };
  }, []);

  const handleManualSync = async () => {
    try {
      await triggerSync();
      setSyncHistory(prev =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            type: 'manual',
            status: 'success',
            message: 'Manual sync completed successfully',
          },
        ].slice(-10)
      );
    } catch (error) {
      setSyncHistory(prev =>
        [
          ...prev,
          {
            timestamp: Date.now(),
            type: 'manual',
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Manual sync failed',
          },
        ].slice(-10)
      );
    }
  };

  const clearOfflineData = async () => {
    if (
      confirm(
        'Are you sure you want to clear all offline data? This cannot be undone.'
      )
    ) {
      try {
        await offlineService.clearOfflineData();
        setSyncHistory(prev =>
          [
            ...prev,
            {
              timestamp: Date.now(),
              type: 'manual',
              status: 'success',
              message: 'Offline data cleared successfully',
            },
          ].slice(-10)
        );
      } catch (_error) {
        setSyncHistory(prev =>
          [
            ...prev,
            {
              timestamp: Date.now(),
              type: 'manual',
              status: 'error',
              message: 'Failed to clear offline data',
            },
          ].slice(-10)
        );
      }
    }
  };

  const totalPendingItems =
    syncStatus.pendingActions +
    syncStatus.unsyncedSessions +
    syncStatus.unsyncedNotes;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Offline Data Sync
          </h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Sync Status */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Pending Actions
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {syncStatus.pendingActions}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Unsynced Sessions
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {syncStatus.unsyncedSessions}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Unsynced Notes
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {syncStatus.unsyncedNotes}
            </span>
          </div>

          {totalPendingItems > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  {totalPendingItems} item{totalPendingItems !== 1 ? 's' : ''}{' '}
                  waiting to sync
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <button
            onClick={handleManualSync}
            disabled={!isOnline || isSyncing}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <>
                <motion.svg
                  className="w-4 h-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </motion.svg>
                Syncing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Sync Now
              </>
            )}
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>

          <button
            onClick={clearOfflineData}
            className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors"
          >
            Clear Data
          </button>
        </div>

        {/* Sync History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 dark:border-gray-700 pt-4"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Recent Sync Activity
              </h4>

              {syncHistory.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No sync activity yet
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {syncHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            entry.status === 'success'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 dark:text-white">
                            {entry.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()} •{' '}
                            {entry.type}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last Sync Info */}
        {syncStatus.lastSync > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact sync status for dashboard
export function SyncStatusCompact({ className = '' }: { className?: string }) {
  const { isOnline, syncStatus, isSyncing, triggerSync } = useOffline();

  const totalPendingItems =
    syncStatus.pendingActions +
    syncStatus.unsyncedSessions +
    syncStatus.unsyncedNotes;

  if (totalPendingItems === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            {isSyncing
              ? 'Syncing data...'
              : `${totalPendingItems} items to sync`}
          </span>
        </div>

        {isOnline && !isSyncing && (
          <button
            onClick={triggerSync}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
          >
            Sync Now
          </button>
        )}
      </div>
    </div>
  );
}
