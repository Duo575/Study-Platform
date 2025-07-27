/**
 * Data Management component for backup, restore, and storage management
 */

import React, { useState, useRef } from 'react';
import { useBackupRestore } from '../../hooks/usePersistence';

interface StorageStats {
  totalKeys: number;
  totalSize: number;
  keyStats: Array<{ key: string; size: number; lastModified: number }>;
}

export const DataManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createBackup, restoreFromFile, clearAllData, getStorageStats } =
    useBackupRestore();

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      await createBackup();

      setMessage({
        type: 'success',
        text: 'Backup created and downloaded successfully!',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to create backup. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setMessage(null);

      const success = await restoreFromFile(file);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Backup restored successfully! The page will reload to apply changes.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to restore backup. Please check the file format.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to restore backup. Please try again.',
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAllData = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const success = clearAllData();

      if (success) {
        setMessage({
          type: 'success',
          text: 'All data cleared successfully! The page will reload.',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to clear data. Please try again.',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to clear data. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmClear(false);
    }
  };

  const handleLoadStorageStats = () => {
    try {
      const stats = getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load storage statistics.',
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

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Manage your study platform data, including backup, restore, and
          storage settings.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Backup Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Backup & Restore
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create backups of your settings and preferences, or restore from a
          previous backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Backup'}
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFromFile}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
            >
              {isLoading ? 'Restoring...' : 'Restore from File'}
            </button>
          </div>
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Storage Statistics
          </h4>
          <button
            onClick={handleLoadStorageStats}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {storageStats ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Keys
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {storageStats.totalKeys}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Size
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(storageStats.totalSize)}
                </div>
              </div>
            </div>

            {storageStats.keyStats.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Storage Breakdown
                </h5>
                <div className="space-y-2">
                  {storageStats.keyStats.map(stat => (
                    <div
                      key={stat.key}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {stat.key}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Last modified: {formatDate(stat.lastModified)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatBytes(stat.size)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click "Refresh" to load storage statistics.
          </p>
        )}
      </div>

      {/* Clear Data Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <h4 className="text-md font-medium text-red-900 dark:text-red-400 mb-3">
          Clear All Data
        </h4>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          This will permanently delete all your settings, preferences, and
          customizations. This action cannot be undone.
        </p>

        {!showConfirmClear ? (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Are you sure you want to clear all data? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearAllData}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Clearing...' : 'Yes, Clear All Data'}
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
