import { useState, useEffect } from 'react';

// Breakpoint values matching Tailwind CSS defaults
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Listen for window resize
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return currentBreakpoint;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) {
  const breakpoint = useBreakpoint();

  // Return the most specific value for current breakpoint
  if (breakpoint === '2xl' && values['2xl'] !== undefined) return values['2xl'];
  if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (breakpoint === 'md' && values.md !== undefined) return values.md;
  if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;

  return values.base;
}

// Hook for orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
}

// Hook for touch device detection
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouchDevice;
}
// Hook for container queries (when supported)
export function useContainerQuery(containerRef: React.RefObject<HTMLElement>) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);

  return containerSize;
}

// Hook for responsive font sizes
export function useResponsiveFontSize(baseSize: number = 16) {
  const breakpoint = useBreakpoint();

  const fontSizes = {
    sm: baseSize * 0.875, // 14px if base is 16px
    md: baseSize, // 16px
    lg: baseSize * 1.125, // 18px
    xl: baseSize * 1.25, // 20px
    '2xl': baseSize * 1.375, // 22px
  };

  return fontSizes[breakpoint];
}

// Hook for responsive spacing
export function useResponsiveSpacing(baseSpacing: number = 16) {
  const breakpoint = useBreakpoint();

  const spacings = {
    sm: baseSpacing * 0.75, // 12px if base is 16px
    md: baseSpacing, // 16px
    lg: baseSpacing * 1.25, // 20px
    xl: baseSpacing * 1.5, // 24px
    '2xl': baseSpacing * 2, // 32px
  };

  return spacings[breakpoint];
}

// Hook for device pixel ratio
export function useDevicePixelRatio() {
  const [pixelRatio, setPixelRatio] = useState(
    typeof window !== 'undefined' ? window.devicePixelRatio : 1
  );

  useEffect(() => {
    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio);
    };

    // Listen for changes in pixel ratio (e.g., when moving between displays)
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    mediaQuery.addEventListener('change', updatePixelRatio);

    return () => mediaQuery.removeEventListener('change', updatePixelRatio);
  }, []);

  return pixelRatio;
}

// Hook for network information (when supported)
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  });

  useEffect(() => {
    // @ts-ignore - navigator.connection is not in TypeScript types yet
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
}

// Hook for responsive grid columns
export function useResponsiveColumns(options: {
  minColumnWidth?: number;
  maxColumns?: number;
  gap?: number;
}) {
  const { width } = useScreenSize();
  const { minColumnWidth = 250, maxColumns = 6, gap = 16 } = options;

  const columns = Math.min(
    Math.floor((width + gap) / (minColumnWidth + gap)),
    maxColumns
  );

  return Math.max(1, columns);
}

// Hook for responsive breakpoint matching
export function useBreakpointMatch(query: string) {
  const breakpoint = useBreakpoint();

  // Parse query like "md+" or "lg-" or "md-lg"
  if (query.includes('+')) {
    const minBreakpoint = query.replace('+', '');
    const breakpointOrder = ['sm', 'md', 'lg', 'xl', '2xl'];
    const minIndex = breakpointOrder.indexOf(minBreakpoint);
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= minIndex;
  }

  if (query.includes('-') && !query.endsWith('-')) {
    const [min, max] = query.split('-');
    const breakpointOrder = ['sm', 'md', 'lg', 'xl', '2xl'];
    const minIndex = breakpointOrder.indexOf(min);
    const maxIndex = breakpointOrder.indexOf(max);
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  }

  if (query.endsWith('-')) {
    const maxBreakpoint = query.replace('-', '');
    const breakpointOrder = ['sm', 'md', 'lg', 'xl', '2xl'];
    const maxIndex = breakpointOrder.indexOf(maxBreakpoint);
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= maxIndex;
  }

  return breakpoint === query;
}

// Hook for responsive aspect ratio
export function useResponsiveAspectRatio() {
  const { width, height } = useScreenSize();
  const aspectRatio = width / height;

  // Common aspect ratios
  if (aspectRatio > 2.1) return 'ultrawide'; // 21:9 or wider
  if (aspectRatio > 1.7) return 'wide'; // 16:9, 16:10
  if (aspectRatio > 1.4) return 'standard'; // 3:2, 4:3
  if (aspectRatio > 0.9) return 'square'; // roughly square
  return 'portrait'; // taller than wide
}
