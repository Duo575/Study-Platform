# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Gamified Study Platform and provides guidance for maintaining optimal performance in production.

## 🚀 Performance Features Implemented

### 1. Code Splitting & Lazy Loading

- **Route-based code splitting**: All pages are lazy-loaded using `React.lazy()`
- **Component-level splitting**: Large components are dynamically imported
- **Vendor chunk optimization**: Dependencies are split into logical chunks
- **Manual chunking strategy**: Custom chunk splitting for optimal loading

```typescript
// Example: Lazy loading pages
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then(module => ({
    default: module.DashboardPage,
  }))
);
```

### 2. Bundle Optimization

- **Vite configuration**: Optimized build settings with Terser minification
- **Tree shaking**: Unused code elimination
- **Asset optimization**: Images, fonts, and static assets are optimized
- **Chunk size warnings**: Configured to warn about large chunks (>1MB)

### 3. Image Optimization

- **WebP/AVIF support**: Automatic format detection and serving
- **Lazy loading**: Images load only when entering viewport
- **Responsive images**: Multiple sizes generated for different screen sizes
- **Compression**: Client-side image compression utilities

```typescript
// Example: Optimized image component
<OptimizedImage
  src="/images/hero.jpg"
  alt="Study platform hero"
  width={800}
  height={400}
  lazy={true}
  quality={75}
/>
```

### 4. Caching Strategy

- **Service Worker**: Advanced caching with multiple strategies
- **Static assets**: Long-term caching with immutable headers
- **API responses**: Network-first with cache fallback
- **Offline support**: Cached content available offline

### 5. Performance Monitoring

- **Core Web Vitals**: FCP, LCP, FID, CLS, TTFB tracking
- **Real-time monitoring**: Performance dashboard for development
- **Error tracking**: Comprehensive error logging and reporting
- **Memory monitoring**: JavaScript heap size tracking

### 6. Production Optimizations

- **Security headers**: CSP, HSTS, and other security headers
- **Compression**: Gzip/Brotli compression enabled
- **CDN ready**: Optimized for CDN deployment
- **PWA features**: Service worker, manifest, offline support

## 📊 Performance Metrics & Budgets

### Performance Budget Thresholds

| Metric                         | Good    | Needs Improvement | Poor    |
| ------------------------------ | ------- | ----------------- | ------- |
| First Contentful Paint (FCP)   | < 1.8s  | 1.8s - 3.0s       | > 3.0s  |
| Largest Contentful Paint (LCP) | < 2.5s  | 2.5s - 4.0s       | > 4.0s  |
| First Input Delay (FID)        | < 100ms | 100ms - 300ms     | > 300ms |
| Cumulative Layout Shift (CLS)  | < 0.1   | 0.1 - 0.25        | > 0.25  |
| Time to First Byte (TTFB)      | < 800ms | 800ms - 1.8s      | > 1.8s  |

### Bundle Size Targets

- **Initial JavaScript**: < 200KB (gzipped)
- **Total JavaScript**: < 500KB (gzipped)
- **CSS**: < 50KB (gzipped)
- **Images**: WebP/AVIF format, < 100KB per image

## 🛠️ Development Tools

### Performance Dashboard

Access the performance dashboard in development:

- Press `Ctrl/Cmd + Shift + P` to toggle
- Or set `localStorage.setItem('show-performance-dashboard', 'true')`

Features:

- Real-time Core Web Vitals
- Memory usage monitoring
- Bundle size analysis
- Error tracking stats
- Performance budget status

### Build Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Generate performance report
npm run build

# Run Lighthouse audit
npm run perf:lighthouse
```

### Performance Testing

```typescript
import { performanceTester } from './utils/performanceTesting';

// Run performance tests
const results = await performanceTester.runRegressionTests();

// Test component performance
await testComponentPerformance('MyComponent', renderFunction, 100);

// Test API performance
await testApiPerformance('/api/courses', fetchCourses, 10);
```

## 🚀 Deployment Optimizations

### Vercel Deployment

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "headers": [
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify Deployment

```toml
[build]
  publish = "dist"
  command = "npm run build:prod"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 📈 Monitoring & Analytics

