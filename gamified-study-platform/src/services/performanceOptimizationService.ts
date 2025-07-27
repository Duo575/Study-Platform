// Performance optimization service for monitoring and improving app performance
export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private performanceObserver?: PerformanceObserver;
  private metrics: Map<string, number[]> = new Map();
  private bundleLoadTimes: Map<string, number> = new Map();

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance =
        new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  constructor() {
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Monitor resource loading times
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric(entry.name, entry.duration);

          // Track bundle loading specifically
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            this.bundleLoadTimes.set(entry.name, entry.duration);
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: ['resource', 'navigation', 'measure'],
      });
    }

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
  }

  private monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver(list => {
        list.getEntries().forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  // Measure component render time
  measureComponentRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();

    this.recordMetric(`component-${componentName}`, endTime - startTime);
    return result;
  }

  // Measure async operation time
  async measureAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      this.recordMetric(`async-${operationName}`, endTime - startTime);
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`async-${operationName}-error`, endTime - startTime);
      throw error;
    }
  }

  // Get performance metrics
  getMetrics() {
    const result: Record<
      string,
      { avg: number; min: number; max: number; count: number }
    > = {};

    this.metrics.forEach((values, name) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      result[name] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: values.length,
      };
    });

    return result;
  }

  // Get bundle loading performance
  getBundlePerformance() {
    const bundles: Record<string, { loadTime: number; size?: number }> = {};

    this.bundleLoadTimes.forEach((loadTime, bundleName) => {
      bundles[bundleName] = {
        loadTime: Math.round(loadTime * 100) / 100,
      };
    });

    return bundles;
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100, // MB
        total: Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100, // MB
        limit: Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100, // MB
      };
    }
    return null;
  }

  // Network information
  getNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return null;
  }

  // Optimize based on device capabilities
  getOptimizationRecommendations() {
    const memory = this.getMemoryUsage();
    const network = this.getNetworkInfo();
    const recommendations: string[] = [];

    // Memory-based recommendations
    if (memory && memory.used / memory.total > 0.8) {
      recommendations.push(
        'High memory usage detected. Consider reducing image quality or clearing caches.'
      );
    }

    // Network-based recommendations
    if (network) {
      if (
        network.effectiveType === 'slow-2g' ||
        network.effectiveType === '2g'
      ) {
        recommendations.push(
          'Slow network detected. Enable data saver mode and reduce asset quality.'
        );
      }
      if (network.saveData) {
        recommendations.push(
          'Data saver mode is enabled. Optimize for minimal data usage.'
        );
      }
    }

    // Performance-based recommendations
    const metrics = this.getMetrics();
    if (metrics.LCP && metrics.LCP.avg > 2500) {
      recommendations.push(
        'Largest Contentful Paint is slow. Consider optimizing critical resources.'
      );
    }
    if (metrics.FID && metrics.FID.avg > 100) {
      recommendations.push(
        'First Input Delay is high. Consider reducing JavaScript execution time.'
      );
    }
    if (metrics.CLS && metrics.CLS.avg > 0.1) {
      recommendations.push(
        'Cumulative Layout Shift is high. Ensure proper sizing for dynamic content.'
      );
    }

    return recommendations;
  }

  // Adaptive loading based on device capabilities
  getAdaptiveLoadingStrategy() {
    const memory = this.getMemoryUsage();
    const network = this.getNetworkInfo();

    let strategy = {
      imageQuality: 80,
      enableAnimations: true,
      preloadAssets: true,
      chunkSize: 'normal' as 'small' | 'normal' | 'large',
      enableServiceWorker: true,
    };

    // Adjust based on memory
    if (memory && memory.used / memory.total > 0.7) {
      strategy.imageQuality = 60;
      strategy.preloadAssets = false;
      strategy.chunkSize = 'small';
    }

    // Adjust based on network
    if (network) {
      if (
        network.effectiveType === 'slow-2g' ||
        network.effectiveType === '2g'
      ) {
        strategy.imageQuality = 40;
        strategy.enableAnimations = false;
        strategy.preloadAssets = false;
        strategy.chunkSize = 'small';
      }
      if (network.saveData) {
        strategy.imageQuality = 50;
        strategy.enableAnimations = false;
        strategy.preloadAssets = false;
      }
    }

    return strategy;
  }

  // Bundle size analysis
  analyzeBundleSize() {
    const bundles = this.getBundlePerformance();
    const analysis = {
      totalBundles: Object.keys(bundles).length,
      slowestBundle: '',
      slowestTime: 0,
      averageLoadTime: 0,
      recommendations: [] as string[],
    };

    let totalTime = 0;
    Object.entries(bundles).forEach(([name, data]) => {
      totalTime += data.loadTime;
      if (data.loadTime > analysis.slowestTime) {
        analysis.slowestBundle = name;
        analysis.slowestTime = data.loadTime;
      }
    });

    analysis.averageLoadTime = totalTime / analysis.totalBundles;

    // Generate recommendations
    if (analysis.slowestTime > 1000) {
      analysis.recommendations.push(
        `Bundle ${analysis.slowestBundle} is loading slowly (${analysis.slowestTime}ms). Consider code splitting.`
      );
    }
    if (analysis.averageLoadTime > 500) {
      analysis.recommendations.push(
        'Average bundle load time is high. Consider reducing bundle sizes.'
      );
    }
    if (analysis.totalBundles > 20) {
      analysis.recommendations.push(
        'Large number of bundles detected. Consider bundle consolidation.'
      );
    }

    return analysis;
  }

  // Performance budget monitoring
  checkPerformanceBudget(budget: {
    maxLCP: number;
    maxFID: number;
    maxCLS: number;
    maxBundleSize: number;
    maxMemoryUsage: number;
  }) {
    const metrics = this.getMetrics();
    const memory = this.getMemoryUsage();
    const violations: string[] = [];

    if (metrics.LCP && metrics.LCP.avg > budget.maxLCP) {
      violations.push(
        `LCP exceeds budget: ${metrics.LCP.avg}ms > ${budget.maxLCP}ms`
      );
    }
    if (metrics.FID && metrics.FID.avg > budget.maxFID) {
      violations.push(
        `FID exceeds budget: ${metrics.FID.avg}ms > ${budget.maxFID}ms`
      );
    }
    if (metrics.CLS && metrics.CLS.avg > budget.maxCLS) {
      violations.push(
        `CLS exceeds budget: ${metrics.CLS.avg} > ${budget.maxCLS}`
      );
    }
    if (memory && memory.used > budget.maxMemoryUsage) {
      violations.push(
        `Memory usage exceeds budget: ${memory.used}MB > ${budget.maxMemoryUsage}MB`
      );
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
    this.bundleLoadTimes.clear();
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.clearMetrics();
  }
}

// Export singleton instance
export const performanceOptimizer =
  PerformanceOptimizationService.getInstance();
