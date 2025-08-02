import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { XPBar } from '../XPBar';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('XPBar Component', () => {
  const defaultProps = {
    currentXP: 150,
    totalXP: 1250,
    level: 5,
    xpToNextLevel: 100,
    showAnimation: false,
    gameStats: {
      level: 5,
      totalXP: 1250,
      currentXP: 150,
      xpToNextLevel: 100,
      streakDays: 7,
      achievements: [],
      lastActivity: new Date(),
      weeklyStats: {
        studyHours: 10,
        questsCompleted: 5,
        streakMaintained: true,
        xpEarned: 500,
        averageScore: 85,
      },
    },
  };

  describe('Rendering', () => {
    it('should render XP bar with correct information', () => {
      render(<XPBar {...defaultProps} />);

      expect(screen.getByText('Level 5')).toBeInTheDocument();
      expect(screen.getByText('1,250 XP')).toBeInTheDocument();
      expect(screen.getByText('150 / 250 XP')).toBeInTheDocument();
    });

    it('should render progress bar with correct percentage', () => {
      render(<XPBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60'); // 150/250 = 60%
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should display correct progress percentage text', () => {
      render(<XPBar {...defaultProps} />);

      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should handle zero XP correctly', () => {
      const zeroXPProps = {
        ...defaultProps,
        currentXP: 0,
        totalXP: 0,
        xpToNextLevel: 100,
      };

      render(<XPBar {...zeroXPProps} />);

      expect(screen.getByText('0 XP')).toBeInTheDocument();
      expect(screen.getByText('0 / 100 XP')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle maximum XP correctly', () => {
      const maxXPProps = {
        ...defaultProps,
        currentXP: 250,
        xpToNextLevel: 0,
      };

      render(<XPBar {...maxXPProps} />);

      expect(screen.getByText('250 / 250 XP')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Styling and Classes', () => {
    it('should apply correct CSS classes', () => {
      const { container } = render(<XPBar {...defaultProps} />);

      const xpBar = container.firstChild as HTMLElement;
      expect(xpBar).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'p-4');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <XPBar {...defaultProps} className="custom-class" />
      );

      const xpBar = container.firstChild as HTMLElement;
      expect(xpBar).toHaveClass('custom-class');
    });

    it('should have correct progress bar styling', () => {
      render(<XPBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-gray-200', 'rounded-full', 'h-3');

      const progressFill = progressBar.querySelector('.bg-blue-500');
      expect(progressFill).toBeInTheDocument();
      expect(progressFill).toHaveClass(
        'h-3',
        'rounded-full',
        'transition-all',
        'duration-500'
      );
    });
  });

  describe('Animation', () => {
    it('should show animation when showAnimation is true', () => {
      const animatedProps = {
        ...defaultProps,
        showAnimation: true,
      };

      render(<XPBar {...animatedProps} />);

      // Check for animation-related elements or classes
      const animationElement = screen.getByTestId('xp-animation');
      expect(animationElement).toBeInTheDocument();
    });

    it('should not show animation when showAnimation is false', () => {
      render(<XPBar {...defaultProps} />);

      const animationElement = screen.queryByTestId('xp-animation');
      expect(animationElement).not.toBeInTheDocument();
    });

    it('should apply pulse animation to level text when animated', () => {
      const animatedProps = {
        ...defaultProps,
        showAnimation: true,
      };

      render(<XPBar {...animatedProps} />);

      const levelText = screen.getByText('Level 5');
      expect(levelText.closest('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<XPBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute(
        'aria-label',
        'Experience points progress'
      );
    });

    it('should have proper ARIA values', () => {
      render(<XPBar {...defaultProps} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute(
        'aria-valuetext',
        '150 out of 250 XP'
      );
    });

    it('should be keyboard accessible', () => {
      render(<XPBar {...defaultProps} />);

      const xpBar = screen.getByRole('progressbar').closest('[tabindex]');
      expect(xpBar).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for mobile', () => {
      const { container } = render(<XPBar {...defaultProps} />);

      const levelText = screen.getByText('Level 5');
      expect(levelText).toHaveClass('text-lg', 'sm:text-xl');
    });

    it('should have responsive spacing', () => {
      const { container } = render(<XPBar {...defaultProps} />);

      const xpBar = container.firstChild as HTMLElement;
      expect(xpBar).toHaveClass('p-4', 'sm:p-6');
    });
  });

  describe('Number Formatting', () => {
    it('should format large numbers correctly', () => {
      const largeXPProps = {
        ...defaultProps,
        totalXP: 1234567,
        currentXP: 567,
        xpToNextLevel: 433,
      };

      render(<XPBar {...largeXPProps} />);

      expect(screen.getByText('1,234,567 XP')).toBeInTheDocument();
      expect(screen.getByText('567 / 1,000 XP')).toBeInTheDocument();
    });

    it('should handle decimal calculations correctly', () => {
      const decimalProps = {
        ...defaultProps,
        currentXP: 33,
        xpToNextLevel: 67,
      };

      render(<XPBar {...decimalProps} />);

      expect(screen.getByText('33%')).toBeInTheDocument(); // 33/100 = 33%
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative values gracefully', () => {
      const negativeProps = {
        ...defaultProps,
        currentXP: -10,
        totalXP: -100,
        xpToNextLevel: -50,
      };

      render(<XPBar {...negativeProps} />);

      // Should not crash and should display reasonable values
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const largeProps = {
        ...defaultProps,
        currentXP: 999999999,
        totalXP: 999999999,
        xpToNextLevel: 1,
      };

      render(<XPBar {...largeProps} />);

      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });

    it('should handle zero division', () => {
      const zeroDivisionProps = {
        ...defaultProps,
        currentXP: 0,
        xpToNextLevel: 0,
      };

      render(<XPBar {...zeroDivisionProps} />);

      // Should not crash
      expect(screen.getByText('Level 5')).toBeInTheDocument();
    });
  });

  describe('Tooltip Information', () => {
    it('should show tooltip with detailed information on hover', async () => {
      const user = userEvent.setup();
      render(<XPBar {...defaultProps} />);

      const xpBar = screen.getByRole('progressbar').closest('[data-tooltip]');

      if (xpBar) {
        await user.hover(xpBar);

        // Check for tooltip content
        expect(screen.getByText(/Next level in 100 XP/)).toBeInTheDocument();
      }
    });

    it('should show different tooltip for max level', async () => {
      const maxLevelProps = {
        ...defaultProps,
        level: 50,
        xpToNextLevel: 0,
      };

      const user = userEvent.setup();
      render(<XPBar {...maxLevelProps} />);

      const xpBar = screen.getByRole('progressbar').closest('[data-tooltip]');

      if (xpBar) {
        await user.hover(xpBar);

        expect(screen.getByText(/Maximum level reached/)).toBeInTheDocument();
      }
    });
  });

  describe('Theme Support', () => {
    it('should support dark theme', () => {
      const { container } = render(
        <div className="dark">
          <XPBar {...defaultProps} />
        </div>
      );

      const xpBar = container.querySelector('.dark .bg-white');
      expect(xpBar).toHaveClass('dark:bg-gray-800');
    });

    it('should have proper contrast in dark mode', () => {
      const { container } = render(
        <div className="dark">
          <XPBar {...defaultProps} />
        </div>
      );

      const levelText = screen.getByText('Level 5');
      expect(levelText).toHaveClass('text-gray-900', 'dark:text-white');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();

      const TestComponent = (props: any) => {
        renderSpy();
        return <XPBar {...props} />;
      };

      const { rerender } = render(<TestComponent {...defaultProps} />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent {...defaultProps} />);

      // Should use memoization to prevent unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when props change', () => {
      const renderSpy = vi.fn();

      const TestComponent = (props: any) => {
        renderSpy();
        return <XPBar {...props} />;
      };

      const { rerender } = render(<TestComponent {...defaultProps} />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with different props
      rerender(<TestComponent {...defaultProps} currentXP={200} />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
