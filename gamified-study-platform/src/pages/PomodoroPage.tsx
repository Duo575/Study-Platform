import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PomodoroTimer, PomodoroAnalytics } from '../components/features/pomodoro';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCourseStore } from '../store/courseStore';
import { useTodoStore } from '../store/todoStore';
import { useQuestStore } from '../store/questStore';
import { useAuthContext } from '../contexts/AuthContext';

type TabType = 'timer' | 'analytics';

export const PomodoroPage: React.FC = () => {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>('timer');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTodoId, setSelectedTodoId] = useState<string>('');
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');

  const { courses, loadCourses } = useCourseStore();
  const { todos, loadTodos } = useTodoStore();
  const { activeQuests, loadQuests } = useQuestStore();

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadCourses(user.id);
      loadTodos(user.id);
      loadQuests(user.id);
    }
  }, [user?.id, loadCourses, loadTodos, loadQuests]);

  const tabs = [
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  const activeTodos = todos.filter(todo => !todo.completed);
  const availableQuests = activeQuests.filter(quest => quest.status === 'available' || quest.status === 'active');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🍅 Pomodoro Focus Timer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Boost your productivity with the proven Pomodoro Technique. 
            Focus for 25 minutes, take a 5-minute break, and track your progress.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as TabType)}
                className="mx-1"
              >
                {tab.icon} {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Timer */}
              <div className="lg:col-span-2">
                <PomodoroTimer
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  todoItemId={selectedTodoId}
                  questId={selectedQuestId}
                  onCourseChange={setSelectedCourseId}
                />
              </div>

              {/* Context Panel */}
              <div className="space-y-6">
                {/* Quick Context Selection */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Study Context
                  </h3>
                  <div className="space-y-4">
                    {/* Active Todos */}
                    {activeTodos.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Task
                        </label>
                        <select
                          value={selectedTodoId}
                          onChange={(e) => setSelectedTodoId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">No specific task</option>
                          {activeTodos.slice(0, 5).map(todo => (
                            <option key={todo.id} value={todo.id}>
                              {todo.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Active Quests */}
                    {availableQuests.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Active Quest
                        </label>
                        <select
                          value={selectedQuestId}
                          onChange={(e) => setSelectedQuestId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">No specific quest</option>
                          {availableQuests.slice(0, 3).map(quest => (
                            <option key={quest.id} value={quest.id}>
                              {quest.title} ({quest.xpReward} XP)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Pomodoro Tips */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    💡 Pomodoro Tips
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Choose one specific task before starting</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Eliminate distractions (phone, notifications)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Take breaks seriously - they're part of the technique</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Track what you accomplish in each session</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>Adjust timing if needed, but stay consistent</span>
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🎯 Quick Stats
                  </h3>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>Complete your first Pomodoro session to see your stats here!</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="max-w-5xl mx-auto">
              <PomodoroAnalytics />
            </div>
          )}
        </motion.div>

        {/* Getting Started Guide */}
        {activeTab === 'timer' && (
          <Card className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚀 Ready to Focus?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                The Pomodoro Technique is simple: work for 25 minutes, take a 5-minute break, 
                and repeat. After 4 sessions, take a longer 15-30 minute break. 
                This helps maintain focus and prevents burnout.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-medium text-gray-900 dark:text-white">Focus</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">25 minutes</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">☕</div>
                  <div className="font-medium text-gray-900 dark:text-white">Short Break</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">5 minutes</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="font-medium text-gray-900 dark:text-white">Repeat</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">3 more times</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🏖️</div>
                  <div className="font-medium text-gray-900 dark:text-white">Long Break</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">15-30 minutes</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};