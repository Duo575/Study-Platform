/**
 * React hooks for asset caching and progressive loading
 */

import { useEffect, useState, useCallback } from 'react';
import {
  assetCacheService,
  type CacheStatus,
  type PreloadProgress,
} from '../services/assetCacheService';
import { useEnvironmentStore } from '../store/environmentStore';
import { useThemeStore } from '../store/themeStore';

/**
 * Hook to initialize asset caching
 */
export function useAssetCacheInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await assetCacheService.initialize();
        setIsInitialized(true);
        console.log('Asset cache service initialized');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to initialize asset cache service:', err);
      }
    };

    initialize();
  }, []);

  return { isInitialized, error };
}

/**
 * Hook for cache status monitoring
 */
export function useCacheStatus() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isSupported: false,
    isRegistered: false,
    isActive: false,
    caches: {},
  });

  const [cacheSize, setCacheSize] = useState<number>(0);

  useEffect(() => {
    const updateStatus = (status: CacheStatus) => {
      setCacheStatus(status);
    };

    assetCacheService.addStatusListener(updateStatus);

    // Get initial status
    assetCacheService.getCacheStatus().then(updateStatus);

    // Get cache size
    assetCacheService.getCacheSize().then(setCacheSize);

    return () => {
      assetCacheService.removeStatusListener(updateStatus);
    };
  }, []);

  const refreshStatus = useCallback(async () => {
    const status = await assetCacheService.getCacheStatus();
    setCacheStatus(status);

    const size = await assetCacheService.getCacheSize();
    setCacheSize(size);
  }, []);

  return {
    cacheStatus,
    cacheSize,
    refreshStatus,
  };
}

/**
 * Hook for preload progress monitoring
 */
export function usePreloadProgress() {
  const [progress, setProgress] = useState<PreloadProgress | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    const updateProgress = (newProgress: PreloadProgress) => {
      setProgress(newProgress);
      setIsPreloading(newProgress.percentage < 100);
    };

    assetCacheService.addPreloadListener(updateProgress);

    return () => {
      assetCacheService.removePreloadListener(updateProgress);
    };
  }, []);

  return {
    progress,
    isPreloading,
  };
}

/**
 * Hook for environment asset preloading
 */
export function useEnvironmentAssetPreloading() {
  const environmentStore = useEnvironmentStore();
  const [preloadedEnvironments, setPreloadedEnvironments] = useState<
    Set<string>
  >(new Set());

  // Preload assets for current environment
  const preloadCurrentEnvironment = useCallback(async () => {
    const currentEnv = environmentStore.currentEnvironment;
    if (!currentEnv || preloadedEnvironments.has(currentEnv.id)) {
      return;
    }

    try {
      const success = await assetCacheService.preloadEnvironmentAssets(
        currentEnv.id
      );
      if (success) {
        setPreloadedEnvironments(prev => new Set(prev).add(currentEnv.id));
        console.log(`Preloaded assets for environment: ${currentEnv.id}`);
      }
    } catch (error) {
      console.error('Failed to preload environment assets:', error);
    }
  }, [environmentStore.currentEnvironment, preloadedEnvironments]);

  // Preload assets for unlocked environments
  const preloadUnlockedEnvironments = useCallback(async () => {
    const unlockedEnvs = environmentStore.unlockedEnvironments;
    const availableEnvs = environmentStore.availableEnvironments;

    for (const envId of unlockedEnvs) {
      if (preloadedEnvironments.has(envId)) continue;

      const env = availableEnvs.find(e => e.id === envId);
      if (!env) continue;

      try {
        const success = await assetCacheService.preloadEnvironmentAssets(envId);
        if (success) {
          setPreloadedEnvironments(prev => new Set(prev).add(envId));
          console.log(`Preloaded assets for environment: ${envId}`);
        }
      } catch (error) {
        console.error(
          `Failed to preload assets for environment ${envId}:`,
          error
        );
      }

      // Small delay between preloads to avoid overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [
    environmentStore.unlockedEnvironments,
    environmentStore.availableEnvironments,
    preloadedEnvironments,
  ]);

  // Auto-preload current environment
  useEffect(() => {
    preloadCurrentEnvironment();
  }, [preloadCurrentEnvironment]);

  return {
    preloadCurrentEnvironment,
    preloadUnlockedEnvironments,
    preloadedEnvironments: Array.from(preloadedEnvironments),
  };
}

/**
 * Hook for intelligent asset preloading based on usage patterns
 */
export function useIntelligentPreloading() {
  const environmentStore = useEnvironmentStore();
  const themeStore = useThemeStore();

  const preloadBasedOnUsage = useCallback(async () => {
    try {
      // Analyze usage patterns
      const usageData = {
        frequentEnvironments: environmentStore.unlockedEnvironments.slice(0, 3), // Top 3 unlocked
        recentlyUsedThemes: themeStore.unlockedThemes.slice(0, 2), // Top 2 unlocked
        preferredAudioTracks: [
          '/music/lofi-study-1.mp3',
          '/music/lofi-study-2.mp3',
        ], // Mock preferred tracks
      };

      await assetCacheService.preloadBasedOnUsage(usageData);
      console.log('Intelligent preloading completed');
    } catch (error) {
      console.error('Intelligent preloading failed:', error);
    }
  }, [environmentStore.unlockedEnvironments, themeStore.unlockedThemes]);

  // Run intelligent preloading on mount and when usage patterns change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      preloadBasedOnUsage();
    }, 2000); // Delay to avoid blocking initial load

    return () => clearTimeout(timeoutId);
  }, [preloadBasedOnUsage]);

  return {
    preloadBasedOnUsage,
  };
}

