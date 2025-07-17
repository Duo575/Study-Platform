import { useEffect, useCallback, useRef, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  performanceMonitor,
  debounce,
  throttle,
} from '../utils/performanceMonitoring';
import { errorTracker } from '../utils/errorTracking';

// Hook for route change performance monitoring
export const useRoutePerformance = () => {
  const location = useLocation();
  const routeStartTime = useRef<number>(0);

  useEffect(() => {
    routeStartTime.current = performance.now();

    // Measure route change performance after component mounts
    const timeoutId = setTimeout(() => {
      performanceMonitor.measureRouteChange(
        location.pathname,
        routeStartTime.current
      );
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

// Hook for API call performance monitoring
export const useApiPerformance = () => {
  const measureApiCall = useCallback(
    (endpoint: string, startTime: number, success: boolean = true) => {
      performanceMonitor.measureApiCall(endpoint, startTime, success);
    },
    []
  );

  const withApiTracking = useCallback(
    async <T>(endpoint: string, apiCall: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await apiCall();
        measureApiCall(endpoint, startTime, true);
        return result;
      } catch (error) {
        measureApiCall(endpoint, startTime, false);
        throw error;
      }
    },
    [measureApiCall]
  );

  return { measureApiCall, withApiTracking };
};

// Hook for optimized event handlers
export const useOptimizedHandlers = () => {
  const createDebouncedHandler = useCallback(
    <T extends (...args: any[]) => any>(handler: T, delay: number = 300) => {
      return debounce(handler, delay);
    },
    []
  );

  const createThrottledHandler = useCallback(
    <T extends (...args: any[]) => any>(handler: T, limit: number = 100) => {
      return throttle(handler, limit);
    },
    []
  );

  return { createDebouncedHandler, createThrottledHandler };
};

// Hook for memory usage monitoring
export const useMemoryMonitoring = (interval: number = 30000) => {
  useEffect(() => {
    const monitorMemory = () => {
      performanceMonitor.measureMemoryUsage();
    };

    const intervalId = setInterval(monitorMemory, interval);

    // Initial measurement
    monitorMemory();

    return () => clearInterval(intervalId);
  }, [interval]);
};

// Hook for intersection observer (lazy loading)
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const observe = useCallback(
    (element: Element) => {
      if (!observer.current) {
        observer.current = new IntersectionObserver(callback, {
          rootMargin: '50px 0px',
          threshold: 0.01,
          ...options,
        });
      }
      observer.current.observe(element);
    },
    [callback, options]
  );

  const unobserve = useCallback((element: Element) => {
    if (observer.current) {
      observer.current.unobserve(element);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { observe, unobserve, disconnect };
};

// Hook for error boundary integration
export const useErrorTracking = (componentName: string) => {
  const captureError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      errorTracker.captureError(error, 'medium' as any, 'runtime' as any, {
        component: componentName,
        metadata: context,
      });
    },
    [componentName]
  );

  const captureUserAction = useCallback(
    (action: string, metadata?: Record<string, any>) => {
      errorTracker.captureUserAction(action, {
        component: componentName,
        ...metadata,
      });
    },
    [componentName]
  );

  return { captureError, captureUserAction };
};

// Hook for resource preloading
export const useResourcePreloading = () => {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStylesheet = useCallback((href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => resolve();
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return { preloadImage, preloadScript, preloadStylesheet };
};

// Hook for virtual scrolling optimization
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: visibleItems.totalHeight,
    offsetY: visibleItems.offsetY,
  };
};

// Hook for component performance profiling
export const useComponentProfiler = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Component ${componentName} lifetime: ${totalLifetime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);

  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;

      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(
          `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }

      renderStartTime.current = 0;
    }
  }, [componentName]);

  return { startRender, endRender };
};

// Hook for bundle splitting and code splitting
export const useCodeSplitting = () => {
  const loadComponent = useCallback(async (importFn: () => Promise<any>) => {
    const startTime = performance.now();

    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Component loaded in ${loadTime.toFixed(2)}ms`);
      }

      return module;
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Code splitting failed'),
        'high' as any,
        'runtime' as any,
        {
          component: 'code-splitting',
          action: 'dynamic-import',
        }
      );
      throw error;
    }
  }, []);

  return { loadComponent };
};

// Combined performance optimization hook
export const usePerformanceOptimization = (componentName: string) => {
  useRoutePerformance();
  useMemoryMonitoring();

  const { captureError, captureUserAction } = useErrorTracking(componentName);
  const { createDebouncedHandler, createThrottledHandler } =
    useOptimizedHandlers();
  const { measureApiCall, withApiTracking } = useApiPerformance();
  const { startRender, endRender } = useComponentProfiler(componentName);

  return {
    captureError,
    captureUserAction,
    createDebouncedHandler,
    createThrottledHandler,
    measureApiCall,
    withApiTracking,
    startRender,
    endRender,
  };
};
