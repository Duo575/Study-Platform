import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { useIsMobile, useIsTablet } from '../../hooks/useResponsive'
import { useKeyboardNavigation, useFocusTrap } from '../../hooks/useAccessibility'
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface NavigationItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
  children?: NavigationItem[]
}

interface ResponsiveNavigationProps {
  items: NavigationItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'tabs' | 'pills' | 'underline' | 'sidebar'
  size?: 'sm' | 'md' | 'lg'
  activeId?: string
  onItemClick?: (item: NavigationItem) => void
  className?: string
  'aria-label'?: string
}

export function ResponsiveNavigation({
  items,
  orientation = 'horizontal',
  variant = 'tabs',
  size = 'md',
  activeId,
  onItemClick,
  className = '',
  'aria-label': ariaLabel = 'Navigation'
}: ResponsiveNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const { announce } = useAccessibility()
  const mobileMenuRef = useFocusTrap(isMobileMenuOpen)

  // Keyboard navigation
  const { activeIndex, setActiveIndex } = useKeyboardNavigation(
    items,
    (index) => {
      const item = items[index]
      if (item && !item.disabled) {
        handleItemClick(item)
      }
    },
    true,
    {
      orientation: isMobile ? 'vertical' : orientation,
      typeahead: true
    }
  )

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return

    if (item.children && item.children.length > 0) {
      // Toggle submenu
      setExpandedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(item.id)) {
          newSet.delete(item.id)
          announce(`${item.label} menu collapsed`)
        } else {
          newSet.add(item.id)
          announce(`${item.label} menu expanded`)
        }
        return newSet
      })
    } else {
      // Navigate to item
      if (item.onClick) {
        item.onClick()
      }
      onItemClick?.(item)
      
      if (isMobile) {
        setIsMobileMenuOpen(false)
      }
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    announce(isMobileMenuOpen ? 'Menu closed' : 'Menu opened')
  }

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200'
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  }

  const variantClasses = {
    tabs: 'border-b-2 border-transparent hover:border-gray-300 data-[active=true]:border-primary-500 data-[active=true]:text-primary-600',
    pills: 'rounded-md hover:bg-gray-100 data-[active=true]:bg-primary-100 data-[active=true]:text-primary-700',
    underline: 'border-b-2 border-transparent hover:border-gray-300 data-[active=true]:border-primary-500',
    sidebar: 'rounded-md hover:bg-gray-100 data-[active=true]:bg-primary-100 data-[active=true]:text-primary-700'
  }

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activeId === item.id
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <li key={item.id} role="none">
        <button
          type="button"
          className={clsx(
            baseClasses,
            sizeClasses[size],
            variantClasses[variant],
            'flex items-center justify-between w-full text-left min-h-[44px]',
            level > 0 && 'ml-4',
            item.disabled && 'opacity-50 cursor-not-allowed',
            isActive && 'font-medium'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          data-active={isActive}
          aria-current={isActive ? 'page' : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
        >
          <span className="flex items-center">
            {item.icon && (
              <span className="mr-2" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {item.badge && (
              <span 
                className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center"
                aria-label={`${item.badge} items`}
              >
                {item.badge}
              </span>
            )}
          </span>
          {hasChildren && (
            <svg
              className={clsx(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {hasChildren && isExpanded && (
          <ul role="menu" className="mt-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  // Mobile hamburger menu
  if (isMobile) {
    return (
      <nav className={clsx('relative', className)} aria-label={ariaLabel}>
        {/* Mobile menu button */}
        <button
          type="button"
          className={clsx(
            baseClasses,
            'flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          )}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div
              ref={mobileMenuRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
              role="menu"
            >
              <ul role="none" className="py-2">
                {items.map(item => renderNavigationItem(item))}
              </ul>
            </div>
          </>
        )}
      </nav>
    )
  }

  // Desktop navigation
  const orientationClasses = orientation === 'horizontal' 
    ? 'flex flex-row space-x-1' 
    : 'flex flex-col space-y-1'

  return (
    <nav className={clsx(className)} aria-label={ariaLabel}>
      <ul role="menubar" className={clsx(orientationClasses)}>
        {items.map(item => renderNavigationItem(item))}
      </ul>
    </nav>
  )
}

// Specialized navigation components
export function TabNavigation(props: Omit<ResponsiveNavigationProps, 'variant'>) {
  return <ResponsiveNavigation variant="tabs" {...props} />
}

export function PillNavigation(props: Omit<ResponsiveNavigationProps, 'variant'>) {
  return <ResponsiveNavigation variant="pills" {...props} />
}

export function SidebarNavigation(props: Omit<ResponsiveNavigationProps, 'variant' | 'orientation'>) {
  return <ResponsiveNavigation variant="sidebar" orientation="vertical" {...props} />
}