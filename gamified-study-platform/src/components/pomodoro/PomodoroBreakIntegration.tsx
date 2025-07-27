import React from 'react';
import { PlayIcon, CogIcon } from '@heroicons/react/24/outline';
import { StudyBreakManager } from '../games/StudyBreakManager';
import { useStudyBreaks } from '../../hooks/useStudyBreaks';
import { usePomodoroStore } from '../../store/pomodoroStore';

interface PomodoroBreakIntegrationProps {
  userId: string;
}

export const PomodoroBreakIntegration: React.FC<
  PomodoroBreakIntegrationProps
> = ({ userId }) => {
  const { timer, stopTimer, skipSession } = usePomodoroStore();
  const {
    breakState,
    breakSettings,
    startBreakManager,
    endBreakManager,
    updateBreakSettings,
    canPlayGames,
    gameTimeRemaining,
    formatTime,
    breakStats,
  } = useStudyBreaks(userId);

  const handleBreakComplete = async () => {
    endBreakManager();
    await stopTimer(userId, true);
  };

  const handleSkipBreak = async () => {
    endBreakManager();
    await skipSession(userId);
  };

  const toggleGamesDuringBreaks = () => {
    updateBreakSettings({
      enableGamesDuringBreaks: !breakSettings.enableGamesDuringBreaks,
    });
  };

  const updateMaxGameTime = (percentage: number) => {
    updateBreakSettings({
      maxGameTimePercentage: Math.max(0, Math.min(100, percentage)),
    });
  };

  // Show StudyBreakManager if it's break time and manager is active
  if (breakState.isBreakTime && breakState.showBreakManager) {
    return (
      <StudyBreakManager
        userId={userId}
        breakType={breakState.breakType!}
        breakDuration={breakState.breakDuration}
        onBreakComplete={handleBreakComplete}
        onSkipBreak={handleSkipBreak}
      />
    );
  }

  // Show break notification if it's break time but manager is not active
  if (breakState.isBreakTime && !breakState.showBreakManager) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">
              {breakState.breakType === 'short_break' ? '☕' : '🧘‍♂️'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {breakState.breakType === 'short_break'
                ? 'Short Break Time!'
                : 'Long Break Time!'}
            </h2>
            <p className="text-gray-600">
              Time to rest and recharge. You've earned it!
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatTime(timer.timeRemaining)}
            </div>
            <div className="text-sm text-gray-600">Break Time Remaining</div>
          </div>

          {breakSettings.enableGamesDuringBreaks && canPlayGames && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800 mb-1">
                🎮 Games Available
              </div>
              <div className="text-xs text-green-600">
                Up to {formatTime(gameTimeRemaining)} of game time allowed
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={startBreakManager}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start Break Activities</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleSkipBreak}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip Break
              </button>
              <button
                onClick={handleBreakComplete}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                End Break
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show break settings panel during work sessions
  if (timer.sessionType === 'work') {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            Break Settings
          </h3>
        </div>

        <div className="space-y-3">
          {/* Games Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Enable games during breaks
            </span>
            <button
              onClick={toggleGamesDuringBreaks}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                breakSettings.enableGamesDuringBreaks
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  breakSettings.enableGamesDuringBreaks
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Game Time Limit */}
          {breakSettings.enableGamesDuringBreaks && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Max game time</span>
                <span className="text-sm font-medium text-blue-600">
                  {breakSettings.maxGameTimePercentage}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                value={breakSettings.maxGameTimePercentage}
                onChange={e => updateMaxGameTime(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>90%</span>
              </div>
            </div>
          )}

          {/* Break Stats */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Break Statistics</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-medium text-gray-700">
                  {breakStats.totalBreaks}
                </div>
                <div className="text-gray-500">Total breaks</div>
              </div>
              <div>
                <div className="font-medium text-gray-700">
                  {Math.floor(breakStats.gameTimePercentage)}%
                </div>
                <div className="text-gray-500">Game time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
