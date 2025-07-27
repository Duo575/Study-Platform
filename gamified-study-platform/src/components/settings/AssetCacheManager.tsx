/**
 * Asset Cache Manager component for managing Service Worker cache and asset preloading
 */

import React, { useState, useEffect } from 'react';
import {
  useCacheStatus,
  usePreloadProgress,
  useCacheManagement,
  useServiceWorkerUpdate,
} from '../../hooks/useAssetCache';

export const AssetCacheManager: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const { cacheStatus, cacheSize, refreshStatus } = useCacheStatus();
  const { progress, isPreloading } = usePreloadProgress();
  const { cacheAudioFiles, cacheEnvironmentAssets, clearCache, isOperating } =
    useCacheManagement();
  const { updateAvailable, applyUpdate, dismissUpdate } =
    useServiceWorkerUpdate();

  useEffect(() => {
    // Auto-refresh status every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const handleCacheAudio = async () => {
    try {
      setMessage({ type: 'info', text: 'Caching audio files...' });

      const audioUrls = [
        '/sounds/page-turn.mp3',
        '/sounds/pencil-write.mp3',
        '/sounds/keyboard-type.mp3',
        '/sounds/mouse-click.mp3',
        '/sounds/coffee-pour.mp3',
        '/sounds/cafe-chatter.mp3',
        '/sounds/birds-chirp.mp3',
        '/sounds/wind-leaves.mp3',
      ];

      const success = await cacheAudioFiles(audioUrls);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Audio files cached successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to cache some audio files.',
        });
      }

      await refreshStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Audio caching operation failed.' });
    }
  };

  const handleCacheEnvironments = async () => {
    try {
      setMessage({ type: 'info', text: 'Caching environment assets...' });

      const environmentUrls = [
        '/environments/classroom-bg.jpg',
        '/environments/office-bg.jpg',
        '/environments/cafe-bg.jpg',
        '/environments/forest-bg.jpg',
        '/themes/forest-green-preview.jpg',
        '/themes/ocean-blue-preview.jpg',
        '/themes/sunset-gradient-preview.jpg',
        '/themes/cherry-blossom-preview.jpg',
      ];

      const success = await cacheEnvironmentAssets(environmentUrls);

      if (success) {
        setMessage({
          type: 'success',
          text: 'Environment assets cached successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to cache some environment assets.',
        });
      }

      await refreshStatus();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Environment caching operation failed.',
      });
    }
  };

  const handleClearCache = async (cacheName?: string) => {
    try {
      const cacheDescription = cacheName || 'all caches';
      setMessage({ type: 'info', text: `Clearing ${cacheDescription}...` });

      const success = await clearCache(cacheName);

      if (success) {
        setMessage({
          type: 'success',
          text: `${cacheDescription} cleared successfully!`,
        });
      } else {
        setMessage({
          type: 'error',
          text: `Failed to clear ${cacheDescription}.`,
        });
      }

      await refreshStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Cache clearing operation failed.' });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCacheStatusColor = () => {
    if (!cacheStatus.isSupported) return 'text-gray-500 dark:text-gray-400';
    if (!cacheStatus.isRegistered) return 'text-red-600 dark:text-red-400';
    if (!cacheStatus.isActive) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCacheStatusText = () => {
    if (!cacheStatus.isSupported) return 'Not Supported';
    if (!cacheStatus.isRegistered) return 'Not Registered';
    if (!cacheStatus.isActive) return 'Inactive';
    return 'Active';
  };

  const getTotalCachedItems = () => {
    return Object.values(cacheStatus.caches).reduce(
      (total, cache) => total + cache.count,
      0
    );
  };

  return (
    <div className="space-y-4">
      {/* Service Worker Update Notification */}
      {updateAvailable && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Update Available</h4>
              <p className="text-sm mt-1">
                A new version of the app is available with improved caching.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={applyUpdate}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
              <button
                onClick={dismissUpdate}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cache Status Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                cacheStatus.isActive
                  ? 'bg-green-500'
                  : cacheStatus.isRegistered
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Asset Cache
              </h3>
              <p className={`text-sm ${getCacheStatusColor()}`}>
                Service Worker: {getCacheStatusText()}
                {cacheStatus.isActive && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    • {getTotalCachedItems()} items cached
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isPreloading && progress && (
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {progress.percentage}%
                </span>
              </div>
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
          {/* Cache Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Cache Statistics
              </h4>
              <button
                onClick={refreshStatus}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Size
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(cacheSize)}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Items
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTotalCachedItems()}
                </div>
              </div>
            </div>

            {Object.keys(cacheStatus.caches).length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Cache Breakdown
                </h5>
                <div className="space-y-2">
                  {Object.entries(cacheStatus.caches).map(
                    ([cacheName, cache]) => (
                      <div
                        key={cacheName}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cacheName
                              .replace('study-platform-', '')
                              .replace('-v1', '')}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {cache.count} items
                          </div>
                        </div>
                        <button
                          onClick={() => handleClearCache(cacheName)}
                          disabled={isOperating}
                          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Preload Progress */}
          {isPreloading && progress && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Preloading Assets
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {progress.loaded} / {progress.total} ({progress.percentage}
                    %)
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>

                {progress.currentAsset && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Loading: {progress.currentAsset}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cache Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              Cache Management
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleCacheAudio}
                disabled={isOperating || !cacheStatus.isActive}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOperating ? 'Processing...' : 'Cache Audio Files'}
              </button>

              <button
                onClick={handleCacheEnvironments}
                disabled={isOperating || !cacheStatus.isActive}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOperating ? 'Processing...' : 'Cache Environment Assets'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleClearCache()}
                disabled={isOperating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOperating ? 'Processing...' : 'Clear All Caches'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will clear all cached assets and they will need to be
                downloaded again.
              </p>
            </div>
          </div>

          {/* Service Worker Info */}
          {cacheStatus.isSupported && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Service Worker Information
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Supported:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {cacheStatus.isSupported ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Registered:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {cacheStatus.isRegistered ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Active:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {cacheStatus.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
