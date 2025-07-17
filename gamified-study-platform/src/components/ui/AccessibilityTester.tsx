import React, { useState, useEffect } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { Card } from './Card'
import { AccessibilityTester, AccessibilityTestResult } from '../../utils/accessibilityTesting'

interface AccessibilityTesterProps {
  enabled?: boolean
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export function AccessibilityTesterComponent({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-left'
}: AccessibilityTesterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResults, setTestResults] = useState<AccessibilityTestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<'full' | 'keyboard' | 'screen-reader' | 'responsive'>('full')

  if (!enabled) return null

  const runTest = async () => {
    setIsRunning(true)
    const tester = new AccessibilityTester()
    
    try {
      let results: AccessibilityTestResult
      
      switch (selectedTest) {
        case 'keyboard':
          const keyboardIssues = tester.testKeyboardNavigation()
          results = {
            passed: keyboardIssues.length === 0,
            score: keyboardIssues.length === 0 ? 100 : Math.max(0, 100 - keyboardIssues.length * 10),
            issues: keyboardIssues,
            summary: {
              errors: keyboardIssues.filter(i => i.type === 'error').length,
              warnings: keyboardIssues.filter(i => i.type === 'warning').length,
              info: keyboardIssues.filter(i => i.type === 'info').length
            },
            recommendations: ['Test keyboard navigation with Tab, Shift+Tab, Enter, Space, and Arrow keys']
          }
          break
        case 'screen-reader':
          const srIssues = tester.testScreenReaderSupport()
          results = {
            passed: srIssues.length === 0,
            score: srIssues.length === 0 ? 100 : Math.max(0, 100 - srIssues.length * 10),
            issues: srIssues,
            summary: {
              errors: srIssues.filter(i => i.type === 'error').length,
              warnings: srIssues.filter(i => i.type === 'warning').length,
              info: srIssues.filter(i => i.type === 'info').length
            },
            recommendations: ['Test with screen readers like NVDA, JAWS, or VoiceOver']
          }
          break
        case 'responsive':
          const responsiveResults = tester.testResponsiveDesign()
          const allIssues = [...responsiveResults.touchTargets, ...responsiveResults.textReadability]
          results = {
            passed: allIssues.length === 0,
            score: allIssues.length === 0 ? 100 : Math.max(0, 100 - allIssues.length * 5),
            issues: allIssues,
            summary: {
              errors: allIssues.filter(i => i.type === 'error').length,
              warnings: allIssues.filter(i => i.type === 'warning').length,
              info: allIssues.filter(i => i.type === 'info').length
            },
            recommendations: responsiveResults.recommendations
          }
          break
        default:
          results = await tester.runFullTest()
      }
      
      setTestResults(results)
    } catch (error) {
      console.error('Accessibility test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (passed: boolean) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <>
      {/* Floating Test Button */}
      <div className={`fixed ${positionClasses[position]} z-40`}>
        <Button
          onClick={() => setIsOpen(true)}
          variant="secondary"
          size="sm"
          className="shadow-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
          aria-label="Open accessibility tester"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          A11y Test
        </Button>
      </div>

      {/* Test Results Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Accessibility Tester"
        size="xl"
      >
        <div className="space-y-6">
          {/* Test Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Type
            </label>
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="full">Full Accessibility Test</option>
              <option value="keyboard">Keyboard Navigation</option>
              <option value="screen-reader">Screen Reader Support</option>
              <option value="responsive">Responsive Design</option>
            </select>
          </div>

          {/* Run Test Button */}
          <Button
            onClick={runTest}
            isLoading={isRunning}
            loadingText="Running test..."
            className="w-full"
          >
            Run Accessibility Test
          </Button>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-4">
              {/* Score and Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accessibility Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(testResults.score)}`}>
                    {testResults.score}/100
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(testResults.passed)}`}>
                    {testResults.passed ? 'PASSED' : 'NEEDS ATTENTION'}
                  </span>
                </div>
              </div>

              {/* Issue Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.summary.errors}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{testResults.summary.warnings}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{testResults.summary.info}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Info</div>
                </Card>
              </div>

              {/* Recommendations */}
              {testResults.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {testResults.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Issues */}
              {testResults.issues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Issues Found ({testResults.issues.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {testResults.issues.map((issue, index) => (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                issue.type === 'error' ? 'bg-red-100 text-red-800' :
                                issue.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {issue.type.toUpperCase()}
                              </span>
                              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                {issue.rule}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {issue.message}
                            </p>
                            {issue.suggestion && (
                              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                                💡 {issue.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Report */}
              <Button
                variant="outline"
                onClick={() => {
                  const tester = new AccessibilityTester()
                  const report = tester.generateReport()
                  const blob = new Blob([report], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full"
              >
                Export Report
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}