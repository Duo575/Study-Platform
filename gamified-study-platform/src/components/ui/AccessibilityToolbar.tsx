import React, { useState } from 'react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { Button } from './Button'
import { IconButton } from './IconButton'

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    settings,
    toggleHighContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleReducedMotion,
  } = useAccessibility()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        variant="primary"
        size="lg"
        className="shadow-lg"
        aria-label={`${isOpen ? 'Close' : 'Open'} accessibility toolbar`}
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
          />
        </svg>
      </IconButton>

      {/* Toolbar Panel */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Accessibility Settings
            </h3>
            <IconButton
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              aria-label="Close accessibility toolbar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </IconButton>
          </div>

          <div className="space-y-4">
            {/* Font Size Controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Size: {settings.fontSize}
              </label>
              <div className="flex space-x-2">
                <Button
                  onClick={decreaseFontSize}
                  variant="secondary"
                  size="sm"
                  disabled={settings.fontSize === 'small'}
                  aria-label="Decrease font size"
                >
                  A-
                </Button>
                <Button
                  onClick={resetFontSize}
                  variant="secondary"
                  size="sm"
                  aria-label="Reset font size to normal"
                >
                  Reset
                </Button>
                <Button
                  onClick={increaseFontSize}
                  variant="secondary"
                  size="sm"
                  disabled={settings.fontSize === 'extra-large'}
                  aria-label="Increase font size"
                >
                  A+
                </Button>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="high-contrast-toggle"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                High Contrast Mode
              </label>
              <button
                id="high-contrast-toggle"
                type="button"
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  settings.highContrast ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.highContrast}
                aria-label="Toggle high contrast mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="reduced-motion-toggle"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Reduce Motion
              </label>
              <button
                id="reduced-motion-toggle"
                type="button"
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  settings.reducedMotion ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keyboard Navigation Info */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Keyboard shortcuts:</strong><br />
                Tab/Shift+Tab: Navigate<br />
                Enter/Space: Activate<br />
                Escape: Close dialogs<br />
                Arrow keys: Navigate lists
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}