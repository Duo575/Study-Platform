import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { performanceMonitor } from '../utils/performanceMonitor';
import { mockTodoService } from '../services/mockDatabase';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true,
});

describe('Todo Performance Validation', () => {
  let currentTime = 0;

  beforeEach(() => {
    // Reset performance monitor
    performanceMonitor.clearMetrics();

    // Reset mock time
    currentTime = 0;
    mockPerformanceNow.mockImplementation(() => currentTime);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Monitoring', () => {
    it('should track operation timing correctly', () => {
      const operationId = 'test-operation-1';

      // Start timer
      performanceMonitor.startTimer(operationId, 'testOperation');

      // Simulate time passing
      currentTime = 100;

      // End timer
      const duration = performanceMonitor.endTimer(operationId, true);

      expect(duration).toBe(100);

      const stats = performanceMonitor.getOperationStats('testOperation');
      expect(stats.totalOperations).toBe(1);
      expect(stats.successfulOperations).toBe(1);
      expect(stats.averageDuration).toBe(100);
    });

    it('should handle failed operations correctly', () => {
      const operationId = 'test-operation-2';

      performanceMonitor.startTimer(operationId, 'testOperation');
      currentTime = 50;
      performanceMonitor.endTimer(operationId, false, 'Test error');

      const stats = performanceMonitor.getOperationStats('testOperation');
      expect(stats.totalOperations).toBe(1);
      expect(stats.failedOperations).toBe(1);
      expect(stats.successRate).toBe(0);
    });

    it('should calculate statistics correctly for multiple operations', () => {
      // Add multiple operations with different durations
      const operations = [
        { id: 'op1', duration: 100, success: true },
        { id: 'op2', duration: 200, success: true },
        { id: 'op3', duration: 150, success: false },
        { id: 'op4', duration: 50, success: true },
      ];

      operations.forEach(op => {
        performanceMonitor.startTimer(op.id, 'testOperation');
        currentTime += op.duration;
        performanceMonitor.endTimer(op.id, op.success);
      });

      const stats = performanceMonitor.getOperationStats('testOperation');
      expect(stats.totalOperations).toBe(4);
      expect(stats.successfulOperations).toBe(3);
      expect(stats.failedOperations).toBe(1);
      expect(stats.successRate).toBe(75);
      expect(stats.averageDuration).toBe(125); // (100 + 200 + 150 + 50) / 4
      expect(stats.minDuration).toBe(50);
      expect(stats.maxDuration).toBe(200);
    });
  });

  describe('Mock Service Performance', () => {
    it('should complete todo operations within acceptable time limits', async () => {
      const startTime = Date.now();

      // Test fetch operation
      const todos = await mockTodoService.getByUserId('test-user');
      const fetchDuration = Date.now() - startTime;

      expect(fetchDuration).toBeLessThan(1000); // Should complete within 1 second
      expect(Array.isArray(todos)).toBe(true);
    });

    it('should handle todo creation efficiently', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium' as const,
        estimatedMinutes: 30,
      };

      const startTime = Date.now();
      const newTodo = await mockTodoService.create(todoData);
      const createDuration = Date.now() - startTime;

      expect(createDuration).toBeLessThan(1000);
      expect(newTodo).toBeDefined();
      expect(newTodo.title).toBe(todoData.title);
    });

    it('should handle todo updates efficiently', async () => {
      // First create a todo
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'medium' as const,
        estimatedMinutes: 30,
      };

      const newTodo = await mockTodoService.create(todoData);

      // Then update it
      const startTime = Date.now();
      const updatedTodo = await mockTodoService.update(newTodo.id, {
        completed: true,
      });
      const updateDuration = Date.now() - startTime;

      expect(updateDuration).toBeLessThan(1000);
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo?.completed).toBe(true);
    });

    it('should handle multiple rapid operations without blocking', async () => {
      const operations = [];
      const startTime = Date.now();

      // Create multiple simultaneous operations
      for (let i = 0; i < 5; i++) {
        operations.push(
          mockTodoService.create({
            title: `Test Todo ${i}`,
            description: `Description ${i}`,
            priority: 'low' as const,
            estimatedMinutes: 15,
          })
        );
      }

      const results = await Promise.all(operations);
      const totalDuration = Date.now() - startTime;

      // All operations should complete
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.title).toMatch(/Test Todo \d/);
      });

      // Total time should be reasonable (not blocking)
      expect(totalDuration).toBeLessThan(2000);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock a service error
      const originalUpdate = mockTodoService.update;
      mockTodoService.update = vi
        .fn()
        .mockRejectedValue(new Error('Service error'));

      try {
        await mockTodoService.update('invalid-id', { completed: true });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Service error');
      }

      // Restore original function
      mockTodoService.update = originalUpdate;
    });

    it('should track failed operations in performance metrics', () => {
      const operationId = 'failed-operation';

      performanceMonitor.startTimer(operationId, 'failedOperation');
      currentTime = 100;
      performanceMonitor.endTimer(operationId, false, 'Simulated failure');

      const stats = performanceMonitor.getOperationStats('failedOperation');
      expect(stats.totalOperations).toBe(1);
      expect(stats.failedOperations).toBe(1);
      expect(stats.successRate).toBe(0);

      const recentOps = stats.recentOperations;
      expect(recentOps).toHaveLength(1);
      expect(recentOps[0].success).toBe(false);
      expect(recentOps[0].error).toBe('Simulated failure');
    });
  });

  describe('Memory Management', () => {
    it('should limit the number of stored metrics', () => {
      // Add more metrics than the limit (1000)
      for (let i = 0; i < 1200; i++) {
        performanceMonitor.recordOperation(`operation-${i}`, true, 100);
      }

      const overallStats = performanceMonitor.getOverallStats();
      expect(overallStats.totalOperations).toBeLessThanOrEqual(1000);
    });

    it('should clean up timers properly', () => {
      const operationId = 'cleanup-test';

      performanceMonitor.startTimer(operationId, 'cleanupTest');

      // End the timer
      performanceMonitor.endTimer(operationId, true);

      // Trying to end the same timer again should return null
      const result = performanceMonitor.endTimer(operationId, true);
      expect(result).toBeNull();
    });
  });

  describe('Performance Thresholds', () => {
    it('should meet performance requirements for todo operations', () => {
      const requirements = {
        toggleTodo: 500, // 500ms max as per requirements
        fetchTodos: 1000, // 1 second max as per requirements
        createTodo: 1000,
        updateTodo: 1000,
        deleteTodo: 1000,
      };

      // Simulate operations with acceptable durations
      Object.entries(requirements).forEach(([operation, maxDuration]) => {
        const operationId = `${operation}-threshold-test`;
        const actualDuration = maxDuration - 100; // Well within limits

        performanceMonitor.startTimer(operationId, operation);
        currentTime += actualDuration;
        performanceMonitor.endTimer(operationId, true);

        const stats = performanceMonitor.getOperationStats(operation);
        expect(stats.averageDuration).toBeLessThan(maxDuration);
      });
    });

    it('should identify operations that exceed performance thresholds', () => {
      const slowOperationId = 'slow-operation';
      const maxAllowedDuration = 500;
      const actualDuration = 600; // Exceeds threshold

      performanceMonitor.startTimer(slowOperationId, 'toggleTodo');
      currentTime += actualDuration;
      performanceMonitor.endTimer(slowOperationId, true);

      const stats = performanceMonitor.getOperationStats('toggleTodo');
      expect(stats.averageDuration).toBeGreaterThan(maxAllowedDuration);

      // This would trigger an alert in a real monitoring system
      const isSlowOperation = stats.averageDuration > maxAllowedDuration;
      expect(isSlowOperation).toBe(true);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid successive operations without degradation', () => {
      const operationCount = 50;
      const operations = [];

      // Create many rapid operations
      for (let i = 0; i < operationCount; i++) {
        const operationId = `stress-test-${i}`;
        performanceMonitor.startTimer(operationId, 'stressTest');
        currentTime += 10; // 10ms each
        performanceMonitor.endTimer(operationId, true);
      }

      const stats = performanceMonitor.getOperationStats('stressTest');
      expect(stats.totalOperations).toBe(operationCount);
      expect(stats.successRate).toBe(100);
      expect(stats.averageDuration).toBe(10);

      // Performance should remain consistent
      expect(stats.maxDuration).toBe(10);
      expect(stats.minDuration).toBe(10);
    });
  });
});

