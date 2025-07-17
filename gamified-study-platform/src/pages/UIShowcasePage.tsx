import React, { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Modal, 
  LoadingSpinner, 
  LoadingSkeleton, 
  IconButton,
  Input 
} from '../components/ui'
import { useTheme } from '../contexts/ThemeContext'

export function UIShowcasePage() {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleLoadingDemo = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">UI Components Showcase</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Demonstrating all the new layout and UI components with dark mode support.
        </p>
      </div>

      {/* Theme Toggle Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Theme System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600 dark:text-gray-300">
              Current theme: <span className="font-semibold capitalize">{theme}</span>
            </p>
            <Button onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button loading={loading} onClick={handleLoadingDemo}>
                {loading ? 'Loading...' : 'Test Loading'}
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <IconButton variant="primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </IconButton>
            <IconButton variant="secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </IconButton>
            <IconButton variant="ghost">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82a3 3 0 00-4.24 0L2.82 5.83a3 3 0 000 4.24l2.01 2.01a3 3 0 004.24 0l2.01-2.01a3 3 0 000-4.24L10.07 2.82z" />
              </svg>
            </IconButton>
            <IconButton variant="danger">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </IconButton>
          </div>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              This is a default card with border styling.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              This card has shadow elevation effects.
            </p>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              This card has a prominent border outline.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Loading Spinners</h4>
              <div className="flex items-center space-x-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Loading Skeletons</h4>
              <div className="space-y-3">
                <LoadingSkeleton lines={1} width="60%" />
                <LoadingSkeleton lines={3} />
                <LoadingSkeleton lines={2} width="80%" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="Enter your email"
              helperText="We'll never share your email with anyone else."
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter your password"
            />
            <Input 
              label="Error Example" 
              type="text" 
              placeholder="This field has an error"
              error="This field is required"
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Component</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowModal(true)}>
            Open Modal Demo
          </Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modal Demo"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This modal demonstrates the following features:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Smooth enter/exit animations with Framer Motion</li>
            <li>Backdrop click to close (try clicking outside)</li>
            <li>Keyboard navigation (press Escape to close)</li>
            <li>Focus management and accessibility</li>
            <li>Dark mode support</li>
            <li>Responsive sizing options</li>
          </ul>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nested Components</h4>
            <div className="space-y-3">
              <Input placeholder="You can include form elements" />
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button onClick={() => setShowModal(false)}>
              Awesome!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}