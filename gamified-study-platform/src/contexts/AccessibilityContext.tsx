import React, { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  fontSize: 'small' | 'normal' | 'large' | 'extra-large'
  reducedMotion: boolean
  screenReaderAnnouncements: boolean
  keyboardNavigation: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  toggleHighContrast: () => void
  setFontSize: (size: AccessibilitySettings['fontSize']) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
  toggleReducedMotion: () => void
  toggleScreenReaderAnnouncements: () => void
  announce: (message: string, priority?: 'polite' | 'assertive') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('accessibility-settings')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    
    return {
      highContrast: false,
      fontSize: 'normal',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      screenReaderAnnouncements: true,
      keyboardNavigation: true,
    }
  })

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Font size
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large')
    root.classList.add(`font-${settings.fontSize}`)
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
  }, [settings])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
  }

  const setFontSize = (fontSize: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize }))
  }

  const increaseFontSize = () => {
    const sizes: AccessibilitySettings['fontSize'][] = ['small', 'normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(settings.fontSize)
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    }
  }

  const decreaseFontSize = () => {
    const sizes: AccessibilitySettings['fontSize'][] = ['small', 'normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(settings.fontSize)
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  const resetFontSize = () => setFontSize('normal')

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }

  const toggleScreenReaderAnnouncements = () => {
    setSettings(prev => ({ ...prev, screenReaderAnnouncements: !prev.screenReaderAnnouncements }))
  }

  // Screen reader announcements
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderAnnouncements) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const value = {
    settings,
    toggleHighContrast,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleReducedMotion,
    toggleScreenReaderAnnouncements,
    announce,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}