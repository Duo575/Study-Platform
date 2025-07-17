import React from 'react'
import { useTodoSelectors } from '../../../store/todoStore'
import { Card } from '../../ui/Card'
import { ProgressBar } from '../../ui/ProgressBar'
import { 
  ListTodo, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp
} from 'lucide-react'

export const TodoStats: React.FC = () => {
  const { stats } = useTodoSelectors()

  if (!stats) {
    return null
  }

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  const timeCompletionPercentage = stats.totalEstimatedTime > 0 
    ? (stats.completedTime / stats.totalEstimatedTime) * 100 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overview Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Overview
          </h3>
          <ListTodo className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{stats.completed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.pending}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{stats.overdue}</span>
          </div>
        </div>
      </Card>

      {/* Completion Rate Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Completion Rate
          </h3>
          <Target className="h-5 w-5 text-green-600" />
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {completionPercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasks Completed
            </p>
          </div>
          
          <ProgressBar 
            progress={completionPercentage} 
            className="h-2"
            color="green"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{stats.completed} completed</span>
            <span>{stats.total} total</span>
          </div>
        </div>
      </Card>

      {/* Time Tracking Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Time Progress
          </h3>
          <Clock className="h-5 w-5 text-purple-600" />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.completedTime / 60)}h
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Completed
              </p>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {Math.round(stats.totalEstimatedTime / 60)}h
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Est.
              </p>
            </div>
          </div>
          
          <ProgressBar 
            progress={timeCompletionPercentage} 
            className="h-2"
            color="purple"
          />
          
          <div className="text-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {timeCompletionPercentage.toFixed(1)}% Time Complete
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Actions Card */}
      <Card className="p-6 md:col-span-2 lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Insights
          </h3>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Productivity Score */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.completionRate.toFixed(0)}%
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Productivity Score
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Based on completion rate
            </p>
          </div>

          {/* Average Task Time */}
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.total > 0 ? Math.round(stats.totalEstimatedTime / stats.total) : 0}m
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
              Avg. Task Time
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Estimated duration
            </p>
          </div>

          {/* Efficiency Rating */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.overdue === 0 ? 'A+' : stats.overdue <= 2 ? 'B+' : 'C'}
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Deadline Rating
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {stats.overdue} overdue tasks
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}