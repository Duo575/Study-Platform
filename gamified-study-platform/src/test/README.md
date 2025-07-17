# Testing Documentation

This document provides an overview of the testing strategy and implementation for the Gamified Study Platform.

## Testing Strategy

Our testing approach follows a comprehensive multi-layered strategy:

### 1. Unit Tests
- **Purpose**: Test individual functions, components, and modules in isolation
- **Coverage**: Utils, services, hooks, and individual components
- **Tools**: Vitest, @testing-library/react
- **Location**: `src/**/__tests__/` or `src/**/*.test.ts`

### 2. Integration Tests
- **Purpose**: Test interactions between multiple components/services
- **Coverage**: Complete workflows like study sessions, quest completion, pet care
- **Tools**: Vitest with mocked dependencies
- **Location**: `src/test/integration/`

### 3. Component Tests
- **Purpose**: Test React components with user interactions
- **Coverage**: UI components, forms, interactive elements
- **Tools**: @testing-library/react, @testing-library/user-event
- **Location**: `src/components/**/__tests__/`

### 4. Type Guards Tests
- **Purpose**: Ensure data validation and type safety
- **Coverage**: All type guard functions and validators
- **Tools**: Vitest
- **Location**: `src/types/__tests__/`

## Test Structure

### File Organization
```
src/
├── test/
│   ├── setup.ts                 # Global test setup
│   ├── integration/             # Integration tests
│   └── README.md               # This file
├── utils/__tests__/            # Utility function tests
├── services/__tests__/         # Service layer tests
├── hooks/__tests__/            # Custom hook tests
├── components/**/__tests__/    # Component tests
└── types/__tests__/            # Type guard tests
```

### Test Categories

#### 1. Gamification System Tests
- **XP Calculations**: `src/utils/__tests__/gamification.test.ts`
- **Level Progression**: `src/utils/__tests__/gamificationEngine.test.ts`
- **Quest Generation**: `src/utils/__tests__/questUtils.test.ts`
- **Service Integration**: `src/services/__tests__/gamificationService.test.ts`

#### 2. Pet System Tests
- **Pet Management**: `src/services/__tests__/petService.test.ts`
- **Pet Hooks**: `src/hooks/__tests__/usePet.test.ts`
- **Evolution Logic**: Covered in pet service tests

#### 3. Quest System Tests
- **Quest Service**: `src/services/__tests__/questService.test.ts`
- **Quest Utils**: `src/utils/__tests__/questUtils.test.ts`
- **Quest Hooks**: `src/hooks/__tests__/useQuests.test.ts`

#### 4. UI Component Tests
- **Button Component**: `src/components/ui/__tests__/Button.test.tsx`
- **XP Bar**: `src/components/gamification/__tests__/XPBar.test.tsx`
- **Form Components**: Various component test files

#### 5. Type Safety Tests
- **Type Guards**: `src/types/__tests__/guards.test.ts`
- **Validators**: `src/types/__tests__/validators.test.ts`

## Test Configuration

### Vitest Configuration
- **Environment**: jsdom for React component testing
- **Coverage**: v8 provider with 80% threshold
- **Parallel Execution**: Multi-threaded test runner
- **Timeouts**: 10s for tests, 10s for hooks
- **Retry**: 1 retry for flaky tests

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Excluded from Coverage
- Test files
- Configuration files
- Type definitions
- Main entry points
- Assets and public files
- Database migrations

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests once with coverage
npm run test:run

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- gamification.test.ts

# Run tests matching pattern
npm test -- --grep "XP calculation"
```

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

## Writing Tests

### Best Practices

#### 1. Test Structure
```typescript
describe('ComponentName', () => {
  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

#### 2. Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('should render with correct props', () => {
    render(<ComponentName prop="value" />);
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<ComponentName onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 3. Service Testing
```typescript
import { vi } from 'vitest';
import { serviceName } from '../serviceName';

// Mock dependencies
vi.mock('../dependency', () => ({
  dependencyFunction: vi.fn()
}));

describe('ServiceName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should handle successful operation', async () => {
    // Mock successful response
    const mockDependency = await import('../dependency');
    mockDependency.dependencyFunction.mockResolvedValue('success');
    
    const result = await serviceName.operation();
    
    expect(result).toBe('success');
    expect(mockDependency.dependencyFunction).toHaveBeenCalledWith(
      expect.objectContaining({ /* expected params */ })
    );
  });
});
```

#### 4. Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.value).toBe(defaultValue);
    expect(result.current.loading).toBe(false);
  });
  
  it('should update state on action', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    await act(async () => {
      await result.current.performAction();
    });
    
    expect(result.current.value).toBe(updatedValue);
  });
});
```

### Mocking Guidelines

#### 1. External Dependencies
```typescript
// Mock entire modules
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null }))
    }))
  }
}));

// Mock specific functions
vi.mock('../../utils/helpers', () => ({
  helperFunction: vi.fn().mockReturnValue('mocked result')
}));
```

#### 2. React Components
```typescript
// Mock child components
vi.mock('../ChildComponent', () => ({
  ChildComponent: ({ children, ...props }: any) => 
    <div data-testid="child-component" {...props}>{children}</div>
}));

// Mock hooks
vi.mock('../../hooks/useCustomHook', () => ({
  useCustomHook: () => ({
    value: 'mocked value',
    loading: false,
    error: null
  })
}));
```

#### 3. Animation Libraries
```typescript
// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));
```

## Test Data Management

### Mock Data
- **Location**: `src/test/mocks/`
- **Purpose**: Reusable mock data for tests
- **Examples**: Mock users, courses, quests, pets

### Test Utilities
- **Location**: `src/test/utils/`
- **Purpose**: Helper functions for tests
- **Examples**: Render with providers, mock API responses

## Continuous Integration

### GitHub Actions
- Tests run on every PR and push to main
- Coverage reports generated and uploaded
- Failed tests block merges

### Pre-commit Hooks
- Run linting and type checking
- Run affected tests
- Ensure code quality

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `await` and `act()` properly
2. **Mock Cleanup**: Clear mocks between tests
3. **DOM Queries**: Use appropriate queries from testing-library
4. **Timing Issues**: Use `waitFor()` for async assertions

### Debug Commands
```bash
# Run single test with debug info
npm test -- --reporter=verbose gamification.test.ts

# Run tests with browser debugging
npm test -- --inspect-brk

# Run tests with coverage debugging
npm test -- --coverage --reporter=verbose
```

## Performance Testing

### Test Performance
- Keep tests fast (< 100ms per test)
- Use shallow rendering when possible
- Mock heavy dependencies
- Avoid unnecessary DOM operations

### Memory Management
- Clean up event listeners
- Clear timers and intervals
- Reset global state between tests

## Accessibility Testing

### Testing Guidelines
- Test keyboard navigation
- Verify ARIA attributes
- Check color contrast
- Test screen reader compatibility

### Tools
- @testing-library/jest-dom matchers
- axe-core for accessibility auditing
- Manual testing with screen readers

## Security Testing

### Areas to Test
- Input validation
- XSS prevention
- CSRF protection
- Authentication flows

### Test Examples
- Malicious input handling
- Authorization checks
- Data sanitization
- Secure API calls

## Maintenance

### Regular Tasks
- Update test dependencies
- Review and update mock data
- Refactor duplicate test code
- Monitor test performance

### Test Health Metrics
- Test execution time
- Flaky test identification
- Coverage trends
- Test maintenance burden

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

### Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Component Testing Guide](https://testing-library.com/docs/react-testing-library/intro/)
- [Mocking Strategies](https://vitest.dev/guide/mocking.html)