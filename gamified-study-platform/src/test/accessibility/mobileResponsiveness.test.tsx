import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock viewport dimensions
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock touch events
const mockTouchEvent = (
  type: string,
  touches: Array<{ clientX: number; clientY: number }>
) => {
  return new TouchEvent(type, {
    touches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: document.body,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
    })) as any,
    bubbles: true,
    cancelable: true,
  });
};

// Responsive component mocks
const ResponsiveEnvironmentSelector = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`environment-selector ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? (
        // Mobile: Bottom sheet style
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-4 text-left"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            Current Environment
          </button>
          {isOpen && (
            <div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-4"
              role="listbox"
              aria-label="Environment options"
            >
              <div className="w-12 h-1 bg-gray-300 rounded mx-auto mb-4" />
              <button
                role="option"
                className="w-full p-3 text-left border-b"
                onClick={() => setIsOpen(false)}
              >
                Forest Environment
              </button>
              <button
                role="option"
                className="w-full p-3 text-left"
                onClick={() => setIsOpen(false)}
              >
                Beach Environment
              </button>
            </div>
          )}
        </div>
      ) : (
        // Desktop: Dropdown style
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 border rounded"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            Current Environment
          </button>
          {isOpen && (
            <div
              className="absolute top-full left-0 bg-white border rounded shadow-lg"
              role="listbox"
              aria-label="Environment options"
            >
              <button
                role="option"
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Forest Environment
              </button>
              <button
                role="option"
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Beach Environment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ResponsivePetDisplay = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`pet-display ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className={isMobile ? 'flex flex-col space-y-2' : 'flex space-x-4'}>
        <div className="pet-image">
          <img
            src="/pet.png"
            alt="Pet"
            className={isMobile ? 'w-16 h-16' : 'w-24 h-24'}
          />
        </div>

        <div className="pet-info flex-1">
          <h3 className={isMobile ? 'text-lg' : 'text-xl'}>Pet Name</h3>
          <div className="status-bars space-y-1">
            <div className="health-bar">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>80/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: '80%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`pet-actions ${isMobile ? 'flex space-x-2' : 'flex flex-col space-y-2'}`}
        >
          <button
            className={`px-3 py-2 bg-blue-500 text-white rounded ${isMobile ? 'text-sm' : ''}`}
            style={{ minHeight: '44px' }} // Touch target size
          >
            Feed
          </button>
          <button
            className={`px-3 py-2 bg-green-500 text-white rounded ${isMobile ? 'text-sm' : ''}`}
            style={{ minHeight: '44px' }} // Touch target size
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

