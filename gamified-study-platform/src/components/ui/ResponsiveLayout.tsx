import React from 'react'
import { clsx } from 'clsx'
import { useIsMobile, useIsTablet } from '../../hooks/useResponsive'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  variant?: 'stack' | 'sidebar' | 'grid' | 'masonry'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  className?: string
  // Sidebar specific props
  sidebarWidth?: 'sm' | 'md' | 'lg'
  sidebarPosition?: 'left' | 'right'
  collapseSidebar?: boolean
  // Grid specific props
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export function ResponsiveLayout({
  children,
  variant = 'stack',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  className = '',
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  collapseSidebar = true,
  columns = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const sidebarWidthClasses = {
    sm: 'w-48 lg:w-56',
    md: 'w-56 lg:w-64',
    lg: 'w-64 lg:w-72'
  }

  // Stack layout (default)
  if (variant === 'stack') {
    return (
      <div className={clsx(
        'flex flex-col',
        gapClasses[gap],
        alignClasses[align],
        className
      )}>
        {children}
      </div>
    )
  }

  // Sidebar layout
  if (variant === 'sidebar') {
    const childrenArray = React.Children.toArray(children)
    const sidebar = childrenArray[0]
    const main = childrenArray.slice(1)

    if (isMobile && collapseSidebar) {
      // Stack on mobile
      return (
        <div className={clsx('flex flex-col', gapClasses[gap], className)}>
          {sidebar}
          <div className="flex-1">
            {main}
          </div>
        </div>
      )
    }

    return (
      <div className={clsx(
        'flex',
        gapClasses[gap],
        sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row',
        className
      )}>
        <aside className={clsx(
          'flex-shrink-0',
          sidebarWidthClasses[sidebarWidth]
        )}>
          {sidebar}
        </aside>
        <main className="flex-1 min-w-0">
          <div className={clsx('flex flex-col', gapClasses[gap])}>
            {main}
          </div>
        </main>
      </div>
    )
  }

  // Grid layout
  if (variant === 'grid') {
    const gridCols = isMobile ? columns.mobile : isTablet ? columns.tablet : columns.desktop

    return (
      <div className={clsx(
        'grid',
        `grid-cols-${gridCols}`,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}>
        {children}
      </div>
    )
  }

  // Masonry layout (CSS Grid approximation)
  if (variant === 'masonry') {
    return (
      <div className={clsx(
        'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
        gapClasses[gap],
        className
      )}>
        {React.Children.map(children, (child, index) => (
          <div key={index} className="break-inside-avoid mb-4">
            {child}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Specialized layout components
export function StackLayout({ children, ...props }: Omit<ResponsiveLayoutProps, 'variant'>) {
  return <ResponsiveLayout variant="stack" {...props}>{children}</ResponsiveLayout>
}

export function SidebarLayout({ children, ...props }: Omit<ResponsiveLayoutProps, 'variant'>) {
  return <ResponsiveLayout variant="sidebar" {...props}>{children}</ResponsiveLayout>
}

export function GridLayout({ children, ...props }: Omit<ResponsiveLayoutProps, 'variant'>) {
  return <ResponsiveLayout variant="grid" {...props}>{children}</ResponsiveLayout>
}

export function MasonryLayout({ children, ...props }: Omit<ResponsiveLayoutProps, 'variant'>) {
  return <ResponsiveLayout variant="masonry" {...props}>{children}</ResponsiveLayout>
}