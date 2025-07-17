import React from 'react'
import { ProgressBar } from '../../ui/ProgressBar'
import { Button } from '../../ui/Button'

interface WeeklyGoalsProps {
  currentWeekStats: {
    studyTime: number // in minutes
    questsCompleted: number
    xpEarned: number
  }
  goals?: {
    studyTimeGoal: number // in minutes
    questsGoal: number
    xpGoal: number
  }
}

export function WeeklyGoals({ 
  currentWeekStats, 
  goals = {
    studyTimeGoal: 600, // 10 hours default
    questsGoal: 5,
    xpGoal: 1000
  }
}: WeeklyGoalsProps) {
  const studyTimeProgress = (currentWeekStats.studyTime / goals.studyTimeGoal) * 100
  const questsProgress = (currentWeekStats.questsCompleted / goals.questsGoal) * 100
  const xpProgress = (currentWeekStats.xpEarned / goals.xpGoal) * 100

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  function getProgressColor(progress: number): string {
    if (progress >= 100) return 'green'
    if (progress >= 75) return 'blue'
    if (progress >= 50) return 'yellow'
    return 'red'
  }

  function getProgressIcon(progress: number): string {
    if (progress >= 100) return '🎉'
    if (progress >= 75) return '🔥'
    if (progress >= 50) return '💪'
    return '📈'
  }

  const overallProgress = (studyTimeProgress + questsProgress + xpProgress) / 3

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
        <div className="text-2xl mb-2">{getProgressIcon(overallProgress)}</div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Weekly Progress
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {Math.round(overallProgress)}% of your weekly goals completed
        </p>
        <ProgressBar 
          progress={overallProgress}
          color={getProgressColor(overallProgress)}
          height="h-3"
        />
      </div>

      {/* Individual Goals */}
      <div className="space-y-4">
        {/* Study Time Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⏰</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Study Time
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDuration(currentWeekStats.studyTime)} / {formatDuration(goals.studyTimeGoal)}
            </span>
          </div>
          <ProgressBar 
            progress={studyTimeProgress}
            color={getProgressColor(studyTimeProgress)}
            height="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{Math.round(studyTimeProgress)}% complete</span>
            <span>
              {studyTimeProgress >= 100 
                ? '🎯 Goal achieved!' 
                : `${formatDuration(goals.studyTimeGoal - currentWeekStats.studyTime)} remaining`
              }
            </span>
          </div>
        </div>

        {/* Quests Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Quests Completed
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentWeekStats.questsCompleted} / {goals.questsGoal}
            </span>
          </div>
          <ProgressBar 
            progress={questsProgress}
            color={getProgressColor(questsProgress)}
            height="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{Math.round(questsProgress)}% complete</span>
            <span>
              {questsProgress >= 100 
                ? '🎯 Goal achieved!' 
                : `${goals.questsGoal - currentWeekStats.questsCompleted} quests remaining`
              }
            </span>
          </div>
        </div>

        {/* XP Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                XP Earned
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentWeekStats.xpEarned.toLocaleString()} / {goals.xpGoal.toLocaleString()}
            </span>
          </div>
          <ProgressBar 
            progress={xpProgress}
            color={getProgressColor(xpProgress)}
            height="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{Math.round(xpProgress)}% complete</span>
            <span>
              {xpProgress >= 100 
                ? '🎯 Goal achieved!' 
                : `${(goals.xpGoal - currentWeekStats.xpEarned).toLocaleString()} XP remaining`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1">
          Adjust Goals
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          View Details
        </Button>
      </div>

      {/* Motivational Message */}
      {overallProgress >= 100 && (
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            🎉 Congratulations! You've achieved all your weekly goals!
          </p>
        </div>
      )}
      
      {overallProgress < 50 && (
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            💪 Keep going! You're making great progress towards your goals.
          </p>
        </div>
      )}
    </div>
  )
}