const ResponsiveMiniGameGrid = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const games = [
    { id: 1, name: 'Memory Game', icon: '🧠' },
    { id: 2, name: 'Puzzle Game', icon: '🧩' },
    { id: 3, name: 'Reaction Game', icon: '⚡' },
    { id: 4, name: 'Breathing Exercise', icon: '🫁' },
  ];

  return (
    <div className={`games-grid ${isMobile ? 'mobile' : 'desktop'}`}>
      <div
        className={
          isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'
        }
      >
        {games.map(game => (
          <button
            key={game.id}
            className={`
              game-card p-4 bg-white rounded-lg shadow text-center
              ${isMobile ? 'min-h-[100px]' : 'min-h-[120px]'}
            `}
            style={{ minHeight: isMobile ? '100px' : '120px' }}
          >
            <div className={`text-${isMobile ? '2xl' : '3xl'} mb-2`}>
              {game.icon}
            </div>
            <div className={`text-${isMobile ? 'sm' : 'base'} font-medium`}>
              {game.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TouchInteractionComponent = () => {
  const [touchStart, setTouchStart] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [swipeDirection, setSwipeDirection] = React.useState<string>('');

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        setSwipeDirection(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="touch-area w-full h-32 bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label="Swipe area for navigation"
    >
      {swipeDirection ? (
        <span>Swiped {swipeDirection}</span>
      ) : (
        <span>Swipe in any direction</span>
      )}
    </div>
  );
};

describe('Mobile Responsiveness and Touch Interaction Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Reset viewport to desktop size
    mockViewport(1024, 768);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Responsive Layout Tests', () => {
    it('should adapt environment selector for mobile', async () => {
      // Start with desktop
      mockViewport(1024, 768);
      const { rerender } = render(<ResponsiveEnvironmentSelector />);

      let selector = screen.getByRole('button', {
        name: 'Current Environment',
      });
      expect(selector).not.toHaveClass('w-full');

      // Switch to mobile
      mockViewport(375, 667);
      rerender(<ResponsiveEnvironmentSelector />);

      await waitFor(() => {
        selector = screen.getByRole('button', { name: 'Current Environment' });
        expect(selector).toHaveClass('w-full');
      });
    });

    it('should show mobile-specific UI elements', async () => {
      mockViewport(375, 667);
      render(<ResponsiveEnvironmentSelector />);

      const button = screen.getByRole('button', {
        name: 'Current Environment',
      });
      await user.click(button);

      // Mobile should show bottom sheet with drag handle
      const dragHandle = document.querySelector('.w-12.h-1.bg-gray-300');
      expect(dragHandle).toBeInTheDocument();
    });

    it('should adapt pet display layout for mobile', async () => {
      // Desktop layout
      mockViewport(1024, 768);
      const { rerender } = render(<ResponsivePetDisplay />);

      let petDisplay = document.querySelector('.pet-display');
      expect(petDisplay).toHaveClass('desktop');

      // Mobile layout
      mockViewport(375, 667);
      rerender(<ResponsivePetDisplay />);

      await waitFor(() => {
        petDisplay = document.querySelector('.pet-display');
        expect(petDisplay).toHaveClass('mobile');
      });
    });

    it('should adjust grid layout for different screen sizes', async () => {
      // Desktop: 4 columns
      mockViewport(1024, 768);
      const { rerender } = render(<ResponsiveMiniGameGrid />);

      let grid = document.querySelector('.games-grid > div');
      expect(grid).toHaveClass('grid-cols-4');

      // Mobile: 2 columns
      mockViewport(375, 667);
      rerender(<ResponsiveMiniGameGrid />);

      await waitFor(() => {
        grid = document.querySelector('.games-grid > div');
        expect(grid).toHaveClass('grid-cols-2');
      });
    });
  });

  describe('Touch Target Size Tests', () => {
    it('should have minimum touch target size of 44px', () => {
      mockViewport(375, 667);
      render(<ResponsivePetDisplay />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('should have adequate spacing between touch targets', () => {
      mockViewport(375, 667);
      render(<ResponsiveMiniGameGrid />);

      const gameCards = document.querySelectorAll('.game-card');
      expect(gameCards.length).toBeGreaterThan(0);

      // Check that cards have minimum size for touch
      gameCards.forEach(card => {
        const styles = window.getComputedStyle(card);
        const minHeight = parseInt(styles.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(100);
      });
    });
  });

  describe('Touch Interaction Tests', () => {
    it('should handle touch events properly', async () => {
      render(<TouchInteractionComponent />);

      const touchArea = screen.getByRole('button', {
        name: 'Swipe area for navigation',
      });

      // Simulate swipe right
      const touchStart = mockTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
      ]);
      const touchMove = mockTouchEvent('touchmove', [
        { clientX: 200, clientY: 100 },
      ]);
      const touchEnd = mockTouchEvent('touchend', []);

      fireEvent(touchArea, touchStart);
      fireEvent(touchArea, touchMove);
      fireEvent(touchArea, touchEnd);

      await waitFor(() => {
        expect(screen.getByText('Swiped right')).toBeInTheDocument();
      });
    });

    it('should handle vertical swipes', async () => {
      render(<TouchInteractionComponent />);

      const touchArea = screen.getByRole('button', {
        name: 'Swipe area for navigation',
      });

      // Simulate swipe up
      const touchStart = mockTouchEvent('touchstart', [
        { clientX: 100, clientY: 200 },
      ]);
      const touchMove = mockTouchEvent('touchmove', [
        { clientX: 100, clientY: 100 },
      ]);
      const touchEnd = mockTouchEvent('touchend', []);

      fireEvent(touchArea, touchStart);
      fireEvent(touchArea, touchMove);
      fireEvent(touchArea, touchEnd);

      await waitFor(() => {
        expect(screen.getByText('Swiped up')).toBeInTheDocument();
      });
    });

    it('should ignore short swipes', async () => {
      render(<TouchInteractionComponent />);

      const touchArea = screen.getByRole('button', {
        name: 'Swipe area for navigation',
      });

      // Simulate short swipe (less than minimum distance)
      const touchStart = mockTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
      ]);
      const touchMove = mockTouchEvent('touchmove', [
        { clientX: 120, clientY: 100 },
      ]);
      const touchEnd = mockTouchEvent('touchend', []);

      fireEvent(touchArea, touchStart);
      fireEvent(touchArea, touchMove);
      fireEvent(touchArea, touchEnd);

      // Should not register as a swipe
      expect(screen.getByText('Swipe in any direction')).toBeInTheDocument();
    });
  });

  describe('Viewport Orientation Tests', () => {
    it('should handle orientation changes', async () => {
      // Portrait
      mockViewport(375, 667);
      const { rerender } = render(<ResponsivePetDisplay />);

      let petDisplay = document.querySelector('.pet-display');
      expect(petDisplay).toHaveClass('mobile');

      // Landscape (mobile)
      mockViewport(667, 375);
      rerender(<ResponsivePetDisplay />);

      // Should still be considered mobile due to smaller dimension
      await waitFor(() => {
        petDisplay = document.querySelector('.pet-display');
        expect(petDisplay).toHaveClass('mobile');
      });

      // Landscape (tablet)
      mockViewport(1024, 768);
      rerender(<ResponsivePetDisplay />);

      await waitFor(() => {
        petDisplay = document.querySelector('.pet-display');
        expect(petDisplay).toHaveClass('desktop');
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain accessibility on mobile devices', async () => {
      mockViewport(375, 667);
      render(<ResponsiveEnvironmentSelector />);

      const button = screen.getByRole('button', {
        name: 'Current Environment',
      });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');

      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');

      const listbox = screen.getByRole('listbox', {
        name: 'Environment options',
      });
      expect(listbox).toBeInTheDocument();
    });

    it('should support keyboard navigation on mobile', async () => {
      mockViewport(375, 667);
      render(<ResponsivePetDisplay />);

      // Tab through interactive elements
      await user.tab();
      const feedButton = screen.getByRole('button', { name: 'Feed' });
      expect(feedButton).toHaveFocus();

      await user.tab();
      const playButton = screen.getByRole('button', { name: 'Play' });
      expect(playButton).toHaveFocus();
    });

    it('should have proper focus indicators on touch devices', () => {
      mockViewport(375, 667);
      render(<ResponsiveMiniGameGrid />);

      const gameButtons = screen.getAllByRole('button');
      gameButtons.forEach(button => {
        // Focus the button
        button.focus();
        expect(button).toHaveFocus();

        // Should be focusable via keyboard (buttons are focusable by default)
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Performance on Mobile', () => {
    it('should render efficiently on mobile devices', async () => {
      const startTime = performance.now();

      mockViewport(375, 667);
      render(<ResponsiveMiniGameGrid />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly even on mobile
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle rapid viewport changes', async () => {
      const { rerender } = render(<ResponsiveEnvironmentSelector />);

      // Rapidly change viewport sizes
      const viewports = [
        [375, 667], // Mobile portrait
        [667, 375], // Mobile landscape
        [768, 1024], // Tablet portrait
        [1024, 768], // Tablet landscape
        [1920, 1080], // Desktop
      ];

      for (const [width, height] of viewports) {
        mockViewport(width, height);
        rerender(<ResponsiveEnvironmentSelector />);

        // Component should still be functional
        const button = screen.getByRole('button', {
          name: 'Current Environment',
        });
        expect(button).toBeInTheDocument();
      }
    });
  });

  describe('Mobile-Specific Features', () => {
    it('should show mobile-optimized navigation', async () => {
      mockViewport(375, 667);
      render(<ResponsiveEnvironmentSelector />);

      const button = screen.getByRole('button', {
        name: 'Current Environment',
      });
      await user.click(button);

      // Mobile should show bottom sheet
      const bottomSheet = document.querySelector('.fixed.bottom-0');
      expect(bottomSheet).toBeInTheDocument();
      expect(bottomSheet).toHaveClass('rounded-t-lg');
    });

    it('should handle pull-to-refresh gestures', async () => {
      const RefreshableComponent = () => {
        const [isRefreshing, setIsRefreshing] = React.useState(false);

        const handleTouchStart = (e: React.TouchEvent) => {
          const touch = e.touches[0];
          if (touch.clientY < 50 && window.scrollY === 0) {
            setIsRefreshing(true);
            setTimeout(() => setIsRefreshing(false), 1000);
          }
        };

        return (
          <div onTouchStart={handleTouchStart} className="min-h-screen">
            {isRefreshing && (
              <div role="status" aria-live="polite">
                Refreshing...
              </div>
            )}
            <div>Content</div>
          </div>
        );
      };

      mockViewport(375, 667);
      render(<RefreshableComponent />);

      const container = screen.getByText('Content').parentElement;

      // Simulate pull-to-refresh gesture
      const touchStart = mockTouchEvent('touchstart', [
        { clientX: 100, clientY: 30 },
      ]);
      fireEvent(container!, touchStart);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Refreshing...');
      });
    });
  });

  describe('Cross-Device Compatibility', () => {
    it('should work across different mobile devices', async () => {
      const devices = [
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'Samsung Galaxy S21', width: 384, height: 854 },
        { name: 'iPad', width: 768, height: 1024 },
      ];

      for (const device of devices) {
        mockViewport(device.width, device.height);
        const { rerender } = render(<ResponsivePetDisplay />);

        // Component should render properly on each device
        const petImage = screen.getByAltText('Pet');
        expect(petImage).toBeInTheDocument();

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);

        // Clean up for next iteration
        rerender(<div />);
      }
    });
  });
});
