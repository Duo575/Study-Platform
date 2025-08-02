// Accessibility testing and validation utilities

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: HTMLElement;
  suggestion?: string;
}

export class AccessibilityChecker {
  private issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  checkImageAltText(
    container: HTMLElement = document.body
  ): AccessibilityIssue[] {
    const images = container.querySelectorAll('img');
    const issues: AccessibilityIssue[] = [];

    images.forEach(img => {
      if (
        !img.alt &&
        !img.getAttribute('aria-label') &&
        !img.getAttribute('aria-labelledby')
      ) {
        issues.push({
          type: 'error',
          rule: 'img-alt',
          message: 'Image missing alt text',
          element: img,
          suggestion: 'Add descriptive alt text or aria-label to the image',
        });
      } else if (img.alt === '') {
        // Empty alt is okay for decorative images, but check if it's intentional
        const isDecorative =
          img.getAttribute('role') === 'presentation' ||
          img.getAttribute('aria-hidden') === 'true';
        if (!isDecorative) {
          issues.push({
            type: 'warning',
            rule: 'img-alt-empty',
            message: 'Image has empty alt text - ensure this is decorative',
            element: img,
            suggestion:
              'If decorative, add role="presentation" or aria-hidden="true"',
          });
        }
      }
    });

    return issues;
  }

