import { format, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek } from 'date-fns'

/**
 * Format duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, formatString: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatString)
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return 'Today'
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday'
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Get the start and end of the current week
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  return {
    start: startOfWeek(now),
    end: endOfWeek(now)
  }
}

/**
 * Format time in 24-hour format
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm')
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'MMM d, yyyy HH:mm')
}

/**
 * Check if a date is within the current week
 */
export function isThisWeek(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const { start, end } = getCurrentWeekRange()
  return dateObj >= start && dateObj <= end
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1)
  const pastDaysOfYear = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Convert minutes to hours with decimal places
 */
export function minutesToHours(minutes: number, decimalPlaces: number = 1): number {
  return Math.round((minutes / 60) * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
}