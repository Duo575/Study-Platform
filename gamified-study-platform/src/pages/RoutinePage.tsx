import React, { useEffect, useState } from 'react';
import { Plus, Calendar, BarChart3, Settings, Lightbulb } from 'lucide-react';
import { useRoutineStore } from '../store/routineStore';
import { WeeklyScheduleView } from '../components/features/routine/WeeklyScheduleView';
import { RoutineList } from '../components/features/routine/RoutineList';
import { RoutineCreationWizard } from '../components/features/routine/RoutineCreationWizard';
import { RoutineAnalytics } from '../components/features/routine/RoutineAnalytics';
import { RoutineSuggestions } from '../components/features/routine/RoutineSuggestions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

type ViewMode = 'schedule' | 'list' | 'analytics' | 'suggestions';

export const RoutinePage: React.FC = () => {
  const {
    routines,
    activeRoutine,
    isLoading,
    error,
    fetchRoutines,
    fetchSuggestions,
    setActiveRoutine,
    clearError
  } = useRoutineStore();

  const [viewMode, setViewMode] = useState<ViewMode>('schedule');
  const [showCreationWizard, setShowCreationWizard] = useState(false);

  useEffect(() => {
    fetchRoutines();
    fetchSuggestions();
  }, [fetchRoutines, fetchSuggestions]);

  // Set first active routine as default if none selected
  useEffect(() => {
    if (!activeRoutine && routines.length > 0) {
      const firstActiveRoutine = routines.find(r => r.isActive) || routines[0];
      setActiveRoutine(firstActiveRoutine);
    }
  }, [routines, activeRoutine, setActiveRoutine]);

  const handleCreateRoutine = () => {
    setShowCreationWizard(true);
  };

  const handleWizardComplete = () => {
    setShowCreationWizard(false);
    fetchRoutines(); // Refresh routines list
  };

  if (isLoading && routines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Routine Board
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your study schedule and track your consistency
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateRoutine}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Routine
          </Button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={clearError}
        />
      )}

      {/* View Mode Tabs */}
      <Card className="p-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'schedule'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Schedule View
          </button>
          
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Manage Routines
          </button>
          
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'analytics'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          
          <button
            onClick={() => setViewMode('suggestions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'suggestions'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Suggestions
          </button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {viewMode === 'schedule' && (
          <WeeklyScheduleView 
            routine={activeRoutine}
            onRoutineChange={setActiveRoutine}
          />
        )}
        
        {viewMode === 'list' && (
          <RoutineList 
            onCreateRoutine={handleCreateRoutine}
          />
        )}
        
        {viewMode === 'analytics' && activeRoutine && (
          <RoutineAnalytics 
            routine={activeRoutine}
          />
        )}
        
        {viewMode === 'suggestions' && (
          <RoutineSuggestions />
        )}
        
        {viewMode === 'analytics' && !activeRoutine && (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Routine Selected</h3>
              <p>Select a routine to view analytics and performance data.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Empty State */}
      {routines.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <Calendar className="w-16 h-16 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold mb-3">No Routines Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first routine to start organizing your study schedule and building consistent habits.
            </p>
            <Button onClick={handleCreateRoutine} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Routine
            </Button>
          </div>
        </Card>
      )}

      {/* Creation Wizard Modal */}
      {showCreationWizard && (
        <RoutineCreationWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowCreationWizard(false)}
        />
      )}
    </div>
  );
};