  // Check for proper heading hierarchy
  checkHeadingHierarchy(
    container: HTMLElement = document.body
  ): AccessibilityIssue[] {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues: AccessibilityIssue[] = [];
    let previousLevel = 0;

    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));

      if (previousLevel === 0 && currentLevel !== 1) {
        issues.push({
          type: 'warning',
          rule: 'heading-start',
          message: 'Page should start with h1',
          element: heading as HTMLElement,
          suggestion: 'Use h1 for the main page heading',
        });
      } else if (currentLevel > previousLevel + 1) {
        issues.push({
          type: 'error',
          rule: 'heading-skip',
          message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
          element: heading as HTMLElement,
          suggestion: 'Use sequential heading levels (h1, h2, h3, etc.)',
        });
      }

      previousLevel = currentLevel;
    });

    return issues;
  }

  // Check for proper form labels
  checkFormLabels(
    container: HTMLElement = document.body
  ): AccessibilityIssue[] {
    const formControls = container.querySelectorAll('input, select, textarea');
    const issues: AccessibilityIssue[] = [];

    formControls.forEach(control => {
      const hasLabel =
        control.getAttribute('aria-label') ||
        control.getAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${control.id}"]`) ||
        control.closest('label');

      if (!hasLabel) {
        issues.push({
          type: 'error',
          rule: 'form-label',
          message: 'Form control missing label',
          element: control as HTMLElement,
          suggestion: 'Add a label element or aria-label attribute',
        });
      }
    });

    return issues;
  }

  // Check for sufficient color contrast
  checkColorContrast(
    container: HTMLElement = document.body
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const textElements = container.querySelectorAll('*');

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;

      // Only check elements with text content
      if (element.textContent?.trim()) {
        const textColor = styles.color;
        const backgroundColor = styles.backgroundColor;

        // This is a simplified check - in practice, you'd use a proper contrast calculation
        if (
          textColor &&
          backgroundColor &&
          textColor !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor !== 'rgba(0, 0, 0, 0)'
        ) {
          // Placeholder for actual contrast calculation
          // Real implementation would calculate WCAG contrast ratio
          const isLargeText =
            fontSize >= 18 ||
            (fontSize >= 14 &&
              (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
          const requiredRatio = isLargeText ? 3 : 4.5;

          // This would need actual contrast calculation
          // For now, just flag elements that might need checking
          issues.push({
            type: 'info',
            rule: 'color-contrast',
            message: 'Check color contrast manually',
            element: element as HTMLElement,
            suggestion: `Ensure contrast ratio is at least ${requiredRatio}:1`,
          });
        }
      }
    });

    return issues;
  }

  // Check for keyboard accessibility
  checkKeyboardAccessibility(
    container: HTMLElement = document.body
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const interactiveElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
    );

    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      const isHidden = element.getAttribute('aria-hidden') === 'true';

      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          type: 'warning',
          rule: 'tabindex-positive',
          message: 'Avoid positive tabindex values',
          element: element as HTMLElement,
          suggestion: 'Use tabindex="0" or rely on natural tab order',
        });
      }

      // Check for interactive elements that are hidden but still focusable
      if (isHidden && tabIndex !== '-1') {
        issues.push({
          type: 'error',
          rule: 'hidden-focusable',
          message: 'Hidden element is still focusable',
          element: element as HTMLElement,
          suggestion: 'Add tabindex="-1" to hidden interactive elements',
        });
      }

      // Check for missing focus indicators
      const styles = window.getComputedStyle(element, ':focus');
      if (styles.outline === 'none' && !styles.boxShadow.includes('ring')) {
        issues.push({
          type: 'warning',
          rule: 'focus-indicator',
          message: 'Element may be missing focus indicator',
          element: element as HTMLElement,
          suggestion: 'Ensure visible focus indicator is present',
        });
      }
    });

    return issues;
  }

  // Check for ARIA usage
  checkAriaUsage(container: HTMLElement = document.body): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const elementsWithAria = container.querySelectorAll(
      '[aria-label], [aria-labelledby], [aria-describedby], [role]'
    );

    elementsWithAria.forEach(element => {
      const role = element.getAttribute('role');
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledby = element.getAttribute('aria-labelledby');
      const ariaDescribedby = element.getAttribute('aria-describedby');

      // Check for invalid roles
      const validRoles = [
        'button',
        'link',
        'tab',
        'tabpanel',
        'dialog',
        'alert',
        'banner',
        'navigation',
        'main',
        'complementary',
        'contentinfo',
      ];
      if (role && !validRoles.includes(role)) {
        issues.push({
          type: 'warning',
          rule: 'aria-role-valid',
          message: `Unknown or invalid ARIA role: ${role}`,
          element: element as HTMLElement,
          suggestion: 'Use valid ARIA roles from the specification',
        });
      }

      // Check for referenced elements
      if (ariaLabelledby) {
        const referencedElement = container.querySelector(`#${ariaLabelledby}`);
        if (!referencedElement) {
          issues.push({
            type: 'error',
            rule: 'aria-labelledby-valid',
            message: `aria-labelledby references non-existent element: ${ariaLabelledby}`,
            element: element as HTMLElement,
            suggestion:
              'Ensure referenced element exists and has the correct ID',
          });
        }
      }

      if (ariaDescribedby) {
        const referencedElement = container.querySelector(
          `#${ariaDescribedby}`
        );
        if (!referencedElement) {
          issues.push({
            type: 'error',
            rule: 'aria-describedby-valid',
            message: `aria-describedby references non-existent element: ${ariaDescribedby}`,
            element: element as HTMLElement,
            suggestion:
              'Ensure referenced element exists and has the correct ID',
          });
        }
      }
    });

    return issues;
  }

  // Run all accessibility checks
  runAllChecks(container: HTMLElement = document.body): AccessibilityIssue[] {
    this.issues = [];

    this.issues.push(...this.checkImageAltText(container));
    this.issues.push(...this.checkHeadingHierarchy(container));
    this.issues.push(...this.checkFormLabels(container));
    this.issues.push(...this.checkKeyboardAccessibility(container));
    this.issues.push(...this.checkAriaUsage(container));

    return this.issues;
  }

  // Generate accessibility report
  generateReport(): string {
    const errorCount = this.issues.filter(
      issue => issue.type === 'error'
    ).length;
    const warningCount = this.issues.filter(
      issue => issue.type === 'warning'
    ).length;
    const infoCount = this.issues.filter(issue => issue.type === 'info').length;

    let report = `Accessibility Report\n`;
    report += `==================\n\n`;
    report += `Summary:\n`;
    report += `- Errors: ${errorCount}\n`;
    report += `- Warnings: ${warningCount}\n`;
    report += `- Info: ${infoCount}\n\n`;

    if (this.issues.length === 0) {
      report += `No accessibility issues found!\n`;
    } else {
      report += `Issues:\n\n`;
      this.issues.forEach((issue, index) => {
        report += `${index + 1}. [${issue.type.toUpperCase()}] ${issue.rule}\n`;
        report += `   ${issue.message}\n`;
        if (issue.suggestion) {
          report += `   Suggestion: ${issue.suggestion}\n`;
        }
        report += `\n`;
      });
    }

    return report;
  }
}

// Utility functions for accessibility testing
export const accessibility = {
  // Create a new accessibility checker instance
  createChecker: () => new AccessibilityChecker(),

  // Quick check for common issues
  quickCheck: (container?: HTMLElement) => {
    const checker = new AccessibilityChecker();
    return checker.runAllChecks(container);
  },

  // Check if element is focusable
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return (
      focusableSelectors.some(selector => element.matches(selector)) ||
      element.getAttribute('tabindex') === '0'
    );
  },

  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  },

  // Announce message to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};
