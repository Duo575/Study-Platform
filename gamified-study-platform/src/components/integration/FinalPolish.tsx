import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useFeedback } from '../feedback/FeedbackSystem';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Final Polish Component - Adds consistent animations and micro-interactions
 * This component handles page transitions, loading states, and visual enhancements
 */
export const FinalPolish: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addMessage } = useFeedback();
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Page transition handler
  useEffect(() => {
    setIsPageTransitioning(true);
    const timer = setTimeout(() => setIsPageTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Performance monitoring and user experience enhancements
  useEffect(() => {
    // Monitor page load performance
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;

          // If page takes too long to load, show helpful message
          if (loadTime > 3000) {
            addMessage({
              type: 'info',
              title: 'Optimizing Performance',
              message: "We're working to make the app faster for you.",
              duration: 4000,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    return () => observer.disconnect();
  }, [addMessage]);

  return (
    <>
      {/* Page transition overlay */}
      <AnimatePresence>
        {isPageTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-blue-500 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* Global CSS enhancements */}
      <style jsx global>{`
        /* Enhanced focus indicators */
        *:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Smooth transitions for all interactive elements */
        button,
        a,
        input,
        textarea,
        select {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced button hover states */
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        /* Card hover enhancements */
        .card-interactive {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-interactive:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        /* Loading skeleton improvements */
        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Dark mode skeleton */
        .dark .skeleton {
          background: linear-gradient(
            90deg,
            #374151 25%,
            #4b5563 50%,
            #374151 75%
          );
          background-size: 200% 100%;
        }

        /* Enhanced scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background 0.2s;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dark ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Selection styling */
        ::selection {
          background: #3b82f6;
          color: white;
        }

        /* Enhanced form styling */
        input:focus,
        textarea:focus,
        select:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          border-color: #3b82f6;
        }

        /* Improved disabled state */
        button:disabled,
        input:disabled,
        textarea:disabled,
        select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Enhanced link styling */
        a:not(.no-underline) {
          text-decoration-color: transparent;
          transition: text-decoration-color 0.2s;
        }

        a:not(.no-underline):hover {
          text-decoration-color: currentColor;
        }

        /* Improved table styling */
        table {
          border-collapse: separate;
          border-spacing: 0;
        }

        table th,
        table td {
          border-bottom: 1px solid #e2e8f0;
          transition: background-color 0.2s;
        }

        table tr:hover td {
          background-color: #f8fafc;
        }

        .dark table th,
        .dark table td {
          border-bottom-color: #374151;
        }

        .dark table tr:hover td {
          background-color: #1f2937;
        }

        /* Enhanced modal backdrop */
        .modal-backdrop {
          backdrop-filter: blur(8px);
          background: rgba(0, 0, 0, 0.5);
        }

        /* Improved tooltip styling */
        .tooltip {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(8px);
        }

        /* Enhanced progress indicators */
        .progress-bar {
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          position: relative;
          overflow: hidden;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: progress-shine 2s infinite;
        }

        @keyframes progress-shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Enhanced notification styling */
        .notification-enter {
          transform: translateX(100%);
          opacity: 0;
        }

        .notification-enter-active {
          transform: translateX(0);
          opacity: 1;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .notification-exit {
          transform: translateX(0);
          opacity: 1;
        }

        .notification-exit-active {
          transform: translateX(100%);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Improved accessibility */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          button,
          input,
          textarea,
          select {
            border: 2px solid currentColor;
          }
        }

        /* Print styles */
        @media print {
          .no-print {
            display: none !important;
          }

          * {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Performance Monitor Component
 * Monitors app performance and provides user feedback
 */
export const PerformanceMonitor: React.FC = () => {
  const { addMessage } = useFeedback();
  const [performanceData, setPerformanceData] = useState<{
    memory?: number;
    timing?: number;
  }>({});

  useEffect(() => {
    // Monitor memory usage (if available)
    const checkPerformance = () => {
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        const usedMemory = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB

        setPerformanceData(prev => ({ ...prev, memory: usedMemory }));

        // Warn if memory usage is high
        if (usedMemory > 100) {
          addMessage({
            type: 'warning',
            title: 'High Memory Usage',
            message: 'Consider refreshing the page to improve performance.',
            action: {
              label: 'Refresh',
              onClick: () => window.location.reload(),
            },
            duration: 8000,
          });
        }
      }
    };

    // Check performance every 30 seconds
    const interval = setInterval(checkPerformance, 30000);
    checkPerformance(); // Initial check

    return () => clearInterval(interval);
  }, [addMessage]);

  // Monitor long tasks
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 50) {
            // Long task threshold
            console.warn('Long task detected:', entry.duration + 'ms');

            // Show warning for very long tasks
            if (entry.duration > 200) {
              addMessage({
                type: 'info',
                title: 'Performance Notice',
                message: 'The app is working hard to process your request.',
                duration: 3000,
              });
            }
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }

      return () => observer.disconnect();
    }
  }, [addMessage]);

  return null; // This component doesn't render anything
};

/**
 * User Experience Enhancements
 * Adds subtle UX improvements throughout the app
 */
export const UXEnhancements: React.FC = () => {
  const { user } = useAuth();
  const { addMessage } = useFeedback();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search/help
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        addMessage({
          type: 'info',
          title: 'Quick Actions',
          message: 'Use the help button in the header for assistance.',
          duration: 3000,
        });
      }

      // Escape to close modals/overlays
      if (event.key === 'Escape') {
        // This will be handled by individual components
        console.log('Escape key pressed');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addMessage]);

  // Idle detection
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let isIdle = false;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isIdle) {
        isIdle = false;
        addMessage({
          type: 'info',
          title: 'Welcome Back!',
          message: 'Ready to continue your study session?',
          duration: 3000,
        });
      }

      idleTimer = setTimeout(
        () => {
          isIdle = true;
          addMessage({
            type: 'info',
            title: 'Take a Break?',
            message:
              "You've been idle for a while. Remember to take regular breaks!",
            duration: 5000,
          });
        },
        15 * 60 * 1000
      ); // 15 minutes
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer(); // Initialize timer

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [addMessage]);

  // Tab visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        console.log('Tab hidden');
      } else {
        // User returned to tab
        if (user) {
          addMessage({
            type: 'success',
            title: 'Welcome Back!',
            message: 'Your study session is ready to continue.',
            duration: 2000,
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, addMessage]);

  return null; // This component doesn't render anything
};

/**
 * Accessibility Enhancements
 * Additional accessibility improvements beyond the main AccessibilityProvider
 */
export const AccessibilityEnhancements: React.FC = () => {
  useEffect(() => {
    // Announce page changes to screen readers
    const announcePageChange = () => {
      const pageTitle = document.title;
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Navigated to ${pageTitle}`;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Listen for route changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' &&
          mutation.target === document.head
        ) {
          const titleElement = document.querySelector('title');
          if (titleElement) {
            announcePageChange();
          }
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Skip link functionality
  useEffect(() => {
    const skipLinks = document.querySelectorAll('a[href^="#"]');

    skipLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            (target as HTMLElement).focus();
          }
        }
      });
    });
  }, []);

  return null; // This component doesn't render anything
};
