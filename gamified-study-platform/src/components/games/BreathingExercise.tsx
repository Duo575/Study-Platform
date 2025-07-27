import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';

interface BreathingExerciseProps {
  onComplete: (score: number) => void;
  onExit: () => void;
  duration?: number; // in minutes
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  onComplete,
  onExit,
  duration = 5,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Breathing pattern: 4-4-4-4 (inhale-hold-exhale-pause)
  const breathingPattern = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
  };

  const phaseInstructions = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    pause: 'Pause',
  };

  const phaseColors = {
    inhale: 'from-blue-400 to-blue-600',
    hold: 'from-purple-400 to-purple-600',
    exhale: 'from-green-400 to-green-600',
    pause: 'from-gray-400 to-gray-600',
  };

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setPhaseTime(prev => prev + 0.1);
        setTotalTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    const currentPhaseDuration = breathingPattern[currentPhase];

    if (phaseTime >= currentPhaseDuration) {
      setPhaseTime(0);

      // Move to next phase
      switch (currentPhase) {
        case 'inhale':
          setCurrentPhase('hold');
          break;
        case 'hold':
          setCurrentPhase('exhale');
          break;
        case 'exhale':
          setCurrentPhase('pause');
          break;
        case 'pause':
          setCurrentPhase('inhale');
          setCycleCount(prev => prev + 1);
          break;
      }
    }
  }, [phaseTime, currentPhase]);

  useEffect(() => {
    // Check if exercise is complete
    if (totalTime >= duration * 60) {
      handleComplete();
    }
  }, [totalTime, duration]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    setPhaseTime(0);
    setTotalTime(0);
    setCycleCount(0);
    setCurrentPhase('inhale');
  };

  const handleComplete = () => {
    setIsActive(false);

    // Calculate score based on completion and consistency
    const completionRate = Math.min(100, (totalTime / (duration * 60)) * 100);
    const consistencyBonus = cycleCount >= 5 ? 20 : 0; // Bonus for completing multiple cycles
    const score = Math.floor(completionRate + consistencyBonus);

    onComplete(score);
  };

  const getCircleScale = () => {
    const progress = phaseTime / breathingPattern[currentPhase];

    switch (currentPhase) {
      case 'inhale':
        return 0.5 + progress * 0.5; // Scale from 0.5 to 1
      case 'hold':
        return 1; // Stay at full size
      case 'exhale':
        return 1 - progress * 0.5; // Scale from 1 to 0.5
      case 'pause':
        return 0.5; // Stay at small size
      default:
        return 0.5;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseProgress = () => {
    return (phaseTime / breathingPattern[currentPhase]) * 100;
  };

  return (
    <div className="breathing-exercise flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-md w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Breathing Exercise
          </h2>
          <p className="text-gray-600">
            Follow the circle and breathe mindfully
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="relative mb-8">
          <div className="w-64 h-64 mx-auto relative">
            {/* Background circle */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-30" />

            {/* Animated breathing circle */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${phaseColors[currentPhase]} transition-transform duration-100 ease-in-out flex items-center justify-center`}
              style={{
                transform: `scale(${getCircleScale()})`,
                transformOrigin: 'center',
              }}
            >
              <div className="text-white text-center">
                <div className="text-2xl font-bold mb-2">
                  {phaseInstructions[currentPhase]}
                </div>
                <div className="text-lg">
                  {Math.ceil(breathingPattern[currentPhase] - phaseTime)}
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="120"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="120"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - getPhaseProgress() / 100)}`}
                className="transition-all duration-100 ease-linear"
              />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{cycleCount}</div>
            <div className="text-sm text-gray-600">Cycles</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {formatTime(totalTime)}
            </div>
            <div className="text-sm text-gray-600">Time</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(duration * 60 - totalTime)}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (totalTime / (duration * 60)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {Math.floor((totalTime / (duration * 60)) * 100)}% Complete
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <PauseIcon className="w-5 h-5" />
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <StopIcon className="w-5 h-5" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Exit Exercise
        </button>

        {/* Instructions */}
        {!isActive && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm text-left">
            <h3 className="font-semibold text-gray-800 mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Follow the expanding and contracting circle</li>
              <li>• Breathe in as the circle grows</li>
              <li>• Hold your breath when it's full</li>
              <li>• Breathe out as it shrinks</li>
              <li>• Pause when it's small</li>
              <li>• Focus on your breath and relax</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
