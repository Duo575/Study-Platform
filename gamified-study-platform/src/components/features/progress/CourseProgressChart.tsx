import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { Course } from '../../../types'
import { ProgressBar } from '../../ui/ProgressBar'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CourseProgressChartProps {
  courses: Course[]
  subjectBreakdown: Array<{
    courseId: string
    courseName: string
    timeSpent: number
    percentage: number
  }>
}

export function CourseProgressChart({ courses, subjectBreakdown }: CourseProgressChartProps) {
  // Generate colors for courses
  const generateColors = (count: number) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // yellow
      '#EF4444', // red
      '#8B5CF6', // purple
      '#06B6D4', // cyan
      '#F97316', // orange
      '#84CC16', // lime
      '#EC4899', // pink
      '#6B7280'  // gray
    ]
    
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  }

  const chartData = {
    labels: subjectBreakdown.map(item => item.courseName),
    datasets: [
      {
        data: subjectBreakdown.map(item => item.timeSpent),
        backgroundColor: generateColors(subjectBreakdown.length),
        borderColor: generateColors(subjectBreakdown.length).map(color => color + '80'),
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            const hours = Math.round(value / 60 * 10) / 10
            return `${label}: ${hours}h (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p>No courses available</p>
          <p className="text-sm mt-1">Add your first course to see progress here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Doughnut Chart */}
      {subjectBreakdown.length > 0 ? (
        <div className="h-48">
          <Doughnut data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p>No study time data available</p>
            <p className="text-sm mt-1">Start studying to see subject breakdown!</p>
          </div>
        </div>
      )}

      {/* Course Progress List */}
      <div className="space-y-3 mt-6">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Course Progress</h4>
        {courses.slice(0, 5).map((course) => (
          <div key={course.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {course.name}
                </p>
                <div className="mt-1">
                  <ProgressBar 
                    progress={course.progress.completionPercentage}
                    color={course.color}
                    height="h-1.5"
                  />
                </div>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.round(course.progress.completionPercentage)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {course.progress.topicsCompleted}/{course.progress.totalTopics}
              </p>
            </div>
          </div>
        ))}
        
        {courses.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View all {courses.length} courses
            </button>
          </div>
        )}
      </div>
    </div>
  )
}