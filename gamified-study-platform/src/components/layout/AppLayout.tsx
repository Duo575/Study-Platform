import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileDrawer } from './MobileDrawer'
import { SkipLinks } from '../ui/SkipLinks'
import { AccessibilityToolbar } from '../ui/AccessibilityToolbar'
import { AccessibilityTesterComponent } from '../ui/AccessibilityTester'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Links */}
      <SkipLinks />

      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"
        aria-label="Main navigation"
      >
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        <Sidebar onNavigate={closeMobileMenu} />
      </MobileDrawer>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header onMenuClick={toggleMobileMenu} />
        
        <main 
          id="main-content"
          className="flex-1 py-6"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Accessibility Tester (Development Only) */}
      <AccessibilityTesterComponent position="bottom-left" />
    </div>
  )
}