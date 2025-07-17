# Accessibility and Responsive Design Guide

This guide covers the comprehensive accessibility and responsive design features implemented in the StudyQuest platform. The platform follows WCAG 2.1 AA guidelines and implements modern responsive design patterns.

## Table of Contents

1. [Accessibility Features](#accessibility-features)
2. [Responsive Design](#responsive-design)
3. [Components](#components)
4. [Testing](#testing)
5. [Best Practices](#best-practices)

## Accessibility Features

### Core Accessibility Context

The `AccessibilityProvider` manages global accessibility settings:

```tsx
import { AccessibilityProvider, useAccessibility } from '../contexts/AccessibilityContext'

function App() {
  return (
    <AccessibilityProvider>
      {/* Your app content */}
    </AccessibilityProvider>
  )
}

function MyComponent() {
  const { settings, toggleHighContrast, announce } = useAccessibility()
  
  return (
    <button onClick={() => {
      toggleHighContrast()
      announce('High contrast mode toggled')
    }}>
      Toggle High Contrast
    </button>
  )
}
```

### Accessibility Settings

- **High Contrast Mode**: Improves visibility for users with visual impairments
- **Font Size Control**: Adjustable text size (small, normal, large, extra-large)
- **Reduced Motion**: Respects user's motion preferences
- **Screen Reader Announcements**: Live region announcements

### Skip Links

Skip links allow keyboard users to quickly navigate to main content:

```tsx
import { SkipLinks } from '../components/ui/SkipLinks'

// Automatically included in AppLayout
<SkipLinks />
```

### Accessibility Toolbar

A floating toolbar provides quick access to accessibility settings:

```tsx
import { AccessibilityToolbar } from '../components/ui/AccessibilityToolbar'

// Automatically included in AppLayout
<AccessibilityToolbar />
```

### Focus Management

#### Focus Trap Hook

```tsx
import { useFocusTrap } from '../hooks/useAccessibility'

function Modal({ isOpen }) {
  const focusTrapRef = useFocusTrap(isOpen)
  
  return (
    <div ref={focusTrapRef} role="dialog">
      {/* Modal content */}
    </div>
  )
}
```

#### Keyboard Navigation Hook

```tsx
import { useKeyboardNavigation } from '../hooks/useAccessibility'

function NavigationMenu({ items }) {
  const { activeIndex } = useKeyboardNavigation(
    items,
    (index) => selectItem(index)
  )
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={item.id} className={index === activeIndex ? 'active' : ''}>
          {item.label}
        </li>
      ))}
    </ul>
  )
}
```

## Responsive Design

### Responsive Hooks

#### Breakpoint Detection

```tsx
import { useBreakpoint, useIsMobile, useIsTablet, useIsDesktop } from '../hooks/useResponsive'

function ResponsiveComponent() {
  const breakpoint = useBreakpoint() // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  
  return (
    <div>
      <p>Current breakpoint: {breakpoint}</p>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}
```

#### Responsive Values

```tsx
import { useResponsiveValue } from '../hooks/useResponsive'

function AdaptiveComponent() {
  const columns = useResponsiveValue({
    base: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  })
  
  return <div className={`grid-cols-${columns}`}>Content</div>
}
```

### Screen Size and Orientation

```tsx
import { useScreenSize, useOrientation, useIsTouchDevice } from '../hooks/useResponsive'

function DeviceAwareComponent() {
  const { width, height } = useScreenSize()
  const orientation = useOrientation() // 'portrait' | 'landscape'
  const isTouchDevice = useIsTouchDevice()
  
  return (
    <div>
      <p>Screen: {width}x{height}</p>
      <p>Orientation: {orientation}</p>
      {isTouchDevice && <TouchOptimizedControls />}
    </div>
  )
}
```

## Components

### Accessible Button

```tsx
import { Button } from '../components/ui/Button'

<Button
  variant="primary"
  size="md"
  isLoading={loading}
  loadingText="Saving..."
  aria-label="Save document"
  leftIcon={<SaveIcon />}
>
  Save
</Button>
```

Features:
- Minimum 44px touch target
- Loading states with proper ARIA
- Focus indicators
- Screen reader support

### Accessible Input

```tsx
import { Input } from '../components/ui/Input'

<Input
  label="Email Address"
  error={errors.email}
  helperText="We'll never share your email"
  required
  leftIcon={<EmailIcon />}
/>
```

Features:
- Automatic label association
- Error state management
- Helper text support
- Required field indicators

### Accessible Modal

```tsx
import { Modal } from '../components/ui/Modal'

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  closeOnEscape={true}
  closeOnOutsideClick={true}
>
  <p>Are you sure you want to continue?</p>
  <Button onClick={onConfirm}>Confirm</Button>
</Modal>
```

Features:
- Focus trapping
- Keyboard navigation
- Screen reader announcements
- Proper ARIA attributes

### Responsive Table

```tsx
import { ResponsiveTable } from '../components/ui/ResponsiveTable'

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', hideOnMobile: true }
]

<ResponsiveTable
  data={users}
  columns={columns}
  keyExtractor={(user) => user.id}
  onRowClick={(user) => viewUser(user)}
  aria-label="Users table"
/>
```

Features:
- Mobile card view
- Keyboard navigation
- Sortable columns
- Screen reader support

### Responsive Layouts

#### Grid Layout

```tsx
import { ResponsiveGrid } from '../components/ui/ResponsiveGrid'

<ResponsiveGrid
  cols={{ default: 1, sm: 2, md: 3, lg: 4 }}
  gap="md"
>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</ResponsiveGrid>
```

#### Container

```tsx
import { Container } from '../components/ui/Container'

<Container size="lg" padding="md">
  <h1>Page Title</h1>
  <p>Content goes here</p>
</Container>
```

#### Responsive Card

```tsx
import { ResponsiveCard } from '../components/ui/ResponsiveCard'

<ResponsiveCard
  variant="elevated"
  padding="lg"
  hover={true}
  interactive={true}
  onClick={() => navigate('/details')}
  aria-label="View details"
>
  <h3>Card Title</h3>
  <p>Card content</p>
</ResponsiveCard>
```

#### Layout Components

```tsx
import { 
  StackLayout, 
  SidebarLayout, 
  GridLayout, 
  MasonryLayout 
} from '../components/ui/ResponsiveLayout'

// Stack layout
<StackLayout gap="md" align="center">
  <Header />
  <Content />
  <Footer />
</StackLayout>

// Sidebar layout
<SidebarLayout sidebarWidth="md" collapseSidebar={true}>
  <Sidebar />
  <MainContent />
</SidebarLayout>

// Grid layout
<GridLayout columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
  {items.map(item => <Item key={item.id} {...item} />)}
</GridLayout>

// Masonry layout
<MasonryLayout>
  {cards.map(card => <Card key={card.id} {...card} />)}
</MasonryLayout>
```

### Responsive Image

```tsx
import { ResponsiveImage } from '../components/ui/ResponsiveImage'

<ResponsiveImage
  src="/images/hero.jpg"
  alt="Hero image description"
  srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  aspectRatio="16:9"
  loading="lazy"
  placeholder="Loading..."
  fallback="Failed to load image"
/>
```

## Testing

### Accessibility Testing

#### Basic Accessibility Testing

```tsx
import { accessibility } from '../utils/accessibility'

// Quick accessibility check
const issues = accessibility.quickCheck(document.body)
console.log(issues)

// Detailed checking
const checker = accessibility.createChecker()
const imageIssues = checker.checkImageAltText()
const headingIssues = checker.checkHeadingHierarchy()
const formIssues = checker.checkFormLabels()

// Generate report
const report = checker.generateReport()
console.log(report)
```

#### Enhanced Accessibility Testing

```tsx
import { accessibilityTesting } from '../utils/accessibilityTesting'

// Comprehensive accessibility test
const results = await accessibilityTesting.quickTest()
console.log(`Score: ${results.score}/100`)
console.log(`Issues found: ${results.issues.length}`)

// Test specific component
const componentElement = document.getElementById('my-component')
const componentResults = await accessibilityTesting.testComponent(componentElement)

// Generate detailed report
const report = await accessibilityTesting.generatePageReport()
console.log(report)

// Test keyboard navigation
const keyboardIssues = accessibilityTesting.testKeyboardNav()
console.log('Keyboard issues:', keyboardIssues)
```

#### Responsive Design Testing

```tsx
import { responsiveTesting } from '../utils/responsiveTesting'

// Test all breakpoints
const breakpointResults = await responsiveTesting.quickTest()
breakpointResults.forEach(result => {
  console.log(`${result.breakpoint}: ${result.score}/100`)
})

// Test current viewport
const currentResults = responsiveTesting.testCurrentViewport()
console.log(`Current (${currentResults.breakpoint}): ${currentResults.score}/100`)

// Test specific responsive features
const imageIssues = responsiveTesting.testImages()
const tableIssues = responsiveTesting.testTables()
```

### Development Tools

#### Accessibility Tester Component

The platform includes a built-in accessibility testing component for development:

```tsx
import { AccessibilityTesterComponent } from '../components/ui/AccessibilityTester'

// Automatically included in AppLayout during development
<AccessibilityTesterComponent position="bottom-left" />
```

Features:
- **Full Accessibility Test**: Comprehensive WCAG compliance check
- **Keyboard Navigation Test**: Focus management and keyboard accessibility
- **Screen Reader Test**: ARIA attributes and semantic structure
- **Responsive Design Test**: Touch targets and mobile usability
- **Score Calculation**: 0-100 accessibility score with detailed breakdown
- **Export Reports**: Generate downloadable accessibility reports

#### Breakpoint Indicator

Visual indicator showing current responsive breakpoint:

```tsx
import { BreakpointIndicator } from '../components/ui/BreakpointIndicator'

// Shows current breakpoint in development
<BreakpointIndicator 
  position="top-right" 
  showDetails={true} 
/>
```

#### Browser Console Testing

In development mode, testing utilities are available in the browser console:

```javascript
// Accessibility testing
window.accessibilityTesting.quickTest()
window.accessibilityTesting.testKeyboardNav()

// Responsive testing
window.responsiveTesting.quickTest()
window.responsiveTesting.testCurrentViewport()
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Focus indicators are visible
- [ ] Tab order is logical
- [ ] Escape key closes modals/dropdowns
- [ ] Arrow keys work in lists/menus

#### Screen Reader Testing
- [ ] All images have alt text
- [ ] Form controls have labels
- [ ] Headings are properly structured
- [ ] ARIA attributes are correct
- [ ] Live regions announce changes

#### Visual Testing
- [ ] Text has sufficient contrast
- [ ] Focus indicators are visible
- [ ] Content is readable at 200% zoom
- [ ] High contrast mode works
- [ ] Font size adjustments work

#### Mobile Testing
- [ ] Touch targets are at least 44px
- [ ] Content adapts to small screens
- [ ] Horizontal scrolling is avoided
- [ ] Pinch-to-zoom works
- [ ] Orientation changes are handled

## Best Practices

### Accessibility

1. **Always provide alternative text** for images and icons
2. **Use semantic HTML** elements when possible
3. **Ensure keyboard accessibility** for all interactive elements
4. **Provide clear focus indicators** that meet contrast requirements
5. **Use ARIA attributes** appropriately, not excessively
6. **Test with screen readers** and keyboard-only navigation
7. **Maintain logical heading hierarchy** (h1 → h2 → h3)
8. **Provide error messages** that are clear and actionable

### Responsive Design

1. **Design mobile-first** then enhance for larger screens
2. **Use flexible units** (rem, em, %) instead of fixed pixels
3. **Optimize touch targets** for mobile devices (minimum 44px)
4. **Consider different input methods** (touch, mouse, keyboard)
5. **Test on real devices** not just browser dev tools
6. **Optimize images** for different screen densities
7. **Use progressive enhancement** for advanced features
8. **Consider performance** on slower mobile connections

### Component Development

1. **Include accessibility from the start** of component design
2. **Use TypeScript** for better prop validation and documentation
3. **Provide comprehensive prop interfaces** with clear descriptions
4. **Test components** in isolation and in context
5. **Document usage examples** and accessibility considerations
6. **Follow consistent naming conventions** for props and classes
7. **Support theming** and customization appropriately
8. **Consider edge cases** and error states

### CSS and Styling

1. **Use CSS custom properties** for theming
2. **Implement focus-visible** for better focus management
3. **Respect user preferences** (prefers-reduced-motion, prefers-color-scheme)
4. **Use logical properties** for better internationalization
5. **Avoid fixed heights** that might cause overflow
6. **Use CSS Grid and Flexbox** for responsive layouts
7. **Implement proper color contrast** ratios
8. **Test with different font sizes** and zoom levels

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Responsive Design Patterns](https://web.dev/patterns/layout/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)