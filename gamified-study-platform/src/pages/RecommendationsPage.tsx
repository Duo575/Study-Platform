import React, { useState } from 'react';
import { Lightbulb, TrendingUp, Clock, Target, BookOpen, Settings } from 'lucide-react';
import RecommendationsDashboard from '../components/features/RecommendationsDashboard';
import { useAuth } from '../contexts/AuthContext';

const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'insights' | 'settings'>('dashboard');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your study recommendations.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard' as const,
      name: 'Recommendations',
      icon: Lightbulb,
      description: 'Personalized study suggestions',
    },
    {
      id: 'insights' as const,
      name: 'Insights',
      icon: TrendingUp,
      description: 'Performance analysis',
    },
    {
      id: 'settings' as const,
      name: 'Settings',
      icon: Settings,
      description: 'Customize recommendations',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Smart Study Recommendations</h1>
                <p className="text-gray-600 mt-1">
                  AI-powered insights to optimize your learning journey
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <RecommendationsDashboard userId={user.id} />
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Study Patterns</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your peak performance hours are 9-11 AM
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Goal Progress</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    73% completion rate this month
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900">Subject Focus</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Mathematics needs more attention
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Analytics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Study Consistency</h3>
                    <p className="text-sm text-gray-600">Average sessions per week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">4.2</p>
                    <p className="text-sm text-green-600">↑ 15% from last month</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Focus Duration</h3>
                    <p className="text-sm text-gray-600">Average session length</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">42min</p>
                    <p className="text-sm text-gray-600">Optimal range</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Retention Rate</h3>
                    <p className="text-sm text-gray-600">Knowledge retention score</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">78%</p>
                    <p className="text-sm text-yellow-600">Room for improvement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Email me new recommendations
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Push notifications for critical recommendations
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Weekly recommendation summary
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendation Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Study Schedule Optimization',
                      'Subject Focus Suggestions',
                      'Study Method Recommendations',
                      'Break and Rest Reminders',
                      'Goal Adjustment Advice',
                      'Habit Formation Tips',
                    ].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">AI Personalization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recommendation Frequency
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Daily</option>
                        <option selected>Every 2-3 days</option>
                        <option>Weekly</option>
                        <option>As needed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Learning Style Preference
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Visual Learner</option>
                        <option>Auditory Learner</option>
                        <option>Kinesthetic Learner</option>
                        <option selected>Mixed Learning Style</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Challenge Level
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Conservative (gradual improvement)</option>
                        <option selected>Balanced (moderate challenges)</option>
                        <option>Aggressive (ambitious goals)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;