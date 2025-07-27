interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  recentOperations: PerformanceMetric[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 operations
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  startTimer(
    operationId: string,
    operation: string,
    metadata?: Record<string, any>
  ): void {
    const startTime = performance.now();
    this.timers.set(operationId, startTime);

    console.log(
      `⏱️ Started timing operation: ${operation} (ID: ${operationId})`
    );

    // Store initial metric
    const metric: PerformanceMetric = {
      operation,
      startTime,
      success: false, // Will be updated when timer ends
      metadata,
    };

    this.metrics.push(metric);
    this.trimMetrics();
  }

  /**
   * End timing an operation
   */
  endTimer(
    operationId: string,
    success: boolean = true,
    error?: string
  ): number | null {
    const startTime = this.timers.get(operationId);
    if (!startTime) {
      console.warn(`⚠️ No timer found for operation ID: ${operationId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Update the metric
    const metric = this.metrics.find(m => m.startTime === startTime);
    if (metric) {
      metric.endTime = endTime;
      metric.duration = duration;
      metric.success = success;
      metric.error = error;
    }

    this.timers.delete(operationId);

    console.log(
      `✅ Completed operation: ${metric?.operation} in ${duration.toFixed(2)}ms (Success: ${success})`
    );

    return duration;
  }

  /**
   * Record a simple operation without timing
   */
  recordOperation(
    operation: string,
    success: boolean,
    duration?: number,
    error?: string,
    metadata?: Record<string, any>
  ): void {
    const now = performance.now();
    const metric: PerformanceMetric = {
      operation,
      startTime: now,
      endTime: duration ? now : undefined,
      duration,
      success,
      error,
      metadata,
    };

    this.metrics.push(metric);
    this.trimMetrics();
  }

  /**
   * Get performance statistics for a specific operation
   */
  getOperationStats(operation: string): PerformanceStats {
    const operationMetrics = this.metrics.filter(
      m => m.operation === operation && m.duration !== undefined
    );

    if (operationMetrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        recentOperations: [],
      };
    }

    const durations = operationMetrics.map(m => m.duration!);
    const successfulOps = operationMetrics.filter(m => m.success);

    return {
      totalOperations: operationMetrics.length,
      successfulOperations: successfulOps.length,
      failedOperations: operationMetrics.length - successfulOps.length,
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successfulOps.length / operationMetrics.length) * 100,
      recentOperations: operationMetrics.slice(-10), // Last 10 operations
    };
  }

  /**
   * Get overall performance statistics
   */
  getOverallStats(): PerformanceStats {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);

    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        recentOperations: [],
      };
    }

    const durations = completedMetrics.map(m => m.duration!);
    const successfulOps = completedMetrics.filter(m => m.success);

    return {
      totalOperations: completedMetrics.length,
      successfulOperations: successfulOps.length,
      failedOperations: completedMetrics.length - successfulOps.length,
      averageDuration:
        durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successfulOps.length / completedMetrics.length) * 100,
      recentOperations: completedMetrics.slice(-10),
    };
  }

  /**
   * Get all operations grouped by type
   */
  getOperationTypes(): string[] {
    return [...new Set(this.metrics.map(m => m.operation))];
  }

  /**
   * Log performance summary to console
   */
  logPerformanceSummary(): void {
    const stats = this.getOverallStats();
    const operationTypes = this.getOperationTypes();

    console.group('📊 Performance Summary');
    console.log(`Total Operations: ${stats.totalOperations}`);
    console.log(`Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(
      `Duration Range: ${stats.minDuration.toFixed(2)}ms - ${stats.maxDuration.toFixed(2)}ms`
    );

    console.group('📈 By Operation Type:');
    operationTypes.forEach(operation => {
      const opStats = this.getOperationStats(operation);
      console.log(
        `${operation}: ${opStats.totalOperations} ops, ${opStats.successRate.toFixed(1)}% success, ${opStats.averageDuration.toFixed(2)}ms avg`
      );
    });
    console.groupEnd();

    if (stats.failedOperations > 0) {
      console.group('❌ Recent Failures:');
      const recentFailures = this.metrics
        .filter(m => !m.success && m.error)
        .slice(-5);
      recentFailures.forEach(failure => {
        console.log(`${failure.operation}: ${failure.error}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
    console.log('🧹 Performance metrics cleared');
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  private trimMetrics(): void {
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common operations
export const withPerformanceTracking = async <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> => {
  const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  performanceMonitor.startTimer(operationId, operation, metadata);

  try {
    const result = await fn();
    performanceMonitor.endTimer(operationId, true);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(
      operationId,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    startTimer: performanceMonitor.startTimer.bind(performanceMonitor),
    endTimer: performanceMonitor.endTimer.bind(performanceMonitor),
    recordOperation:
      performanceMonitor.recordOperation.bind(performanceMonitor),
    getOperationStats:
      performanceMonitor.getOperationStats.bind(performanceMonitor),
    getOverallStats:
      performanceMonitor.getOverallStats.bind(performanceMonitor),
    logSummary:
      performanceMonitor.logPerformanceSummary.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  };
};

export type { PerformanceMetric, PerformanceStats };
