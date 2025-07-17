import React from 'react'
import { clsx } from 'clsx'

interface ResponsiveCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  interactive?: boolean
  className?: string
  onClick?: () => void
  'aria-label'?: string
  role?: string
}

export function ResponsiveCard({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  className = '',
  onClick,
  'aria-label': ariaLabel,
  role,
  ...props
}: ResponsiveCardProps) {
  const baseClasses = 'rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2'
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-700'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10'
  }

  const interactiveClasses = interactive || onClick ? [
    'cursor-pointer',
    hover && 'hover:shadow-md hover:scale-[1.02]',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  ].filter(Boolean).join(' ') : ''

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
      {...props}
    >
      {children}
    </Component>
  )
}