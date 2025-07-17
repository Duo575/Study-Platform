/**
 * Performance testing utilities for automated performance monitoring
 */

import { performanceMonitor } from './performanceMonitoring';
import { errorTracker } from './errorTracking';

// Performance test configuration
export interface PerformanceTestConfig {
  name: string;
  url?: string;
  iterations?: number;
  timeout?: number;
  thresholds?: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
}

// Performance test result
export interface PerformanceTestResult {
  name: string;
  passed: boolean;
  metrics: {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
    loadTime?: number;
    domContentLoaded?: number;
  };
  violations: string[];
  timestamp: number;
}

class PerformanceTester {
  private results: PerformanceTestResult[] = [];

  // Run a comprehensive performance test
  async runPerformanceTest(
    config: PerformanceTestConfig
  ): Promise<PerformanceTestResult> {
    const startTime = performance.now();

    try {
      console.log(`🧪 Running performance test: ${config.name}`);

      const result: PerformanceTestResult = {
        name: config.name,
        passed: true,
        metrics: {},
        violations: [],
        timestamp: Date.now(),
      };

      // Collect current performance metrics
      const currentMetrics = performanceMonitor.getMetrics();

      // Measure page load performance
      if (config.url) {
        const loadMetrics = await this.measurePageLoad(
          config.url,
          config.timeout
        );
        Object.assign(result.metrics, loadMetrics);
      } else {
        // Use current page metrics
        result.metrics = {
          fcp: currentMetrics.fcp,
          lcp: currentMetrics.lcp,
          fid: currentMetrics.fid,
          cls: currentMetrics.cls,
          ttfb: currentMetrics.ttfb,
        };
      }

      // Check against thresholds
      if (config.thresholds) {
        this.checkThresholds(result, config.thresholds);
      }

      // Additional performance checks
      await this.runAdditionalChecks(result);

      const endTime = performance.now();
      result.metrics.loadTime = endTime - startTime;

      this.results.push(result);

      console.log(
        `${result.passed ? '✅' : '❌'} Performance test completed: ${config.name}`
      );

      return result;
    } catch (error) {
      errorTracker.captureError(
        error instanceof Error ? error : new Error('Performance test failed'),
        'high' as any,
        'performance' as any,
        {
          component: 'performance-tester',
          testName: config.name,
        }
      );

      throw error;
    }
  }

