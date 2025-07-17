import React from 'react'

export function SkipLinks() {
  const skipToContent = (e: React.MouseEvent) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const skipToNavigation = (e: React.MouseEvent) => {
    e.preventDefault()
    const navigation = document.getElementById('main-navigation')
    if (navigation) {
      navigation.focus()
      navigation.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-br-lg shadow-lg">
        <nav className="flex flex-col p-2 space-y-1">
          <a
            href="#main-content"
            onClick={skipToContent}
            className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            Skip to main content
          </a>
          <a
            href="#main-navigation"
            onClick={skipToNavigation}
            className="px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
          >
            Skip to navigation
          </a>
        </nav>
      </div>
    </div>
  )
}