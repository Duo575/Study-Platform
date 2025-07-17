// Responsive design testing utilities

export interface ResponsiveTestResult {
  breakpoint: string
  width: number
  height: number
  issues: ResponsiveIssue[]
  recommendations: string[]
  score: number
}

export interface ResponsiveIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: HTMLElement
  suggestion?: string
}

export class ResponsiveDesignTester {
  private container: HTMLElement

  constructor(container: HTMLElement = document.body) {
    this.container = container
  }

  // Test at different breakpoints
  async testBreakpoints(): Promise<ResponsiveTestResult[]> {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1024, height: 768 },
      { name: 'large', width: 1440, height: 900 },
      { name: 'xl', width: 1920, height: 1080 }
    ]

    const results: ResponsiveTestResult[] = []

    for (const bp of breakpoints) {
      // Simulate viewport size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: bp.width,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: bp.height,
      })

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))

      // Wait for responsive changes to take effect
      await new Promise(resolve => setTimeout(resolve, 100))

      const issues = this.checkResponsiveIssues(bp.name, bp.width, bp.height)
      const score = this.calculateScore(issues)
      const recommendations = this.generateRecommendations(issues, bp.name)

      results.push({
        breakpoint: bp.name,
        width: bp.width,
        height: bp.height,
        issues,
        recommendations,
        score
      })
    }

    return results
  }

  // Check for responsive design issues
  private checkResponsiveIssues(breakpoint: string, width: number, height: number): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = []

    // Check for horizontal scrolling
    if (document.documentElement.scrollWidth > width) {
      issues.push({
        type: 'error',
        rule: 'horizontal-scroll',
        message: 'Content causes horizontal scrolling',
        suggestion: 'Ensure content fits within viewport width'
      })
    }

    // Check touch target sizes on mobile
    if (width <= 768) {
      const interactiveElements = this.container.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
      
      interactiveElements.forEach(element => {
        const rect = element.getBoundingClientRect()
        const minSize = 44

        if (rect.width < minSize || rect.height < minSize) {
          issues.push({
            type: 'warning',
            rule: 'touch-target-size',
            message: `Interactive element is ${Math.round(Math.max(rect.width, rect.height))}px, should be at least ${minSize}px`,
            element: element as HTMLElement,
            suggestion: 'Increase padding or size for better touch accessibility'
          })
        }
      })
    }

    // Check text readability
    const textElements = this.container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const fontSize = parseFloat(styles.fontSize)
      
      // Minimum font sizes by breakpoint
      const minFontSizes = {
        mobile: 14,
        tablet: 15,
        desktop: 16,
        large: 16,
        xl: 16
      }

      const minSize = minFontSizes[breakpoint as keyof typeof minFontSizes] || 16

      if (fontSize < minSize) {
        issues.push({
          type: 'info',
          rule: 'font-size',
          message: `Text size is ${fontSize}px, consider using at least ${minSize}px for ${breakpoint}`,
          element: element as HTMLElement,
          suggestion: `Use responsive font sizes appropriate for ${breakpoint} devices`
        })
      }
    })

    // Check for overlapping elements
    const allElements = this.container.querySelectorAll('*')
    const elementRects = Array.from(allElements).map(el => ({
      element: el,
      rect: el.getBoundingClientRect()
    })).filter(item => item.rect.width > 0 && item.rect.height > 0)

    for (let i = 0; i < elementRects.length; i++) {
      for (let j = i + 1; j < elementRects.length; j++) {
        const rect1 = elementRects[i].rect
        const rect2 = elementRects[j].rect

        // Check if elements overlap significantly
        const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left))
        const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top))
        
        if (overlapX > 10 && overlapY > 10) {
          const overlapArea = overlapX * overlapY
          const area1 = rect1.width * rect1.height
          const area2 = rect2.width * rect2.height
          
          // If overlap is significant relative to element size
          if (overlapArea > Math.min(area1, area2) * 0.3) {
            issues.push({
              type: 'warning',
              rule: 'element-overlap',
              message: 'Elements may be overlapping',
              element: elementRects[i].element as HTMLElement,
              suggestion: 'Check layout spacing and positioning'
            })
            break // Avoid duplicate reports for the same element
          }
        }
      }
    }

    // Check for content that's too wide
    const contentElements = this.container.querySelectorAll('img, video, table, pre, code')
    contentElements.forEach(element => {
      const rect = element.getBoundingClientRect()
      if (rect.width > width * 0.95) { // More than 95% of viewport width
        issues.push({
          type: 'warning',
          rule: 'content-width',
          message: 'Content may be too wide for viewport',
          element: element as HTMLElement,
          suggestion: 'Make content responsive or add horizontal scrolling'
        })
      }
    })

    return issues
  }

  // Calculate responsive design score
  private calculateScore(issues: ResponsiveIssue[]): number {
    const errors = issues.filter(issue => issue.type === 'error').length
    const warnings = issues.filter(issue => issue.type === 'warning').length
    const info = issues.filter(issue => issue.type === 'info').length

    const maxScore = 100
    const score = Math.max(0, maxScore - (errors * 15) - (warnings * 8) - (info * 3))
    
    return Math.round(score)
  }

  // Generate recommendations based on issues
  private generateRecommendations(issues: ResponsiveIssue[], breakpoint: string): string[] {
    const recommendations: string[] = []
    const issueTypes = new Set(issues.map(issue => issue.rule))

    if (issueTypes.has('horizontal-scroll')) {
      recommendations.push(`Eliminate horizontal scrolling on ${breakpoint} by using flexible layouts and proper overflow handling.`)
    }

    if (issueTypes.has('touch-target-size')) {
      recommendations.push(`Increase touch target sizes to at least 44px for better ${breakpoint} usability.`)
    }

    if (issueTypes.has('font-size')) {
      recommendations.push(`Use appropriate font sizes for ${breakpoint} devices to ensure readability.`)
    }

    if (issueTypes.has('element-overlap')) {
      recommendations.push(`Review layout spacing to prevent element overlap on ${breakpoint}.`)
    }

    if (issueTypes.has('content-width')) {
      recommendations.push(`Ensure content scales appropriately for ${breakpoint} viewport width.`)
    }

    // General recommendations by breakpoint
    switch (breakpoint) {
      case 'mobile':
        recommendations.push('Consider mobile-first design principles.')
        recommendations.push('Test with one-handed usage patterns.')
        break
      case 'tablet':
        recommendations.push('Optimize for both portrait and landscape orientations.')
        recommendations.push('Consider touch and mouse input methods.')
        break
      case 'desktop':
        recommendations.push('Utilize available screen space effectively.')
        recommendations.push('Ensure keyboard navigation works well.')
        break
    }

    if (recommendations.length === 0) {
      recommendations.push(`Great responsive design for ${breakpoint}! No issues found.`)
    }

    return recommendations
  }

  // Test specific responsive features
  testImageResponsiveness(): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = []
    const images = this.container.querySelectorAll('img')

    images.forEach(img => {
      // Check if image has responsive attributes
      if (!img.srcset && !img.sizes && !img.style.maxWidth && !img.classList.contains('responsive')) {
        issues.push({
          type: 'info',
          rule: 'image-responsive',
          message: 'Image may not be responsive',
          element: img,
          suggestion: 'Add srcset, sizes attributes or CSS max-width: 100%'
        })
      }

      // Check for fixed dimensions
      if (img.width && img.height && !img.style.width && !img.style.height) {
        issues.push({
          type: 'warning',
          rule: 'image-fixed-size',
          message: 'Image has fixed dimensions',
          element: img,
          suggestion: 'Use CSS for responsive image sizing'
        })
      }
    })

    return issues
  }

  testTableResponsiveness(): ResponsiveIssue[] {
    const issues: ResponsiveIssue[] = []
    const tables = this.container.querySelectorAll('table')

    tables.forEach(table => {
      const rect = table.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      if (rect.width > viewportWidth * 0.9) {
        issues.push({
          type: 'warning',
          rule: 'table-overflow',
          message: 'Table may overflow on small screens',
          element: table,
          suggestion: 'Consider responsive table patterns like horizontal scrolling or card layout'
        })
      }

      // Check if table has responsive wrapper
      const wrapper = table.closest('.table-responsive, .overflow-x-auto, [style*="overflow"]')
      if (!wrapper && rect.width > viewportWidth * 0.9) {
        issues.push({
          type: 'info',
          rule: 'table-wrapper',
          message: 'Table should have responsive wrapper',
          element: table,
          suggestion: 'Wrap table in container with horizontal scroll'
        })
      }
    })

    return issues
  }
}