  // Measure page load performance
  private async measurePageLoad(
    url: string,
    timeout: number = 30000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';

      const timeoutId = setTimeout(() => {
        document.body.removeChild(iframe);
        reject(new Error('Performance test timeout'));
      }, timeout);

      iframe.onload = () => {
        try {
          const endTime = performance.now();
          const loadTime = endTime - startTime;

          // Get performance entries
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');

          const metrics = {
            loadTime,
            domContentLoaded:
              navigation?.domContentLoadedEventEnd -
              navigation?.domContentLoadedEventStart,
            ttfb: navigation?.responseStart - navigation?.requestStart,
            fcp: paint.find(entry => entry.name === 'first-contentful-paint')
              ?.startTime,
          };

          clearTimeout(timeoutId);
          document.body.removeChild(iframe);
          resolve(metrics);
        } catch (error) {
          clearTimeout(timeoutId);
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeoutId);
        document.body.removeChild(iframe);
        reject(new Error('Failed to load test page'));
      };

      document.body.appendChild(iframe);
      iframe.src = url;
    });
  }

  // Check performance metrics against thresholds
  private checkThresholds(result: PerformanceTestResult, thresholds: any) {
    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = result.metrics[metric as keyof typeof result.metrics];

      if (value && value > (threshold as number)) {
        result.passed = false;
        result.violations.push(
          `${metric.toUpperCase()}: ${value}ms exceeds threshold of ${threshold}ms`
        );
      }
    });
  }

  // Run additional performance checks
  private async runAdditionalChecks(result: PerformanceTestResult) {
    // Check memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;

      if (memoryUsageMB > 50) {
        // 50MB threshold
        result.violations.push(
          `Memory usage: ${memoryUsageMB.toFixed(2)}MB exceeds 50MB threshold`
        );
        result.passed = false;
      }
    }

    // Check for long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTasks = await this.measureLongTasks();
        if (longTasks.length > 0) {
          result.violations.push(
            `Found ${longTasks.length} long tasks (>50ms)`
          );
          result.passed = false;
        }
      } catch (error) {
        console.warn('Long task measurement failed:', error);
      }
    }

    // Check resource loading performance
    const resourceMetrics = this.analyzeResourcePerformance();
    if (resourceMetrics.slowResources.length > 0) {
      result.violations.push(
        `${resourceMetrics.slowResources.length} slow resources detected`
      );
      result.passed = false;
    }
  }

  // Measure long tasks
  private measureLongTasks(
    duration: number = 5000
  ): Promise<PerformanceEntry[]> {
    return new Promise(resolve => {
      const longTasks: PerformanceEntry[] = [];

      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            // Tasks longer than 50ms
            longTasks.push(entry);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });

        setTimeout(() => {
          observer.disconnect();
          resolve(longTasks);
        }, duration);
      } catch (error) {
        resolve([]);
      }
    });
  }

  // Analyze resource loading performance
  private analyzeResourcePerformance() {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    const slowResources = resources.filter(
      resource => resource.duration > 1000
    ); // > 1s

    const analysis = {
      totalResources: resources.length,
      slowResources,
      averageLoadTime:
        resources.reduce((sum, r) => sum + r.duration, 0) / resources.length,
      largestResource: resources.reduce(
        (largest, current) =>
          current.transferSize > largest.transferSize ? current : largest,
        resources[0]
      ),
    };

    return analysis;
  }

  // Run automated performance regression tests
  async runRegressionTests(): Promise<PerformanceTestResult[]> {
    const tests: PerformanceTestConfig[] = [
      {
        name: 'Landing Page Performance',
        url: '/',
        thresholds: {
          fcp: 1800,
          lcp: 2500,
          ttfb: 800,
        },
      },
      {
        name: 'Dashboard Performance',
        url: '/dashboard',
        thresholds: {
          fcp: 2000,
          lcp: 3000,
          ttfb: 1000,
        },
      },
      {
        name: 'Course List Performance',
        url: '/courses',
        thresholds: {
          fcp: 2000,
          lcp: 3000,
          ttfb: 1000,
        },
      },
    ];

    const results = [];

    for (const test of tests) {
      try {
        const result = await this.runPerformanceTest(test);
        results.push(result);

        // Wait between tests to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Performance test failed: ${test.name}`, error);
      }
    }

    return results;
  }

  // Generate performance report
  generateReport(): string {
    const passedTests = this.results.filter(r => r.passed).length;
    const totalTests = this.results.length;

    let report = `Performance Test Report\n`;
    report += `========================\n\n`;
    report += `Tests Passed: ${passedTests}/${totalTests}\n`;
    report += `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;

    this.results.forEach(result => {
      report += `${result.passed ? '✅' : '❌'} ${result.name}\n`;

      if (result.metrics.fcp)
        report += `  FCP: ${result.metrics.fcp.toFixed(0)}ms\n`;
      if (result.metrics.lcp)
        report += `  LCP: ${result.metrics.lcp.toFixed(0)}ms\n`;
      if (result.metrics.fid)
        report += `  FID: ${result.metrics.fid.toFixed(0)}ms\n`;
      if (result.metrics.cls)
        report += `  CLS: ${result.metrics.cls.toFixed(3)}\n`;
      if (result.metrics.ttfb)
        report += `  TTFB: ${result.metrics.ttfb.toFixed(0)}ms\n`;

      if (result.violations.length > 0) {
        report += `  Violations:\n`;
        result.violations.forEach(violation => {
          report += `    - ${violation}\n`;
        });
      }

      report += `\n`;
    });

    return report;
  }

  // Get test results
  getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  // Clear test results
  clearResults(): void {
    this.results = [];
  }
}

// Singleton instance
export const performanceTester = new PerformanceTester();

// Utility functions for performance testing

// Test component render performance
export const testComponentPerformance = async (
  componentName: string,
  renderFn: () => void,
  iterations: number = 100
): Promise<{ averageTime: number; maxTime: number; minTime: number }> => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    times.push(endTime - startTime);
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);

  console.log(`Component Performance - ${componentName}:`);
  console.log(`  Average: ${averageTime.toFixed(2)}ms`);
  console.log(`  Max: ${maxTime.toFixed(2)}ms`);
  console.log(`  Min: ${minTime.toFixed(2)}ms`);

  return { averageTime, maxTime, minTime };
};

// Test API performance
export const testApiPerformance = async (
  endpoint: string,
  requestFn: () => Promise<any>,
  iterations: number = 10
): Promise<{ averageTime: number; successRate: number; errors: string[] }> => {
  const times: number[] = [];
  const errors: string[] = [];
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      await requestFn();
      const endTime = performance.now();
      times.push(endTime - startTime);
      successCount++;
    } catch (error) {
      const endTime = performance.now();
      times.push(endTime - startTime);
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const successRate = (successCount / iterations) * 100;

  console.log(`API Performance - ${endpoint}:`);
  console.log(`  Average Response Time: ${averageTime.toFixed(2)}ms`);
  console.log(`  Success Rate: ${successRate.toFixed(1)}%`);

  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length}`);
  }

  return { averageTime, successRate, errors };
};

// Performance test scheduler
export class PerformanceTestScheduler {
  private intervalId: number | null = null;

  // Schedule regular performance tests
  schedule(intervalMs: number = 300000) {
    // Default: 5 minutes
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = window.setInterval(async () => {
      try {
        console.log('🔄 Running scheduled performance tests...');
        const results = await performanceTester.runRegressionTests();

        const failedTests = results.filter(r => !r.passed);
        if (failedTests.length > 0) {
          console.warn(`⚠️ ${failedTests.length} performance tests failed`);

          // Report performance degradation
          errorTracker.captureError(
            new Error('Performance regression detected'),
            'medium' as any,
            'performance' as any,
            {
              component: 'performance-scheduler',
              failedTests: failedTests.map(t => t.name),
            }
          );
        }
      } catch (error) {
        console.error('Scheduled performance test failed:', error);
      }
    }, intervalMs);

    console.log(`📅 Performance tests scheduled every ${intervalMs / 1000}s`);
  }

  // Stop scheduled tests
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Performance test scheduling stopped');
    }
  }
}

export const performanceScheduler = new PerformanceTestScheduler();