// Integration test helper
export const runPerformanceValidation = async () => {
  console.log('🧪 Running Performance Validation Tests...');

  const results = {
    passed: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Test 1: Basic operation timing
    console.log('Testing basic operation timing...');
    const operationId = 'validation-test-1';
    const startTime = performance.now();

    performanceMonitor.startTimer(operationId, 'validationTest');

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));

    const duration = performanceMonitor.endTimer(operationId, true);

    if (duration && duration >= 90 && duration <= 150) {
      results.passed++;
      console.log('✅ Basic timing test passed');
    } else {
      results.failed++;
      results.errors.push(
        `Basic timing test failed: expected ~100ms, got ${duration}ms`
      );
    }

    // Test 2: Mock service performance
    console.log('Testing mock service performance...');
    const serviceStartTime = performance.now();
    const todos = await mockTodoService.getByUserId('validation-user');
    const serviceDuration = performance.now() - serviceStartTime;

    if (serviceDuration < 1000 && Array.isArray(todos)) {
      results.passed++;
      console.log('✅ Mock service performance test passed');
    } else {
      results.failed++;
      results.errors.push(
        `Mock service test failed: took ${serviceDuration}ms`
      );
    }

    // Test 3: Error handling
    console.log('Testing error handling...');
    try {
      const errorOperationId = 'error-test';
      performanceMonitor.startTimer(errorOperationId, 'errorTest');
      performanceMonitor.endTimer(errorOperationId, false, 'Test error');

      const errorStats = performanceMonitor.getOperationStats('errorTest');
      if (errorStats.failedOperations === 1 && errorStats.successRate === 0) {
        results.passed++;
        console.log('✅ Error handling test passed');
      } else {
        results.failed++;
        results.errors.push('Error handling test failed');
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error handling test threw: ${error}`);
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`Validation failed with error: ${error}`);
  }

  // Summary
  console.log('\n📊 Performance Validation Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (results.failed === 0) {
    console.log('\n🎉 All performance validation tests passed!');
  } else {
    console.log(
      '\n⚠️ Some performance validation tests failed. Please review the errors above.'
    );
  }

  return results;
};
