/**
 * Performance monitoring service for the Gamified Study Platform
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

interface WebVitalsMetric {
  name: 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled =
      import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals
    this.initWebVitals();

    // Monitor custom metrics
    this.initCustomMetrics();

    // Monitor resource loading
    this.initResourceMonitoring();

    // Monitor user interactions
    this.initInteractionMonitoring();
  }

  private initWebVitals() {
    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(this.onWebVital.bind(this));
        onINP(this.onWebVital.bind(this));
        onFCP(this.onWebVital.bind(this));
        onLCP(this.onWebVital.bind(this));
        onTTFB(this.onWebVital.bind(this));
      })
      .catch(() => {
        console.warn('Web Vitals library not available');
      });
  }

  private onWebVital(metric: WebVitalsMetric) {
    this.recordMetric({
      name: `web-vital-${metric.name.toLowerCase()}`,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.href,
    });

    // Send to analytics if enabled
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      this.sendToAnalytics('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
      });
    }
  }

  private initCustomMetrics() {
    // Monitor app initialization time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric({
        name: 'app-load-time',
        value: loadTime,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    // Monitor route changes
    let routeStartTime = performance.now();

    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      const routeTime = performance.now() - routeStartTime;
      performanceMonitor.recordMetric({
        name: 'route-change-time',
        value: routeTime,
        timestamp: Date.now(),
        url: window.location.href,
      });

      routeStartTime = performance.now();
      return originalPushState.apply(this, args);
    };
  }

  private initResourceMonitoring() {
    // Monitor resource loading performance
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Track slow resources
          if (resourceEntry.duration > 1000) {
            // > 1 second
            this.recordMetric({
              name: 'slow-resource',
              value: resourceEntry.duration,
              timestamp: Date.now(),
              url: resourceEntry.name,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  private initInteractionMonitoring() {
    // Monitor user interactions
    const interactionTypes = ['click', 'keydown', 'scroll'];

    interactionTypes.forEach(type => {
      document.addEventListener(
        type,
        () => {
          this.recordMetric({
            name: `user-interaction-${type}`,
            value: 1,
            timestamp: Date.now(),
            url: window.location.href,
          });
        },
        { passive: true }
      );
    });
  }

  public recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      'app-load-time': 3000, // 3 seconds
      'route-change-time': 1000, // 1 second
      'web-vital-lcp': 2500, // 2.5 seconds
      'web-vital-fid': 100, // 100ms
      'web-vital-cls': 0.1, // 0.1
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];

    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}:`, {
        value: metric.value,
        threshold,
        url: metric.url,
      });

      // Send alert to monitoring service
      this.sendPerformanceAlert(metric, threshold);
    }
  }

  private sendPerformanceAlert(metric: PerformanceMetric, threshold: number) {
    // Send to error tracking service if enabled
    if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      // This would integrate with Sentry or similar service
      console.error('Performance Alert:', {
        metric: metric.name,
        value: metric.value,
        threshold,
        url: metric.url,
      });
    }
  }

  private sendToAnalytics(eventName: string, parameters: Record<string, any>) {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, parameters);
    }

    // Send to other analytics services
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(eventName, parameters);
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsSummary() {
    const summary: Record<
      string,
      { count: number; average: number; max: number }
    > = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, average: 0, max: 0 };
      }

      summary[metric.name].count++;
      summary[metric.name].max = Math.max(
        summary[metric.name].max,
        metric.value
      );
    });

    // Calculate averages
    Object.keys(summary).forEach(name => {
      const total = this.metrics
        .filter(m => m.name === name)
        .reduce((sum, m) => sum + m.value, 0);
      summary[name].average = total / summary[name].count;
    });

    return summary;
  }

  public exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getMetrics(),
      summary: this.getMetricsSummary(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  // Gamification-specific performance tracking
  public trackGameAction(action: string, duration?: number) {
    this.recordMetric({
      name: `game-action-${action}`,
      value: duration || 1,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }

  public trackPetInteraction(interactionType: string, responseTime: number) {
    this.recordMetric({
      name: `pet-interaction-${interactionType}`,
      value: responseTime,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }

  public trackQuestCompletion(questType: string, completionTime: number) {
    this.recordMetric({
      name: `quest-completion-${questType}`,
      value: completionTime,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;
