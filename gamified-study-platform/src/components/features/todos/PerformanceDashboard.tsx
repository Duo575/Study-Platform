import React, { useState, useEffect } from 'react';
import {
  performanceMonitor,
  usePerformanceMonitor,
  PerformanceStats,
} from '../../../utils/performanceMonitor';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  const { getOverallStats, getOperationStats, logSummary, clearMetrics } =
    usePerformanceMonitor();
  const [overallStats, setOverallStats] = useState<PerformanceStats | null>(
    null
  );
  const [operationStats, setOperationStats] = useState<
    Record<string, PerformanceStats>
  >({});
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  const refreshStats = React.useCallback(() => {
    const overall = getOverallStats();
    setOverallStats(overall);

    // Get stats for common operations
    const operations = [
      'fetchTodos',
      'createTodo',
      'updateTodo',
      'deleteTodo',
      'toggleTodo',
    ];
    const opStats: Record<string, PerformanceStats> = {};

    operations.forEach(operation => {
      opStats[operation] = getOperationStats(operation);
    });

    setOperationStats(opStats);
  }, [getOverallStats, getOperationStats]);

  useEffect(() => {
    if (isOpen) {
      refreshStats();

      // Auto-refresh every 2 seconds when dashboard is open
      const interval = setInterval(refreshStats, 2000);
      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [isOpen, refreshStats, refreshInterval]);

  const handleClearMetrics = () => {
    clearMetrics();
    refreshStats();
  };

  const handleLogSummary = () => {
    logSummary();
  };

  if (!isOpen) return null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(1)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return 'text-green-600 dark:text-green-400';
    if (successRate >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshStats}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Refresh Stats"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={handleLogSummary}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Log Summary
            </button>

            <button
              onClick={handleClearMetrics}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Metrics
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {overallStats && overallStats.totalOperations > 0 ? (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Operations
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallStats.totalOperations}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Success Rate
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${getStatusColor(overallStats.successRate)}`}
                  >
                    {overallStats.successRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Avg Duration
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDuration(overallStats.averageDuration)}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Failed Ops
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {overallStats.failedOperations}
                  </div>
                </div>
              </div>

              {/* Operation Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Operation Breakdown
                </h3>

                <div className="space-y-3">
                  {Object.entries(operationStats).map(
                    ([operation, stats]) =>
                      stats.totalOperations > 0 && (
                        <div
                          key={operation}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {operation}
                            </h4>
                            <span
                              className={`text-sm font-medium ${getStatusColor(stats.successRate)}`}
                            >
                              {stats.successRate.toFixed(1)}% success
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Total:
                              </span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                {stats.totalOperations}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Avg:
                              </span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                {formatDuration(stats.averageDuration)}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Min:
                              </span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                {formatDuration(stats.minDuration)}
                              </span>
                            </div>

                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Max:
                              </span>
                              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                {formatDuration(stats.maxDuration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* Recent Operations */}
              {overallStats.recentOperations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Operations
                  </h3>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                              Operation
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                              Duration
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                              Error
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {overallStats.recentOperations
                            .slice(-10)
                            .reverse()
                            .map((op, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-gray-900 dark:text-white">
                                  {op.operation}
                                </td>
                                <td className="px-4 py-2 text-gray-900 dark:text-white">
                                  {op.duration
                                    ? formatDuration(op.duration)
                                    : '-'}
                                </td>
                                <td className="px-4 py-2">
                                  <span
                                    className={`inline-flex items-center gap-1 ${
                                      op.success
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {op.success ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : (
                                      <XCircle className="h-3 w-3" />
                                    )}
                                    {op.success ? 'Success' : 'Failed'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-xs">
                                  {op.error || '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Performance Data
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Perform some todo operations to see performance metrics here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