/**
 * Hook for progressive asset loading with loading indicators
 */
export function useProgressiveLoading() {
  const [loadingAssets, setLoadingAssets] = useState<Map<string, number>>(
    new Map()
  );

  const loadAssetWithProgress = useCallback(
    async (url: string): Promise<Response> => {
      setLoadingAssets(prev => new Map(prev).set(url, 0));

      try {
        const response = await assetCacheService.loadAssetWithProgress(
          url,
          (loaded, total) => {
            const percentage = Math.round((loaded / total) * 100);
            setLoadingAssets(prev => new Map(prev).set(url, percentage));
          }
        );

        // Remove from loading assets when complete
        setLoadingAssets(prev => {
          const newMap = new Map(prev);
          newMap.delete(url);
          return newMap;
        });

        return response;
      } catch (error) {
        // Remove from loading assets on error
        setLoadingAssets(prev => {
          const newMap = new Map(prev);
          newMap.delete(url);
          return newMap;
        });
        throw error;
      }
    },
    []
  );

  const isAssetLoading = useCallback(
    (url: string): boolean => {
      return loadingAssets.has(url);
    },
    [loadingAssets]
  );

  const getAssetLoadingProgress = useCallback(
    (url: string): number => {
      return loadingAssets.get(url) || 0;
    },
    [loadingAssets]
  );

  return {
    loadAssetWithProgress,
    isAssetLoading,
    getAssetLoadingProgress,
    loadingAssets: Object.fromEntries(loadingAssets),
  };
}

/**
 * Hook for cache management operations
 */
export function useCacheManagement() {
  const [isOperating, setIsOperating] = useState(false);

  const cacheAudioFiles = useCallback(
    async (urls: string[]): Promise<boolean> => {
      setIsOperating(true);
      try {
        const success = await assetCacheService.cacheAudioFiles(urls);
        console.log('Audio files cached:', success);
        return success;
      } catch (error) {
        console.error('Failed to cache audio files:', error);
        return false;
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  const cacheEnvironmentAssets = useCallback(
    async (urls: string[]): Promise<boolean> => {
      setIsOperating(true);
      try {
        const success = await assetCacheService.cacheEnvironmentAssets(urls);
        console.log('Environment assets cached:', success);
        return success;
      } catch (error) {
        console.error('Failed to cache environment assets:', error);
        return false;
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  const clearCache = useCallback(
    async (cacheName?: string): Promise<boolean> => {
      setIsOperating(true);
      try {
        const success = await assetCacheService.clearCache(cacheName);
        console.log('Cache cleared:', success);
        return success;
      } catch (error) {
        console.error('Failed to clear cache:', error);
        return false;
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  const isAssetCached = useCallback(async (url: string): Promise<boolean> => {
    try {
      return await assetCacheService.isAssetCached(url);
    } catch (error) {
      console.error('Failed to check if asset is cached:', error);
      return false;
    }
  }, []);

  return {
    cacheAudioFiles,
    cacheEnvironmentAssets,
    clearCache,
    isAssetCached,
    isOperating,
  };
}

/**
 * Hook for service worker update notifications
 */
export function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    try {
      await assetCacheService.updateServiceWorker();
      // Reload the page to activate the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to apply service worker update:', error);
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false);
  }, []);

  return {
    updateAvailable,
    applyUpdate,
    dismissUpdate,
  };
}

/**
 * Hook for automatic asset optimization
 */
export function useAssetOptimization() {
  const { preloadUnlockedEnvironments } = useEnvironmentAssetPreloading();
  const { preloadBasedOnUsage } = useIntelligentPreloading();

  // Run optimization on idle
  useEffect(() => {
    const runOptimization = () => {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            preloadUnlockedEnvironments();
            preloadBasedOnUsage();
          },
          { timeout: 5000 }
        );
      } else {
        setTimeout(() => {
          preloadUnlockedEnvironments();
          preloadBasedOnUsage();
        }, 3000);
      }
    };

    runOptimization();
  }, [preloadUnlockedEnvironments, preloadBasedOnUsage]);
}
