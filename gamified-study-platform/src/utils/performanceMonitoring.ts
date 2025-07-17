/**
 * Performance monitoring and optimization utilities
 */

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte

  // Custom metrics
  routeChangeTime?: number;
  apiResponseTime?: number;
  bundleSize?: number;
  memoryUsage?: number;
}

// Performance observer for Core Web Vitals
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // First Contentful Paint (FCP)
    this.measureFCP();

    // Time to First Byte (TTFB)
    this.measureTTFB();
  }

  private measureFCP() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      );
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('fcp', fcpEntry.startTime);
      }
    }
  }

  private measureTTFB() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      const ttfb = timing.responseStart - timing.navigationStart;
      this.metrics.ttfb = ttfb;
      this.reportMetric('ttfb', ttfb);
    }
  }

  // Measure route change performance
  measureRouteChange(routeName: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.metrics.routeChangeTime = duration;
    this.reportMetric('route-change', duration, { route: routeName });
  }

  // Measure API response time
  measureApiCall(endpoint: string, startTime: number, success: boolean = true) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.reportMetric('api-response', duration, {
      endpoint,
      success,
      timestamp: Date.now(),
    });
  }

  // Measure memory usage
  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      this.reportMetric('memory-usage', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });
    }
  }

  // Report metric to analytics service
  private reportMetric(name: string, value: number, metadata?: any) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value, metadata);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value, metadata);
    }
  }

  private sendToAnalytics(name: string, value: number, metadata?: any) {
    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        custom_parameters: metadata,
      });
    }

    // Example: Send to custom analytics endpoint
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        metric: name,
        value,
        metadata,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      navigator.sendBeacon('/api/analytics/performance', data);
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for performance optimization

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Measure function execution time
export const measureExecutionTime = async <T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    performanceMonitor.measureApiCall(name, startTime, true);
    return result;
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.measureApiCall(name, startTime, false);
    throw error;
  }
};

// Resource loading performance
export const measureResourceLoad = (url: string) => {
  const startTime = performance.now();

  return {
    onLoad: () => {
      const endTime = performance.now();
      performanceMonitor.measureApiCall(
        `resource-load-${url}`,
        startTime,
        true
      );
    },
    onError: () => {
      const endTime = performance.now();
      performanceMonitor.measureApiCall(
        `resource-load-${url}`,
        startTime,
        false
      );
    },
  };
};

// Bundle size analysis
export const analyzeBundleSize = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    const jsResources = resources.filter(
      resource =>
        resource.name.includes('.js') && !resource.name.includes('node_modules')
    );

    const cssResources = resources.filter(resource =>
      resource.name.includes('.css')
    );

    const totalJSSize = jsResources.reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    );

    const totalCSSSize = cssResources.reduce(
      (total, resource) => total + (resource.transferSize || 0),
      0
    );

    return {
      totalJSSize,
      totalCSSSize,
      totalSize: totalJSSize + totalCSSSize,
      jsFiles: jsResources.length,
      cssFiles: cssResources.length,
    };
  }

  return null;
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const metrics = performanceMonitor.getMetrics();
  const budget = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    ttfb: 800, // 800ms
  };

  const violations = [];

  if (metrics.fcp && metrics.fcp > budget.fcp) {
    violations.push(`FCP: ${metrics.fcp}ms exceeds budget of ${budget.fcp}ms`);
  }

  if (metrics.lcp && metrics.lcp > budget.lcp) {
    violations.push(`LCP: ${metrics.lcp}ms exceeds budget of ${budget.lcp}ms`);
  }

  if (metrics.fid && metrics.fid > budget.fid) {
    violations.push(`FID: ${metrics.fid}ms exceeds budget of ${budget.fid}ms`);
  }

  if (metrics.cls && metrics.cls > budget.cls) {
    violations.push(`CLS: ${metrics.cls} exceeds budget of ${budget.cls}`);
  }

  if (metrics.ttfb && metrics.ttfb > budget.ttfb) {
    violations.push(
      `TTFB: ${metrics.ttfb}ms exceeds budget of ${budget.ttfb}ms`
    );
  }

  return {
    passed: violations.length === 0,
    violations,
    metrics,
  };
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = () => {
  // Monitor memory usage periodically
  setInterval(() => {
    performanceMonitor.measureMemoryUsage();
  }, 30000); // Every 30 seconds

  // Check performance budget on page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const budgetCheck = checkPerformanceBudget();
      if (!budgetCheck.passed && process.env.NODE_ENV === 'development') {
        console.warn('Performance budget violations:', budgetCheck.violations);
      }
    }, 5000); // Wait 5 seconds after load
  });

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.disconnect();
  });
};
