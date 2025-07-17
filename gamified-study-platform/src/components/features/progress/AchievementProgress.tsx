import React from 'react'
import { Achievement } from '../../../types'
import { Badge } from '../../ui/Badge'
import { ProgressBar } from '../../ui/ProgressBar'
import { formatDistanceToNow } from 'date-fns'

interface AchievementProgressProps {
  achievements: Achievement[]
  showAll?: boolean
}

export function AchievementProgress({ achievements, showAll = false }: AchievementProgressProps) {
  const recentAchievements = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, showAll ? achievements.length : 5)

  const inProgressAchievements = achievements
    .filter(a => !a.unlockedAt && a.progress)
    .sort((a, b) => {
      const progressA = a.progress ? (a.progress.current / a.progress.target) : 0
      const progressB = b.progress ? (b.progress.current / b.progress.target) : 0
      return progressB - progressA
    })
    .slice(0, 3)

  function getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'rare':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'study_time':
        return '⏰'
      case 'consistency':
        return '🔥'
      case 'quest_completion':
        return '🎯'
      case 'pet_care':
        return '🐾'
      case 'social':
        return '👥'
      case 'special_event':
        return '🌟'
      default:
        return '🏆'
    }
  }

  if (achievements.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No achievements yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Recently Unlocked
          </h4>
          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="text-2xl">{getCategoryIcon(achievement.category)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {achievement.title}
                    </h5>
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-green-600 dark:text-green-400">
                      +{achievement.xpReward} XP
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(achievement.unlockedAt!), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            In Progress
          </h4>
          <div className="space-y-3">
            {inProgressAchievements.map((achievement) => {
              const progress = achievement.progress!
              const progressPercentage = (progress.current / progress.target) * 100
              
              return (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-xl opacity-60">{getCategoryIcon(achievement.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {achievement.title}
                      </h5>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {progress.description}
                    </p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {progress.current} / {progress.target}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <ProgressBar 
                        progress={progressPercentage}
                        color="blue"
                        height="h-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        +{achievement.xpReward} XP when unlocked
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Show all button */}
      {!showAll && achievements.length > 8 && (
        <div className="text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all {achievements.length} achievements
          </button>
        </div>
      )}
    </div>
  )
}