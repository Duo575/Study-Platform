import React from 'react'
import { useBreakpoint, useScreenSize } from '../../hooks/useResponsive'

interface BreakpointIndicatorProps {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showDetails?: boolean
}

export function BreakpointIndicator({ 
  enabled = process.env.NODE_ENV === 'development',
  position = 'top-right',
  showDetails = false
}: BreakpointIndicatorProps) {
  const breakpoint = useBreakpoint()
  const { width, height } = useScreenSize()

  if (!enabled) return null

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const breakpointColors = {
    sm: 'bg-red-500',
    md: 'bg-yellow-500',
    lg: 'bg-green-500',
    xl: 'bg-blue-500',
    '2xl': 'bg-purple-500'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <div className="bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm font-mono">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${breakpointColors[breakpoint]}`} />
          <span className="font-bold">{breakpoint.toUpperCase()}</span>
          {showDetails && (
            <span className="text-gray-300">
              {width}×{height}
            </span>
          )}
        </div>
        {showDetails && (
          <div className="mt-1 text-xs text-gray-400">
            <div>Breakpoint: {breakpoint}</div>
            <div>Viewport: {width}×{height}</div>
          </div>
        )}
      </div>
    </div>
  )
}