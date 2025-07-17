import React, { useMemo } from 'react'
import { StudySession } from '../../../types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subMonths } from 'date-fns'

interface StreakCalendarProps {
  studySessions: StudySession[]
  monthsToShow?: number
}

export function StreakCalendar({ studySessions, monthsToShow = 3 }: StreakCalendarProps) {
  const calendarData = useMemo(() => {
    const now = new Date()
    const months = []
    
    // Generate data for the specified number of months
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      const monthData = {
        name: format(monthDate, 'MMMM yyyy'),
        days: days.map(day => {
          const sessionsOnDay = studySessions.filter(session => 
            isSameDay(new Date(session.startTime), day)
          )
          
          const totalMinutes = sessionsOnDay.reduce((sum, session) => sum + session.duration, 0)
          
          return {
            date: day,
            hasStudy: sessionsOnDay.length > 0,
            studyMinutes: totalMinutes,
            sessionCount: sessionsOnDay.length,
            isToday: isToday(day),
            intensity: getIntensity(totalMinutes)
          }
        })
      }
      
      months.push(monthData)
    }
    
    return months
  }, [studySessions, monthsToShow])

  function getIntensity(minutes: number): 'none' | 'low' | 'medium' | 'high' {
    if (minutes === 0) return 'none'
    if (minutes < 30) return 'low'
    if (minutes < 90) return 'medium'
    return 'high'
  }

  function getIntensityColor(intensity: string, isToday: boolean): string {
    if (isToday) {
      return 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800'
    }
    
    switch (intensity) {
      case 'none':
        return 'bg-gray-100 dark:bg-gray-700'
      case 'low':
        return 'bg-green-200 dark:bg-green-800'
      case 'medium':
        return 'bg-green-400 dark:bg-green-600'
      case 'high':
        return 'bg-green-600 dark:bg-green-500'
      default:
        return 'bg-gray-100 dark:bg-gray-700'
    }
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const totalStudyDays = useMemo(() => {
    return calendarData.reduce((total, month) => 
      total + month.days.filter(day => day.hasStudy).length, 0
    )
  }, [calendarData])

  const currentStreak = useMemo(() => {
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)
    
    while (true) {
      const hasStudyOnDate = studySessions.some(session => 
        isSameDay(new Date(session.startTime), currentDate)
      )
      
      if (!hasStudyOnDate) {
        break
      }
      
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }, [studySessions])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Study days: </span>
          <span className="font-medium text-gray-900 dark:text-white">{totalStudyDays}</span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Current streak: </span>
          <span className="font-medium text-gray-900 dark:text-white">{currentStreak} days</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {calendarData.map((month) => (
          <div key={month.name} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {month.name}
            </h4>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 dark:text-gray-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: month.days[0].date.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="w-6 h-6" />
              ))}
              
              {/* Month days */}
              {month.days.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={`
                    w-6 h-6 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110
                    ${getIntensityColor(day.intensity, day.isToday)}
                  `}
                  title={
                    day.hasStudy 
                      ? `${format(day.date, 'MMM d')}: ${formatDuration(day.studyMinutes)} (${day.sessionCount} sessions)`
                      : `${format(day.date, 'MMM d')}: No study time`
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}