import React, { useState, useEffect } from 'react';
import {
  performanceMonitor,
  checkPerformanceBudget,
  analyzeBundleSize,
} from '../../utils/performanceMonitoring';
import { errorTracker } from '../../utils/errorTracking';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'needs-improvement' | 'poor';
  threshold: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [budgetCheck, setBudgetCheck] = useState<any>(null);
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === 'development' ||
      localStorage.getItem('show-performance-dashboard') === 'true';
    setIsVisible(shouldShow);

    if (shouldShow) {
      updateMetrics();
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const updateMetrics = () => {
    // Get performance metrics
    const currentMetrics = performanceMonitor.getMetrics();
    const budget = checkPerformanceBudget();
    const bundle = analyzeBundleSize();
    const errors = errorTracker.getErrorStats();

    // Convert metrics to display format
    const displayMetrics: PerformanceMetric[] = [
      {
        name: 'First Contentful Paint',
        value: currentMetrics.fcp || 0,
        unit: 'ms',
        status: getMetricStatus(currentMetrics.fcp || 0, 1800),
        threshold: 1800,
      },
      {
        name: 'Largest Contentful Paint',
        value: currentMetrics.lcp || 0,
        unit: 'ms',
        status: getMetricStatus(currentMetrics.lcp || 0, 2500),
        threshold: 2500,
      },
      {
        name: 'First Input Delay',
        value: currentMetrics.fid || 0,
        unit: 'ms',
        status: getMetricStatus(currentMetrics.fid || 0, 100),
        threshold: 100,
      },
      {
        name: 'Cumulative Layout Shift',
        value: currentMetrics.cls || 0,
        unit: '',
        status: getMetricStatus(currentMetrics.cls || 0, 0.1),
        threshold: 0.1,
      },
      {
        name: 'Time to First Byte',
        value: currentMetrics.ttfb || 0,
        unit: 'ms',
        status: getMetricStatus(currentMetrics.ttfb || 0, 800),
        threshold: 800,
      },
    ];

    if (currentMetrics.memoryUsage) {
      displayMetrics.push({
        name: 'Memory Usage',
        value: Math.round(currentMetrics.memoryUsage / 1024 / 1024),
        unit: 'MB',
        status: getMetricStatus(currentMetrics.memoryUsage / 1024 / 1024, 50),
        threshold: 50,
      });
    }

    setMetrics(displayMetrics);
    setBudgetCheck(budget);
    setBundleAnalysis(bundle);
    setErrorStats(errors);
  };

  const getMetricStatus = (
    value: number,
    threshold: number
  ): 'good' | 'needs-improvement' | 'poor' => {
    if (value === 0) return 'good';
    if (value <= threshold) return 'good';
    if (value <= threshold * 1.5) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Performance Monitor
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Core Web Vitals
          </h4>
          {metrics.slice(0, 5).map(metric => (
            <div
              key={metric.name}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-gray-600 truncate">{metric.name}</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono">
                  {metric.value > 0
                    ? `${metric.value.toFixed(metric.name.includes('Layout') ? 3 : 0)}${metric.unit}`
                    : 'N/A'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(metric.status)}`}
                >
                  {metric.status === 'good'
                    ? '✓'
                    : metric.status === 'needs-improvement'
                      ? '⚠'
                      : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Memory Usage */}
        {metrics.length > 5 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Memory
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">JS Heap Size</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono">
                  {metrics[5].value}
                  {metrics[5].unit}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(metrics[5].status)}`}
                >
                  {metrics[5].status === 'good'
                    ? '✓'
                    : metrics[5].status === 'needs-improvement'
                      ? '⚠'
                      : '✗'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Analysis */}
        {bundleAnalysis && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Bundle Size
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">JS:</span>
                <span className="ml-1 font-mono">
                  {formatBytes(bundleAnalysis.totalJSSize)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">CSS:</span>
                <span className="ml-1 font-mono">
                  {formatBytes(bundleAnalysis.totalCSSSize)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Stats */}
        {errorStats && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Errors
            </h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Queued Errors</span>
              <span
                className={`font-mono ${errorStats.queuedErrors > 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {errorStats.queuedErrors}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Online Status</span>
              <span
                className={`font-mono ${errorStats.isOnline ? 'text-green-600' : 'text-red-600'}`}
              >
                {errorStats.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        )}

        {/* Performance Budget Status */}
        {budgetCheck && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Performance Budget</span>
              <span
                className={`font-medium ${budgetCheck.passed ? 'text-green-600' : 'text-red-600'}`}
              >
                {budgetCheck.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            {!budgetCheck.passed && budgetCheck.violations.length > 0 && (
              <div className="mt-1">
                <details className="text-xs">
                  <summary className="cursor-pointer text-red-600 hover:text-red-800">
                    {budgetCheck.violations.length} violations
                  </summary>
                  <ul className="mt-1 space-y-1 text-red-600">
                    {budgetCheck.violations
                      .slice(0, 3)
                      .map((violation: string, index: number) => (
                        <li key={index} className="truncate">
                          • {violation}
                        </li>
                      ))}
                  </ul>
                </details>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-gray-200 flex space-x-2">
          <button
            onClick={updateMetrics}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Refresh
          </button>
          <button
            onClick={() =>
              console.log('Performance Metrics:', {
                metrics,
                budgetCheck,
                bundleAnalysis,
                errorStats,
              })
            }
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Log Data
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to toggle performance dashboard
export const usePerformanceDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P to toggle performance dashboard
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'P'
      ) {
        event.preventDefault();
        const newVisibility = !localStorage.getItem(
          'show-performance-dashboard'
        );
        localStorage.setItem(
          'show-performance-dashboard',
          newVisibility.toString()
        );
        setIsVisible(newVisibility);
        window.location.reload(); // Reload to apply changes
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { isVisible };
};

export default PerformanceDashboard;