### Performance Monitoring Setup

```typescript
// Initialize performance monitoring
import { initializePerformanceMonitoring } from './utils/performanceMonitoring';
import { initializeErrorTracking } from './utils/errorTracking';

initializePerformanceMonitoring();
initializeErrorTracking();
```

### Custom Performance Hooks

```typescript
// Monitor route performance
useRoutePerformance();

// Track API calls
const { withApiTracking } = useApiPerformance();

// Optimize event handlers
const { createDebouncedHandler } = useOptimizedHandlers();

// Monitor memory usage
useMemoryMonitoring(30000); // Every 30 seconds
```

## 🔧 Optimization Techniques

### 1. Component Optimization

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Optimize re-renders with useMemo and useCallback
const optimizedValue = useMemo(() => expensiveCalculation(data), [data]);
const optimizedCallback = useCallback(() => handleClick(), [dependency]);
```

### 2. State Management Optimization

```typescript
// Use Zustand for efficient state management
const useStore = create(set => ({
  data: [],
  updateData: newData => set({ data: newData }),
}));

// Selective subscriptions to prevent unnecessary re-renders
const data = useStore(state => state.data);
```

### 3. Network Optimization

```typescript
// Use React Query for efficient data fetching
const { data, isLoading } = useQuery(['courses'], fetchCourses, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Implement request deduplication
const debouncedSearch = debounce(searchFunction, 300);
```

### 4. Rendering Optimization

```typescript
// Virtual scrolling for large lists
const { visibleItems, handleScroll } = useVirtualScrolling(
  items,
  itemHeight,
  containerHeight
);

// Intersection Observer for lazy loading
const { observe, unobserve } = useIntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadContent(entry.target);
    }
  });
});
```

## 🚨 Performance Troubleshooting

### Common Issues & Solutions

1. **Large Bundle Size**
   - Check bundle analyzer output
   - Implement code splitting
   - Remove unused dependencies
   - Use dynamic imports

2. **Slow Initial Load**
   - Optimize critical rendering path
   - Preload critical resources
   - Implement resource hints
   - Reduce server response time

3. **Poor Runtime Performance**
   - Profile component renders
   - Optimize state updates
   - Use performance profiler
   - Implement virtualization

4. **Memory Leaks**
   - Clean up event listeners
   - Cancel pending requests
   - Clear timers and intervals
   - Monitor memory usage

### Performance Debugging

```typescript
// Enable performance profiling
if (process.env.NODE_ENV === 'development') {
  // React DevTools Profiler
  import('./utils/performanceProfiler').then(({ startProfiling }) => {
    startProfiling();
  });
}

// Log performance metrics
console.log('Performance Metrics:', performanceMonitor.getMetrics());

// Check performance budget
const budgetCheck = checkPerformanceBudget();
if (!budgetCheck.passed) {
  console.warn('Performance budget violations:', budgetCheck.violations);
}
```

## 📚 Best Practices

### Development

1. **Use the performance dashboard** during development
2. **Run performance tests** before deploying
3. **Monitor bundle size** with each build
4. **Profile components** that feel slow
5. **Test on slower devices** and networks

### Production

1. **Monitor Core Web Vitals** continuously
2. **Set up performance alerts** for regressions
3. **Regular performance audits** with Lighthouse
4. **A/B test** performance optimizations
5. **Keep dependencies updated** for security and performance

### Code Review Checklist

- [ ] Are new components optimized for re-renders?
- [ ] Are large dependencies code-split?
- [ ] Are images optimized and lazy-loaded?
- [ ] Are API calls properly cached?
- [ ] Are event handlers debounced/throttled?
- [ ] Is the bundle size within budget?
- [ ] Are performance metrics tracked?

## 🔗 Useful Resources

- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Bundle Analysis](https://bundlephobia.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

## 📞 Support

For performance-related issues or questions:

1. Check the performance dashboard
2. Review the bundle analyzer output
3. Run performance tests
4. Check browser DevTools Performance tab
5. Consult this documentation

Remember: Performance is a feature, not an afterthought! 🚀
