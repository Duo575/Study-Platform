import React from 'react'
import { clsx } from 'clsx'

interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  center?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Container({
  children,
  size = 'lg',
  padding = 'md',
  center = true,
  className = '',
  as: Component = 'div'
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16'
  }

  return (
    <Component
      className={clsx(
        'w-full',
        sizeClasses[size],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Specialized container components
export function PageContainer({ children, ...props }: Omit<ContainerProps, 'size'>) {
  return <Container size="xl" {...props}>{children}</Container>
}

export function ContentContainer({ children, ...props }: Omit<ContainerProps, 'size'>) {
  return <Container size="lg" {...props}>{children}</Container>
}

export function NarrowContainer({ children, ...props }: Omit<ContainerProps, 'size'>) {
  return <Container size="md" {...props}>{children}</Container>
}