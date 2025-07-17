// Enhanced accessibility testing utilities for development and testing

import { AccessibilityIssue, accessibility } from './accessibility'

export interface AccessibilityTestResult {
  passed: boolean
  score: number
  issues: AccessibilityIssue[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
  recommendations: string[]
}

export class AccessibilityTester {
  private container: HTMLElement
  private testResults: AccessibilityTestResult | null = null

  constructor(container: HTMLElement = document.body) {
    this.container = container
  }

  // Run comprehensive accessibility tests
  async runFullTest(): Promise<AccessibilityTestResult> {
    const checker = accessibility.createChecker()
    const issues = checker.runAllChecks(this.container)
    
    const errors = issues.filter(issue => issue.type === 'error')
    const warnings = issues.filter(issue => issue.type === 'warning')
    const info = issues.filter(issue => issue.type === 'info')

    // Calculate accessibility score (0-100)
    const totalIssues = errors.length + warnings.length + (info.length * 0.1)
    const maxScore = 100
    const score = Math.max(0, maxScore - (errors.length * 10) - (warnings.length * 5) - (info.length * 1))

    const recommendations = this.generateRecommendations(issues)

    this.testResults = {
      passed: errors.length === 0,
      score: Math.round(score),
      issues,
      summary: {
        errors: errors.length,
        warnings: warnings.length,
        info: info.length
      },
      recommendations
    }

    return this.testResults
  }

  // Test specific accessibility aspects
  testKeyboardNavigation(): AccessibilityIssue[] {
    const checker = accessibility.createChecker()
    return checker.checkKeyboardAccessibility(this.container)
  }

  testScreenReaderSupport(): AccessibilityIssue[] {
    const checker = accessibility.createChecker()
    const imageIssues = checker.checkImageAltText(this.container)
    const formIssues = checker.checkFormLabels(this.container)
    const ariaIssues = checker.checkAriaUsage(this.container)
    
    return [...imageIssues, ...formIssues, ...ariaIssues]
  }

  testSemanticStructure(): AccessibilityIssue[] {
    const checker = accessibility.createChecker()
    return checker.checkHeadingHierarchy(this.container)
  }

  // Generate actionable recommendations
  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = []
    const issueTypes = new Set(issues.map(issue => issue.rule))

    if (issueTypes.has('img-alt')) {
      recommendations.push('Add descriptive alt text to all images. Use empty alt="" for decorative images.')
    }

    if (issueTypes.has('form-label')) {
      recommendations.push('Ensure all form controls have associated labels using <label> elements or aria-label attributes.')
    }

    if (issueTypes.has('heading-skip') || issueTypes.has('heading-start')) {
      recommendations.push('Use proper heading hierarchy (h1 → h2 → h3) to create a logical document structure.')
    }

    if (issueTypes.has('tabindex-positive')) {
      recommendations.push('Avoid positive tabindex values. Use tabindex="0" or rely on natural tab order.')
    }

    if (issueTypes.has('focus-indicator')) {
      recommendations.push('Ensure all interactive elements have visible focus indicators for keyboard users.')
    }

    if (issueTypes.has('color-contrast')) {
      recommendations.push('Check color contrast ratios meet WCAG guidelines (4.5:1 for normal text, 3:1 for large text).')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! No major accessibility issues found. Continue following accessibility best practices.')
    }

    return recommendations
  }

  // Generate detailed report
  generateReport(): string {
    if (!this.testResults) {
      return 'No test results available. Run runFullTest() first.'
    }

    const { score, summary, issues, recommendations } = this.testResults

    let report = `Accessibility Test Report\n`
    report += `========================\n\n`
    report += `Overall Score: ${score}/100\n`
    report += `Status: ${this.testResults.passed ? 'PASSED' : 'NEEDS ATTENTION'}\n\n`
    
    report += `Issue Summary:\n`
    report += `- Errors: ${summary.errors}\n`
    report += `- Warnings: ${summary.warnings}\n`
    report += `- Info: ${summary.info}\n\n`

    if (issues.length > 0) {
      report += `Detailed Issues:\n`
      report += `================\n\n`
      
      issues.forEach((issue, index) => {
        report += `${index + 1}. [${issue.type.toUpperCase()}] ${issue.rule}\n`
        report += `   ${issue.message}\n`
        if (issue.suggestion) {
          report += `   💡 ${issue.suggestion}\n`
        }
        report += `\n`
      })
    }

    report += `Recommendations:\n`
    report += `================\n\n`
    recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`
    })

    return report
  }

  // Test responsive design aspects
  testResponsiveDesign(): {
    touchTargets: AccessibilityIssue[]
    textReadability: AccessibilityIssue[]
    recommendations: string[]
  } {
    const touchTargets: AccessibilityIssue[] = []
    const textReadability: AccessibilityIssue[] = []
    const recommendations: string[] = []

    // Check touch target sizes
    const interactiveElements = this.container.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect()
      const minSize = 44 // WCAG recommended minimum

      if (rect.width < minSize || rect.height < minSize) {
        touchTargets.push({
          type: 'warning',
          rule: 'touch-target-size',
          message: `Interactive element is smaller than ${minSize}px minimum`,
          element: element as HTMLElement,
          suggestion: `Increase padding or size to meet ${minSize}px minimum touch target`
        })
      }
    })

    // Check text readability
    const textElements = this.container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const fontSize = parseFloat(styles.fontSize)
      
      if (fontSize < 16) {
        textReadability.push({
          type: 'info',
          rule: 'text-size',
          message: 'Text size may be too small for comfortable reading',
          element: element as HTMLElement,
          suggestion: 'Consider using at least 16px font size for body text'
        })
      }
    })

    // Generate responsive recommendations
    if (touchTargets.length > 0) {
      recommendations.push('Ensure all interactive elements meet minimum 44px touch target size for mobile users.')
    }

    if (textReadability.length > 0) {
      recommendations.push('Use readable font sizes (16px or larger) for better accessibility on all devices.')
    }

    recommendations.push('Test your interface on various screen sizes and orientations.')
    recommendations.push('Ensure content is accessible with zoom up to 200%.')

    return {
      touchTargets,
      textReadability,
      recommendations
    }
  }
}

// Utility functions for quick testing
export const accessibilityTesting = {
  // Quick test for development
  quickTest: (container?: HTMLElement) => {
    const tester = new AccessibilityTester(container)
    return tester.runFullTest()
  },

  // Test specific component
  testComponent: (component: HTMLElement) => {
    const tester = new AccessibilityTester(component)
    return tester.runFullTest()
  },

  // Generate report for current page
  generatePageReport: () => {
    const tester = new AccessibilityTester()
    return tester.runFullTest().then(() => tester.generateReport())
  },

  // Test keyboard navigation
  testKeyboardNav: (container?: HTMLElement) => {
    const tester = new AccessibilityTester(container)
    return tester.testKeyboardNavigation()
  },

  // Test responsive design
  testResponsive: (container?: HTMLElement) => {
    const tester = new AccessibilityTester(container)
    return tester.testResponsiveDesign()
  }
}

// Development helper - adds accessibility testing to window object in development
if (process.env.NODE_ENV === 'development') {
  (window as any).accessibilityTesting = accessibilityTesting
}