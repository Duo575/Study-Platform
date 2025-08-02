import React from 'react';
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
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StudyTimeChartProps {
  data: Array<{
    week: string;
    studyTime: number;
    questsCompleted: number;
    xpEarned: number;
  }>;
  timeRange: string;
  detailed?: boolean;
}

export function StudyTimeChart({
  data,
  timeRange: _timeRange,
  detailed = false,
}: StudyTimeChartProps) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.week);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }),
    datasets: [
      {
        label: 'Study Time (hours)',
        data: data.map(item => Math.round((item.studyTime / 60) * 10) / 10), // Convert minutes to hours
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: detailed
          ? 'rgba(59, 130, 246, 0.1)'
          : 'rgba(59, 130, 246, 0.2)',
        fill: detailed,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(detailed
        ? [
            {
              label: 'XP Earned',
              data: data.map(item => item.xpEarned / 10), // Scale down XP for better visualization
              borderColor: 'rgb(168, 85, 247)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              fill: false,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5,
              yAxisID: 'y1',
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: 'rgb(107, 114, 128)',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.dataset.label || '';
            if (label === 'Study Time (hours)') {
              return `${label}: ${context.parsed.y}h`;
            } else if (label === 'XP Earned') {
              return `${label}: ${context.parsed.y * 10} XP`;
            }
            return `${label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          maxTicksLimit: 7,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: function (value: any) {
            return value + 'h';
          },
        },
        title: {
          display: true,
          text: 'Hours',
          color: 'rgb(107, 114, 128)',
        },
      },
      ...(detailed
        ? {
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              beginAtZero: true,
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color: 'rgb(107, 114, 128)',
                callback: function (value: any) {
                  return value * 10 + ' XP';
                },
              },
              title: {
                display: true,
                text: 'XP',
                color: 'rgb(107, 114, 128)',
              },
            },
          }
        : {}),
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p>No study data available</p>
          <p className="text-sm mt-1">
            Start studying to see your progress here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
}
