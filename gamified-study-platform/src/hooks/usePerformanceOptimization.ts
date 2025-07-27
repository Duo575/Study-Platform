import { useEffect, useCallback, useRef, useMemo } from 'react';
import { performanceOptimizer } from '../services/performanceOptimizationService';
import { assetOptimizer } from '../services/assetOptimizationService';

// Hook for component performance monitoring
export const usePerformanceMonitoring = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      performanceOptimizer.recordMetric(
        `component-${componentName}-lifetime`,
        totalLifetime
      );
    };
  }, [componentName]);

  const measureRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const finishRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      performanceOptimizer.recordMetric(
        `component-${componentName}-render`,
        renderTime
      );
      renderStartTime.current = 0;
    }
  }, [componentName]);

  return { measureRender, finishRender };
};

// Hook for adaptive loading based on device capabilities
export const useAdaptiveLoading = () => {
  const strategy = useMemo(() => {
    return performanceOptimizer.getAdaptiveLoadingStrategy();
  }, []);

  const shouldLoadHighQuality = strategy.imageQuality > 70;
  const shouldEnableAnimations = strategy.enableAnimations;
  const shouldPreloadAssets = strategy.preloadAssets;

  return {
    imageQuality: strategy.imageQuality,
    enableAnimations: shouldEnableAnimations,
    preloadAssets: shouldPreloadAssets,
    chunkSize: strategy.chunkSize,
    shouldLoadHighQuality,
  };
};

// Hook for intelligent asset preloading
export const useIntelligentPreloading = (
  userPreferences: {
    favoriteEnvironments?: string[];
    recentlyUsedThemes?: string[];
    preferredMusicGenres?: string[];
  } = {}
) => {
  const { preloadAssets } = useAdaptiveLoading();

  useEffect(() => {
    if (preloadAssets && Object.keys(userPreferences).length > 0) {
      // Delay preloading to avoid blocking initial render
      const timer = setTimeout(() => {
        assetOptimizer.intelligentPreload({
          favoriteEnvironments: userPreferences.favoriteEnvironments || [],
          recentlyUsedThemes: userPreferences.recentlyUsedThemes || [],
          preferredMusicGenres: userPreferences.preferredMusicGenres || [],
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [preloadAssets, userPreferences]);
};

// Hook for memory usage monitoring
export const useMemoryMonitoring = (threshold: number = 100) => {
  const memoryUsage = useRef<number>(0);

  useEffect(() => {
    const checkMemory = () => {
      const usage = performanceOptimizer.getMemoryUsage();
      if (usage) {
        memoryUsage.current = usage.used;

        if (usage.used > threshold) {
          console.warn(`High memory usage detected: ${usage.used}MB`);

          // Suggest cleanup actions
          const recommendations =
            performanceOptimizer.getOptimizationRecommendations();
          if (recommendations.length > 0) {
            console.info('Optimization recommendations:', recommendations);
          }
        }
      }
    };

    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    checkMemory(); // Initial check

    return () => clearInterval(interval);
  }, [threshold]);

  const clearCaches = useCallback(() => {
    assetOptimizer.clearCache();
    performanceOptimizer.clearMetrics();
  }, []);

  return {
    currentUsage: memoryUsage.current,
    clearCaches,
  };
};

// Hook for bundle loading optimization
export const useBundleOptimization = () => {
  const preloadComponent = useCallback((importFn: () => Promise<any>) => {
    // Only preload if network conditions are good
    const strategy = performanceOptimizer.getAdaptiveLoadingStrategy();
    if (strategy.preloadAssets) {
      importFn().catch(error => {
        console.warn('Failed to preload component:', error);
      });
    }
  }, []);

  const loadComponentWithFallback = useCallback(
    async <T>(importFn: () => Promise<T>, fallback?: T): Promise<T> => {
      try {
        return await performanceOptimizer.measureAsyncOperation(
          'component-load',
          importFn
        );
      } catch (error) {
        console.error('Component loading failed:', error);
        if (fallback) {
          return fallback;
        }
        throw error;
      }
    },
    []
  );

  return {
    preloadComponent,
    loadComponentWithFallback,
  };
};

// Hook for performance budget monitoring
export const usePerformanceBudget = (budget: {
  maxLCP?: number;
  maxFID?: number;
  maxCLS?: number;
  maxMemoryUsage?: number;
}) => {
  const violations = useRef<string[]>([]);

  useEffect(() => {
    const checkBudget = () => {
      const result = performanceOptimizer.checkPerformanceBudget({
        maxLCP: budget.maxLCP || 2500,
        maxFID: budget.maxFID || 100,
        maxCLS: budget.maxCLS || 0.1,
        maxBundleSize: 2000,
        maxMemoryUsage: budget.maxMemoryUsage || 150,
      });

      violations.current = result.violations;

      if (!result.passed) {
        console.warn('Performance budget violations:', result.violations);
      }
    };

    // Check budget every minute
    const interval = setInterval(checkBudget, 60000);
    checkBudget(); // Initial check

    return () => clearInterval(interval);
  }, [budget]);

  return {
    violations: violations.current,
    hasViolations: violations.current.length > 0,
  };
};

// Hook for network-aware loading
export const useNetworkAwareLoading = () => {
  const networkInfo = useMemo(() => {
    return performanceOptimizer.getNetworkInfo();
  }, []);

  const isSlowNetwork =
    networkInfo?.effectiveType === 'slow-2g' ||
    networkInfo?.effectiveType === '2g';
  const isDataSaverEnabled = networkInfo?.saveData || false;

  const getOptimalImageQuality = useCallback(
    (baseQuality: number = 80) => {
      if (isSlowNetwork || isDataSaverEnabled) {
        return Math.min(baseQuality, 40);
      }
      if (networkInfo?.effectiveType === '3g') {
        return Math.min(baseQuality, 60);
      }
      return baseQuality;
    },
    [isSlowNetwork, isDataSaverEnabled, networkInfo]
  );

  const shouldLoadAsset = useCallback(
    (assetSize: number, priority: 'high' | 'medium' | 'low' = 'medium') => {
      if (priority === 'high') return true;

      if (isSlowNetwork) {
        return priority === 'high' && assetSize < 50000; // 50KB limit for slow networks
      }

      if (isDataSaverEnabled) {
        return assetSize < 100000; // 100KB limit for data saver
      }

      return true;
    },
    [isSlowNetwork, isDataSaverEnabled]
  );

  return {
    networkInfo,
    isSlowNetwork,
    isDataSaverEnabled,
    getOptimalImageQuality,
    shouldLoadAsset,
  };
};

// Hook for component lazy loading with intersection observer
export const useLazyLoading = (threshold: number = 0.1) => {
  const elementRef = useRef<HTMLElement>(null);
  const isVisible = useRef<boolean>(false);
  const hasLoaded = useRef<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasLoaded.current) {
            isVisible.current = true;
            hasLoaded.current = true;
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold]);

  return {
    elementRef,
    isVisible: isVisible.current,
    hasLoaded: hasLoaded.current,
  };
};
