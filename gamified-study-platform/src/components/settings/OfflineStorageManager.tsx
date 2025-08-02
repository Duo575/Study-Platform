/**
 * Offline Storage Manager component for managing IndexedDB data and sync status
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  useSyncStatus,
  useOfflineDataManagement,
  useOfflineDataCleanup,
} from '../../hooks/useOfflineStorage';
import { syncService } from '../../services/syncService';

export const OfflineStorageManager: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [syncStats, setSyncStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { syncStatus, forceSync } = useSyncStatus();
  const {
    stats,
    loadStats,
    exportData,
    importData,
    clearAllData,
    cleanupOldData,
  } = useOfflineDataManagement();

  // Enable automatic cleanup
  useOfflineDataCleanup(30);

  useEffect(() => {
    loadStats();
    loadSyncStats();
  }, [loadStats]);

  const loadSyncStats = async () => {
    try {
      const stats = await syncService.getSyncStatistics();
      setSyncStats(stats);
    } catch (error) {
      console.error('Failed to load sync stats:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      setMessage({ type: 'info', text: 'Starting synchronization...' });
      const result = await forceSync();

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Sync completed! ${result.syncedItems} items synced.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Sync failed: ${result.errors.join(', ')}`,
        });
      }

      await loadStats();
      await loadSyncStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Sync operation failed. Please try again.',
      });
    }
  };

  const handleExportData = async () => {
    try {
      await exportData();
      setMessage({
        type: 'success',
        text: 'Offline data exported successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export data. Please try again.',
      });
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const success = await importData(file);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Data imported successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to import data. Please check the file format.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Import operation failed. Please try again.',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all offline data? This action cannot be undone.'
      )
    ) {
      try {
        await clearAllData();
        setMessage({
          type: 'success',
          text: 'All offline data cleared successfully!',
        });
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to clear data. Please try again.',
        });
      }
    }
  };

  const handleCleanupOldData = async () => {
    try {
      await cleanupOldData(30);
      setMessage({
        type: 'success',
        text: 'Old data cleaned up successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to cleanup old data. Please try again.',
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null): string => {
    return date ? date.toLocaleString() : 'Never';
  };

  const getStatusColor = (isOnline: boolean, isSyncing: boolean) => {
    if (isSyncing) return 'text-blue-600 dark:text-blue-400';
    if (isOnline) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusText = (isOnline: boolean, isSyncing: boolean) => {
    if (isSyncing) return 'Syncing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  return (
    <div className="space-y-4">
      {/* Sync Status Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                syncStatus.isSyncing
                  ? 'bg-blue-500 animate-pulse'
                  : syncStatus.isOnline
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Offline Storage
              </h3>
              <p
                className={`text-sm ${getStatusColor(syncStatus.isOnline, syncStatus.isSyncing)}`}
              >
                {getStatusText(syncStatus.isOnline, syncStatus.isSyncing)}
                {syncStatus.lastSyncTime && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    • Last sync: {formatDate(syncStatus.lastSyncTime)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {syncStatus.pendingItems > 0 && (
              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                {syncStatus.pendingItems} pending
              </span>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : message.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Storage Statistics */}
          {stats && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Storage Statistics
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pets
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.pets}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Feeding Records
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.feedingRecords}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Evolution Records
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.evolutionRecords}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Game Sessions
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.gameSessions}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Sync
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.pendingSyncItems}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Information */}
          {syncStats && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Sync Information
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Pending Items:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {syncStats.totalPendingItems}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Oldest Pending:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(syncStats.oldestPendingItem)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Average Retries:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {syncStats.averageRetryCount.toFixed(1)}
                  </span>
                </div>

                {Object.keys(syncStats.itemsByType).length > 0 && (
                  <div className="mt-3">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">
                      Items by Type:
                    </div>
                    {Object.entries(syncStats.itemsByType).map(
                      ([type, count]) => (
                        <div key={type} className="flex justify-between ml-4">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">
                            {type}:
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {String(count)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              Actions
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleForceSync}
                disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {syncStatus.isSyncing ? 'Syncing...' : 'Force Sync'}
              </button>

              <button
                onClick={handleExportData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Data
              </button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Import Data
                </button>
              </div>

              <button
                onClick={handleCleanupOldData}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Cleanup Old Data
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear All Offline Data
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will permanently delete all offline data. Use with caution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
