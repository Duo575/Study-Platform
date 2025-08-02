import { useEffect, useRef, useState } from 'react';

// Hook for managing focus trap in modals and dialogs
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when trap becomes active
    firstElement?.focus();

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

// Hook for managing keyboard navigation
export function useKeyboardNavigation(
  items: any[],
  onSelect: (index: number) => void,
  isActive: boolean = true,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    homeEndKeys?: boolean;
    typeahead?: boolean;
  } = {}
) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [typeaheadString, setTypeaheadString] = useState('');
  const typeaheadTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    loop = true,
    orientation = 'vertical',
    homeEndKeys = true,
    typeahead = false,
  } = options;

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      switch (e.key) {
        case 'ArrowDown':
          if (isVertical) {
            e.preventDefault();
            setActiveIndex(prev => {
              if (prev === -1) return 0;
              const next = prev + 1;
              return loop
                ? next % items.length
                : Math.min(next, items.length - 1);
            });
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            e.preventDefault();
            setActiveIndex(prev => {
              if (prev === -1) return items.length - 1;
              const next = prev - 1;
              return loop
                ? (next + items.length) % items.length
                : Math.max(next, 0);
            });
          }
          break;
        case 'ArrowRight':
          if (isHorizontal) {
            e.preventDefault();
            setActiveIndex(prev => {
              if (prev === -1) return 0;
              const next = prev + 1;
              return loop
                ? next % items.length
                : Math.min(next, items.length - 1);
            });
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            e.preventDefault();
            setActiveIndex(prev => {
              if (prev === -1) return items.length - 1;
              const next = prev - 1;
              return loop
                ? (next + items.length) % items.length
                : Math.max(next, 0);
            });
          }
          break;
        case 'Home':
          if (homeEndKeys) {
            e.preventDefault();
            setActiveIndex(0);
          }
          break;
        case 'End':
          if (homeEndKeys) {
            e.preventDefault();
            setActiveIndex(items.length - 1);
          }
          break;
        case 'Enter':
        case ' ':
          if (activeIndex >= 0) {
            e.preventDefault();
            onSelect(activeIndex);
          }
          break;
        case 'Escape':
          setActiveIndex(-1);
          break;
        default:
          // Typeahead functionality
          if (
            typeahead &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey
          ) {
            e.preventDefault();

            // Clear previous timeout
            if (typeaheadTimeoutRef.current) {
              clearTimeout(typeaheadTimeoutRef.current);
            }

            const newTypeaheadString = typeaheadString + e.key.toLowerCase();
            setTypeaheadString(newTypeaheadString);

            // Find matching item
            const matchingIndex = items.findIndex((item, index) => {
              const text =
                typeof item === 'string'
                  ? item
                  : item.label || item.name || item.title || '';
              return text.toLowerCase().startsWith(newTypeaheadString);
            });

            if (matchingIndex !== -1) {
              setActiveIndex(matchingIndex);
            }

            // Clear typeahead string after delay
            typeaheadTimeoutRef.current = setTimeout(() => {
              setTypeaheadString('');
            }, 1000);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (typeaheadTimeoutRef.current) {
        clearTimeout(typeaheadTimeoutRef.current);
      }
    };
  }, [
    activeIndex,
    items,
    onSelect,
    isActive,
    loop,
    orientation,
    homeEndKeys,
    typeahead,
    typeaheadString,
  ]);

  return { activeIndex, setActiveIndex };
}

// Hook for managing skip links
export function useSkipLinks() {
  const skipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  };

  const skipToNavigation = () => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView();
    }
  };

  return { skipToContent, skipToNavigation };
}

// Hook for managing reduced motion preferences
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for managing high contrast mode
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('high-contrast') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('high-contrast', isHighContrast.toString());
  }, [isHighContrast]);

  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  return { isHighContrast, toggleHighContrast };
}

// Hook for managing font size
export function useFontSize() {
  const [fontSize, setFontSize] = useState(() => {
    const stored = localStorage.getItem('font-size');
    return stored || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'font-small',
      'font-normal',
      'font-large',
      'font-extra-large'
    );
    root.classList.add(`font-${fontSize}`);
    localStorage.setItem('font-size', fontSize);
  }, [fontSize]);

  const increaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const resetFontSize = () => setFontSize('normal');

  return { fontSize, increaseFontSize, decreaseFontSize, resetFontSize };
}

// Hook for managing ARIA live regions
export function useLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);
      (liveRegionRef as any).current = liveRegion;
    }

    return () => {
      if (
        liveRegionRef.current &&
        document.body.contains(liveRegionRef.current)
      ) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return { announce };
}

// Hook for managing roving tabindex
export function useRovingTabIndex(items: HTMLElement[], activeIndex: number) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.setAttribute('tabindex', index === activeIndex ? '0' : '-1');
        if (index === activeIndex) {
          item.focus();
        }
      }
    });
  }, [items, activeIndex]);
}

// Hook for managing focus restoration
export function useFocusRestore() {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousActiveElementRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (
      previousActiveElementRef.current &&
      typeof previousActiveElementRef.current.focus === 'function'
    ) {
      previousActiveElementRef.current.focus();
    }
  };

  return { saveFocus, restoreFocus };
}

// Hook for managing accessible descriptions
export function useAccessibleDescription(description: string) {
  const descriptionId = useRef(
    `description-${Math.random().toString(36).substr(2, 9)}`
  );
  const [descriptionElement, setDescriptionElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.createElement('div');
    element.id = descriptionId.current;
    element.className = 'sr-only';
    element.textContent = description;
    document.body.appendChild(element);
    setDescriptionElement(element);

    return () => {
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    };
  }, [description]);

  return descriptionId.current;
}

// Hook for managing keyboard shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  isActive: boolean = true
) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.metaKey && 'meta',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isActive]);
}

// Hook for managing accessible form validation
export function useAccessibleValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorRefs = useRef<Record<string, HTMLElement>>({});

  const setError = (fieldName: string, message: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));

    // Focus the field with error
    setTimeout(() => {
      const field = document.querySelector(
        `[name="${fieldName}"]`
      ) as HTMLElement;
      if (field) {
        field.focus();
      }
    }, 100);
  };

  const clearError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const getErrorProps = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    const errorId = `${fieldName}-error`;

    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? errorId : undefined,
      errorId,
      errorMessage: errors[fieldName],
    };
  };

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    getErrorProps,
  };
}