// Utility functions for quick testing
export const responsiveTesting = {
  // Quick responsive test
  quickTest: async (container?: HTMLElement) => {
    const tester = new ResponsiveDesignTester(container)
    return tester.testBreakpoints()
  },

  // Test current viewport
  testCurrentViewport: (container?: HTMLElement) => {
    const tester = new ResponsiveDesignTester(container)
    const width = window.innerWidth
    const height = window.innerHeight
    
    let breakpoint = 'xl'
    if (width < 640) breakpoint = 'mobile'
    else if (width < 768) breakpoint = 'tablet'
    else if (width < 1024) breakpoint = 'desktop'
    else if (width < 1280) breakpoint = 'large'

    const issues = tester['checkResponsiveIssues'](breakpoint, width, height)
    const score = tester['calculateScore'](issues)
    const recommendations = tester['generateRecommendations'](issues, breakpoint)

    return {
      breakpoint,
      width,
      height,
      issues,
      recommendations,
      score
    }
  },

  // Test images
  testImages: (container?: HTMLElement) => {
    const tester = new ResponsiveDesignTester(container)
    return tester.testImageResponsiveness()
  },

  // Test tables
  testTables: (container?: HTMLElement) => {
    const tester = new ResponsiveDesignTester(container)
    return tester.testTableResponsiveness()
  }
}

// Development helper
if (process.env.NODE_ENV === 'development') {
  (window as any).responsiveTesting = responsiveTesting
}