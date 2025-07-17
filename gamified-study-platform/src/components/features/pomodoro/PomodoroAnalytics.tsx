import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { usePomodoro } from '../../../hooks/usePomodoro';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type AnalyticsView = 'overview' | 'daily' | 'weekly' | 'subjects' | 'productivity';

export const PomodoroAnalytics: React.FC = () => {
  const { analytics, isLoading, refreshData } = usePomodoro();
  const [activeView, setActiveView] = useState<AnalyticsView>('overview');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          No analytics data available yet.
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Complete some Pomodoro sessions to see your productivity insights!
        </p>
        <Button onClick={refreshData} variant="primary">
          Refresh Data
        </Button>
      </Card>
    );
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {analytics.totalSessions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Sessions
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {Math.round(analytics.totalFocusTime / 60)}h
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Focus Time
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {Math.round(analytics.completionRate)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completion Rate
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {analytics.streakDays}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Streak
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDailyChart = () => {
    const last14Days = analytics.dailyStats.slice(-14);
    
    const data = {
      labels: last14Days.map(stat => format(parseISO(stat.date), 'MMM dd')),
      datasets: [
        {
          label: 'Focus Time (minutes)',
          data: last14Days.map(stat => stat.focusTime),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Sessions Completed',
          data: last14Days.map(stat => stat.sessionsCompleted),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Daily Progress (Last 14 Days)',
        },
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Focus Time (minutes)',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Sessions',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    return (
      <Card className="p-6">
        <Line data={data} options={options} />
      </Card>
    );
  };

  const renderWeeklyChart = () => {
    const data = {
      labels: analytics.weeklyStats.map(stat => 
        format(parseISO(stat.weekStart), 'MMM dd')
      ),
      datasets: [
        {
          label: 'Focus Time (hours)',
          data: analytics.weeklyStats.map(stat => Math.round(stat.focusTime / 60)),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Sessions Completed',
          data: analytics.weeklyStats.map(stat => stat.sessionsCompleted),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Weekly Progress',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return (
      <Card className="p-6">
        <Bar data={data} options={options} />
      </Card>
    );
  };

  const renderSubjectsChart = () => {
    if (analytics.subjectBreakdown.length === 0) {
      return (
        <Card className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            No subject data available. Start studying with specific courses to see subject breakdown!
          </div>
        </Card>
      );
    }

    const data = {
      labels: analytics.subjectBreakdown.map(subject => subject.courseName),
      datasets: [
        {
          data: analytics.subjectBreakdown.map(subject => subject.focusTime),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 101, 101, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: 'Focus Time by Subject',
        },
      },
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Doughnut data={data} options={options} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subject Details
          </h3>
          <div className="space-y-4">
            {analytics.subjectBreakdown.map((subject, index) => (
              <div key={subject.courseId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: data.datasets[0].backgroundColor[index % data.datasets[0].backgroundColor.length] 
                    }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subject.courseName}
                  </span>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(subject.focusTime / 60)}h {subject.focusTime % 60}m
                  </div>
                  <div className="text-gray-500">
                    {subject.sessionsCompleted} sessions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderProductivityChart = () => {
    const hourLabels = Array.from({ length: 24 }, (_, i) => 
      `${i.toString().padStart(2, '0')}:00`
    );
    
    // Create productivity data for all hours
    const productivityData = Array.from({ length: 24 }, (_, hour) => {
      const sessionsInHour = analytics.dailyStats.reduce((total, day) => {
        // This is simplified - in a real implementation, you'd track sessions by hour
        return total + (analytics.peakHours.includes(hour) ? day.sessionsCompleted / 3 : 0);
      }, 0);
      return sessionsInHour;
    });

    const data = {
      labels: hourLabels,
      datasets: [
        {
          label: 'Productivity Score',
          data: productivityData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Productivity by Hour of Day',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Productivity Score',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Hour of Day',
          },
        },
      },
    };

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Bar data={data} options={options} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Peak Productivity Hours
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {analytics.peakHours.map((hour, index) => (
              <div key={hour} className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Peak #{index + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            These are your most productive hours based on completed focus sessions.
          </p>
        </Card>
      </div>
    );
  };

  const views = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'weekly', label: 'Weekly', icon: '📈' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'productivity', label: 'Productivity', icon: '⏰' },
  ];

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="flex flex-wrap gap-2">
        {views.map((view) => (
          <Button
            key={view.id}
            variant={activeView === view.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView(view.id as AnalyticsView)}
          >
            {view.icon} {view.label}
          </Button>
        ))}
      </div>

      {/* Overview Stats */}
      {activeView === 'overview' && renderOverview()}

      {/* Charts */}
      {activeView === 'daily' && renderDailyChart()}
      {activeView === 'weekly' && renderWeeklyChart()}
      {activeView === 'subjects' && renderSubjectsChart()}
      {activeView === 'productivity' && renderProductivityChart()}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refreshData} variant="outline" size="sm">
          🔄 Refresh Data
        </Button>
      </div>
    </div>
  );
};