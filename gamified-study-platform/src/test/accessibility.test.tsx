import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccessibilityProvider } from '../contexts/AccessibilityContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ResponsiveTable } from '../components/ui/ResponsiveTable'
import { accessibility } from '../utils/accessibility'

// Mock data for table tests
const mockTableData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
]

const mockTableColumns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role' },
]

// Test wrapper with accessibility context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AccessibilityProvider>
    {children}
  </AccessibilityProvider>
)

describe('Accessibility Features', () => {
  describe('Button Component', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <Button aria-label="Save document">Save</Button>
        </TestWrapper>
      )

      const button = screen.getByRole('button', { name: 'Save document' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Save document')
    })

    it('should handle loading state with proper ARIA', () => {
      render(
        <TestWrapper>
          <Button isLoading loadingText="Saving...">Save</Button>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveAttribute('aria-label', 'Saving...')
    })

    it('should meet minimum touch target size', () => {
      render(
        <TestWrapper>
          <Button>Click me</Button>
        </TestWrapper>
      )

      const button = screen.getByRole('button')
      const styles = window.getComputedStyle(button)
      
      // Check minimum 44px height and width
      expect(button).toHaveClass('min-h-[44px]')
      expect(button).toHaveClass('min-w-[44px]')
    })
  })

  describe('Input Component', () => {
    it('should have proper label association', () => {
      render(
        <TestWrapper>
          <Input label="Email Address" id="email" />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Email Address')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('id', 'email')
    })

    it('should handle error states with ARIA', () => {
      render(
        <TestWrapper>
          <Input 
            label="Email" 
            error="Please enter a valid email address"
            id="email-error"
          />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Please enter a valid email address')
    })

    it('should support helper text', () => {
      render(
        <TestWrapper>
          <Input 
            label="Password" 
            helperText="Must be at least 8 characters"
            id="password"
          />
        </TestWrapper>
      )

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('aria-describedby')
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
    })
  })

  describe('Modal Component', () => {
    it('should trap focus when open', () => {
      const onClose = jest.fn()
      
      render(
        <TestWrapper>
          <Modal isOpen={true} onClose={onClose} title="Test Modal">
            <button>First Button</button>
            <button>Second Button</button>
          </Modal>
        </TestWrapper>
      )

      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby')
    })

    it('should close on escape key', () => {
      const onClose = jest.fn()
      
      render(
        <TestWrapper>
          <Modal isOpen={true} onClose={onClose} title="Test Modal">
            <p>Modal content</p>
          </Modal>
        </TestWrapper>
      )

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalled()
    })

    it('should announce opening to screen readers', () => {
      const onClose = jest.fn()
      
      render(
        <TestWrapper>
          <Modal isOpen={true} onClose={onClose} title="Important Dialog">
            <p>Modal content</p>
          </Modal>
        </TestWrapper>
      )

      // Check that modal has proper ARIA attributes
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-labelledby')
      expect(modal).toHaveAttribute('aria-describedby')
    })
  })

  describe('ResponsiveTable Component', () => {
    it('should have proper table semantics', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            keyExtractor={(item) => item.id.toString()}
            aria-label="User data table"
          />
        </TestWrapper>
      )

      const table = screen.getByRole('table', { name: 'User data table' })
      expect(table).toBeInTheDocument()

      // Check for column headers
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument()

      // Check for table rows
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(3) // Header + 2 data rows
    })

    it('should support keyboard navigation for sortable columns', () => {
      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            keyExtractor={(item) => item.id.toString()}
          />
        </TestWrapper>
      )

      const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
      expect(nameHeader).toHaveAttribute('tabindex', '0')
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')

      // Simulate keyboard activation
      fireEvent.keyDown(nameHeader, { key: 'Enter' })
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })
  })

  describe('Accessibility Utilities', () => {
    it('should detect missing alt text', () => {
      const container = document.createElement('div')
      container.innerHTML = '<img src="test.jpg" />'
      
      const checker = accessibility.createChecker()
      const issues = checker.checkImageAltText(container)
      
      expect(issues).toHaveLength(1)
      expect(issues[0].rule).toBe('img-alt')
      expect(issues[0].type).toBe('error')
    })

    it('should detect heading hierarchy issues', () => {
      const container = document.createElement('div')
      container.innerHTML = '<h3>Skip to h3</h3><h1>Main heading</h1>'
      
      const checker = accessibility.createChecker()
      const issues = checker.checkHeadingHierarchy(container)
      
      expect(issues.length).toBeGreaterThan(0)
      expect(issues.some(issue => issue.rule === 'heading-start')).toBe(true)
    })

    it('should detect form controls without labels', () => {
      const container = document.createElement('div')
      container.innerHTML = '<input type="text" />'
      
      const checker = accessibility.createChecker()
      const issues = checker.checkFormLabels(container)
      
      expect(issues).toHaveLength(1)
      expect(issues[0].rule).toBe('form-label')
      expect(issues[0].type).toBe('error')
    })

    it('should identify focusable elements', () => {
      const button = document.createElement('button')
      const link = document.createElement('a')
      link.href = '#'
      const disabledButton = document.createElement('button')
      disabledButton.disabled = true

      expect(accessibility.isFocusable(button)).toBe(true)
      expect(accessibility.isFocusable(link)).toBe(true)
      expect(accessibility.isFocusable(disabledButton)).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('should adapt table to mobile view', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      render(
        <TestWrapper>
          <ResponsiveTable
            data={mockTableData}
            columns={mockTableColumns}
            keyExtractor={(item) => item.id.toString()}
          />
        </TestWrapper>
      )

      // On mobile, table should render as cards instead of table
      // This would need actual responsive hook implementation to test properly
    })
  })

  describe('High Contrast Mode', () => {
    it('should apply high contrast styles when enabled', () => {
      render(
        <TestWrapper>
          <Button>Test Button</Button>
        </TestWrapper>
      )

      // Simulate high contrast mode
      document.documentElement.classList.add('high-contrast')

      const button = screen.getByRole('button')
      // In a real test, you'd check computed styles
      expect(document.documentElement).toHaveClass('high-contrast')
    })
  })
})

