import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should render as different HTML elements when using asChild', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Link Button');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<Button>Default</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90');
    });

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground', 'hover:bg-destructive/90');
    });

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background', 'hover:bg-accent');
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground', 'hover:bg-secondary/80');
    });

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<Button>Default Size</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'rounded-md', 'px-3');
    });

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'rounded-md', 'px-8');
    });

    it('should apply icon size styles', () => {
      render(<Button size="icon">🔥</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('should show loading state', () => {
      render(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should hide text when loading and hideTextOnLoading is true', () => {
      render(
        <Button loading hideTextOnLoading>
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('Submit');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show both spinner and text when loading and hideTextOnLoading is false', () => {
      render(
        <Button loading hideTextOnLoading={false}>
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      
      render(
        <Button leftIcon={<LeftIcon />}>
          With Left Icon
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('should render right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      
      render(
        <Button rightIcon={<RightIcon />}>
          With Right Icon
        </Button>
      );
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('should render both left and right icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      const RightIcon = () => <span data-testid="right-icon">→</span>;
      
      render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Both Icons
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Both Icons')).toBeInTheDocument();
    });

    it('should hide icons when loading and hideTextOnLoading is true', () => {
      const LeftIcon = () => <span data-testid="left-icon">←</span>;
      
      render(
        <Button loading hideTextOnLoading leftIcon={<LeftIcon />}>
          Loading
        </Button>
      );
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );
      
      await user.click(screen.getByRole('button'));
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      
      render(
        <Button onKeyDown={handleKeyDown}>
          Keyboard
        </Button>
      );
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes when loading', () => {
      render(<Button loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should have proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should support custom ARIA labels', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('should be focusable by default', () => {
      render(<Button>Focusable</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Form Integration', () => {
    it('should have correct type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should default to button type', () => {
      render(<Button>Default Type</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should work in forms', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      render(<Button className="sm:px-6 md:px-8">Responsive</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('sm:px-6', 'md:px-8');
    });

    it('should work with responsive variants', () => {
      render(
        <Button className="sm:bg-secondary md:bg-destructive">
          Responsive Variant
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('sm:bg-secondary', 'md:bg-destructive');
    });
  });

  describe('Theme Support', () => {
    it('should support dark mode classes', () => {
      render(
        <div className="dark">
          <Button>Dark Mode</Button>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-primary', 'dark:text-primary-foreground');
    });

    it('should support custom CSS variables', () => {
      render(
        <Button style={{ '--custom-color': 'red' } as React.CSSProperties}>
          Custom Theme
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('--custom-color: red');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestButton = (props: any) => {
        renderSpy();
        return <Button {...props} />;
      };

      const { rerender } = render(<TestButton>Test</TestButton>);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestButton>Test</TestButton>);
      
      // Should use React.memo to prevent unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when props change', () => {
      const renderSpy = vi.fn();
      
      const TestButton = (props: any) => {
        renderSpy();
        return <Button {...props} />;
      };

      const { rerender } = render(<TestButton>Test</TestButton>);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with different props
      rerender(<TestButton disabled>Test</TestButton>);
      
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle complex children', () => {
      render(
        <Button>
          <span>Complex</span>
          <strong>Children</strong>
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('ComplexChildren');
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Children')).toBeInTheDocument();
    });

    it('should handle very long text', () => {
      const longText = 'This is a very long button text that might overflow or cause layout issues';
      
      render(<Button>{longText}</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });
  });

  describe('Animation and Transitions', () => {
    it('should have transition classes', () => {
      render(<Button>Animated</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('should handle focus states', async () => {
      const user = userEvent.setup();
      
      render(<Button>Focus me</Button>);
      
      const button = screen.getByRole('button');
      
      await user.tab();
      
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-ring');
    });

    it('should handle hover states', async () => {
      const user = userEvent.setup();
      
      render(<Button>Hover me</Button>);
      
      const button = screen.getByRole('button');
      
      await user.hover(button);
      
      expect(button).toHaveClass('hover:bg-primary/90');
    });
  });
});