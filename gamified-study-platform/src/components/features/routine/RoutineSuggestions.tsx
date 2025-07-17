import React, { useEffect } from 'react';
import { Lightbulb, CheckCircle, X, RefreshCw, Clock, Target, TrendingUp } from 'lucide-react';
import { useRoutineStore } from '../../../store/routineStore';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import type { RoutineSuggestion, SuggestionType } from '../../../types';

const SUGGESTION_ICONS: Record<SuggestionType, React.ReactNode> = {
  time_optimization: <Clock className="w-5 h-5" />,
  conflict_resolution: <Target className="w-5 h-5" />,
  productivity_boost: <TrendingUp className="w-5 h-5" />,
};

const SUGGESTION_COLORS: Record<SuggestionType, string> = {
  time_optimization: 'text-blue-600 dark:text-blue-400',
  conflict_resolution: 'text-red-600 dark:text-red-400',
  productivity_boost: 'text-green-600 dark:text-green-400',
};

const PRIORITY_LABELS: Record<number, { label: string; variant: any }> = {
  1: { label: 'Low', variant: 'secondary' },
  2: { label: 'Medium', variant: 'default' },
  3: { label: 'Medium', variant: 'default' },
  4: { label: 'High', variant: 'warning' },
  5: { label: 'Critical', variant: 'error' },
};

export const RoutineSuggestions: React.FC = () => {
  const {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    generateSuggestions,
    applySuggestion,
    dismissSuggestion,
  } = useRoutineStore();

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApplySuggestion = async (suggestion: RoutineSuggestion) => {
    try {
      await applySuggestion(suggestion.id);
      // TODO: Apply the actual changes based on suggestion.suggestedChanges
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const handleDismissSuggestion = async (suggestionId: string) => {
    try {
      await dismissSuggestion(suggestionId);
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  const handleGenerateNew = async () => {
    try {
      await generateSuggestions();
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  };

  const formatSuggestionType = (type: SuggestionType): string => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading && suggestions.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Routine Suggestions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered recommendations to optimize your routines
          </p>
        </div>
        
        <Button
          onClick={handleGenerateNew}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Generate New
        </Button>
      </div>

      {error && (
        <Card className="p-6 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900">
          <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
            <X className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <Lightbulb className="w-16 h-16 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-semibold mb-3">No Suggestions Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Use your routines for a few days to get personalized optimization suggestions.
            </p>
            <Button onClick={handleGenerateNew} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Check for Suggestions
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions
            .sort((a, b) => b.priority - a.priority)
            .map((suggestion) => (
              <Card key={suggestion.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${SUGGESTION_COLORS[suggestion.suggestionType]}`}>
                    {SUGGESTION_ICONS[suggestion.suggestionType]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {suggestion.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            {formatSuggestionType(suggestion.suggestionType)}
                          </Badge>
                          <Badge
                            {...PRIORITY_LABELS[suggestion.priority]}
                            size="sm"
                          >
                            {PRIORITY_LABELS[suggestion.priority].label} Priority
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissSuggestion(suggestion.id)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {suggestion.description}
                    </p>

                    {/* Suggested Changes Preview */}
                    {suggestion.suggestedChanges && Object.keys(suggestion.suggestedChanges).length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Suggested Changes:
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {Object.entries(suggestion.suggestedChanges).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span>{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApplySuggestion(suggestion)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Apply Suggestion
                      </Button>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Created {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              How Suggestions Work
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>• <strong>Time Optimization:</strong> Suggestions to improve your schedule efficiency</p>
              <p>• <strong>Conflict Resolution:</strong> Help resolve scheduling conflicts and overlaps</p>
              <p>• <strong>Productivity Boost:</strong> Recommendations based on your completion patterns</p>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
              Suggestions are generated based on your routine usage patterns and performance data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};