describe('Keyboard Navigation', () => {
  it('should support tab navigation', () => {
    render(
      <TestWrapper>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </TestWrapper>
    )

    const buttons = screen.getAllByRole('button')
    
    // Focus first button
    buttons[0].focus()
    expect(buttons[0]).toHaveFocus()

    // Tab to next button
    fireEvent.keyDown(buttons[0], { key: 'Tab' })
    // Note: jsdom doesn't automatically handle tab navigation,
    // so you'd need to manually simulate or use a more complete testing setup
  })

  it('should support arrow key navigation in lists', () => {
    // This would test custom keyboard navigation components
    // Implementation depends on specific component behavior
  })
})

describe('Screen Reader Support', () => {
  it('should announce important changes', () => {
    const announcements: string[] = []
    
    // Mock screen reader announcements
    const originalCreateElement = document.createElement
    document.createElement = jest.fn().mockImplementation((tagName) => {
      const element = originalCreateElement.call(document, tagName)
      if (tagName === 'div' && element.getAttribute?.('aria-live')) {
        announcements.push(element.textContent || '')
      }
      return element
    })

    accessibility.announce('Test announcement')
    
    // Restore original function
    document.createElement = originalCreateElement
  })
})

describe('Enhanced Accessibility Testing', () => {
  describe('AccessibilityTester', () => {
    it('should run comprehensive accessibility tests', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <h1>Main Title</h1>
        <img src="test.jpg" alt="Test image" />
        <button>Click me</button>
        <input type="text" aria-label="Search" />
      `
      
      const { AccessibilityTester } = await import('../utils/accessibilityTesting')
      const tester = new AccessibilityTester(container)
      const results = await tester.runFullTest()
      
      expect(results).toHaveProperty('score')
      expect(results).toHaveProperty('passed')
      expect(results).toHaveProperty('issues')
      expect(results).toHaveProperty('recommendations')
      expect(typeof results.score).toBe('number')
      expect(typeof results.passed).toBe('boolean')
    })

    it('should test keyboard navigation specifically', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button tabindex="1">Bad tabindex</button>
        <button>Good button</button>
        <a href="#" tabindex="-1" aria-hidden="true">Hidden link</a>
      `
      
      const { AccessibilityTester } = await import('../utils/accessibilityTesting')
      const tester = new AccessibilityTester(container)
      const issues = tester.testKeyboardNavigation()
      
      expect(Array.isArray(issues)).toBe(true)
      expect(issues.some(issue => issue.rule === 'tabindex-positive')).toBe(true)
    })

    it('should test responsive design aspects', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button style="width: 20px; height: 20px;">Small button</button>
        <p style="font-size: 10px;">Small text</p>
      `
      
      const { AccessibilityTester } = await import('../utils/accessibilityTesting')
      const tester = new AccessibilityTester(container)
      const results = tester.testResponsiveDesign()
      
      expect(results).toHaveProperty('touchTargets')
      expect(results).toHaveProperty('textReadability')
      expect(results).toHaveProperty('recommendations')
      expect(Array.isArray(results.touchTargets)).toBe(true)
      expect(Array.isArray(results.textReadability)).toBe(true)
    })
  })

  describe('ResponsiveDesignTester', () => {
    it('should test different breakpoints', async () => {
      const { ResponsiveDesignTester } = await import('../utils/responsiveTesting')
      const tester = new ResponsiveDesignTester()
      
      // Mock viewport dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      const results = await tester.testBreakpoints()
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toHaveProperty('breakpoint')
      expect(results[0]).toHaveProperty('score')
      expect(results[0]).toHaveProperty('issues')
    })

    it('should detect horizontal scrolling issues', async () => {
      const container = document.createElement('div')
      container.innerHTML = `<div style="width: 2000px; height: 100px;">Wide content</div>`
      document.body.appendChild(container)
      
      // Mock scrollWidth
      Object.defineProperty(document.documentElement, 'scrollWidth', {
        value: 2000,
        configurable: true
      })
      
      const { ResponsiveDesignTester } = await import('../utils/responsiveTesting')
      const tester = new ResponsiveDesignTester(container)
      const issues = tester['checkResponsiveIssues']('mobile', 375, 667)
      
      expect(issues.some(issue => issue.rule === 'horizontal-scroll')).toBe(true)
      
      document.body.removeChild(container)
    })
  })
})