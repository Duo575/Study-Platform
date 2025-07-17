import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAI } from '../../hooks/useAI';
import { AIStudyPlan, StudyScheduleItem } from '../../types';
import { format, addDays } from 'date-fns';

const studyPlanSchema = z.object({
  courseId: z.string().min(1, 'Please select a course'),
  goals: z.array(z.string().min(1, 'Goal cannot be empty')).min(1, 'Add at least one goal'),
  timeframe: z.number().min(1, 'Timeframe must be at least 1 day').max(365, 'Timeframe too long'),
  studyHoursPerDay: z.number().min(0.5, 'Minimum 30 minutes').max(12, 'Maximum 12 hours'),
});

type StudyPlanFormData = z.infer<typeof studyPlanSchema>;

interface AIStudyPlanGeneratorProps {
  userId: string;
  courses?: Array<{ id: string; name: string; color: string }>;
  onPlanGenerated?: (plan: AIStudyPlan) => void;
  className?: string;
}

export const AIStudyPlanGenerator: React.FC<AIStudyPlanGeneratorProps> = ({
  userId,
  courses = [],
  onPlanGenerated,
  className = '',
}) => {
  const { createStudyPlan, isLoading, error, assistant } = useAI();
  const [goals, setGoals] = useState<string[]>(['']);
  const [generatedPlan, setGeneratedPlan] = useState<AIStudyPlan | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<StudyPlanFormData>({
    resolver: zodResolver(studyPlanSchema),
    defaultValues: {
      courseId: '',
      goals: [''],
      timeframe: 30,
      studyHoursPerDay: 2,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const onSubmit = async (data: StudyPlanFormData) => {
    if (!assistant?.learningProfile) {
      console.error('Assistant not set up');
      return;
    }

    const validGoals = goals.filter(goal => goal.trim().length > 0);
    
    try {
      await createStudyPlan(
        userId,
        data.courseId,
        validGoals,
        data.timeframe
      );
      
      // For demo purposes, create a mock plan to show
      const mockPlan: AIStudyPlan = {
        id: 'demo-plan',
        userId,
        title: 'AI-Generated Study Plan',
        description: 'Personalized study plan based on your goals and learning preferences',
        courseId: data.courseId,
        goals: validGoals.map((goal, index) => ({
          id: `goal-${index}`,
          description: goal,
          targetDate: addDays(new Date(), data.timeframe),
          priority: index === 0 ? 'high' : 'medium',
          measurable: true,
          status: 'not_started',
        })),
        schedule: generateMockSchedule(validGoals, data.timeframe, data.studyHoursPerDay),
        adaptiveElements: [],
        generatedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        progress: {
          completionPercentage: 0,
          goalsCompleted: 0,
          totalGoals: validGoals.length,
          scheduleAdherence: 0,
          averageEffectiveness: 0,
          adaptationsApplied: 0,
          lastUpdated: new Date(),
        },
      };

      setGeneratedPlan(mockPlan);
      onPlanGenerated?.(mockPlan);
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    }
  };

  const generateMockSchedule = (
    goals: string[],
    timeframe: number,
    hoursPerDay: number
  ): StudyScheduleItem[] => {
    const schedule: StudyScheduleItem[] = [];
    const sessionsPerDay = Math.ceil(hoursPerDay / 1.5); // 1.5 hour sessions
    const totalSessions = timeframe * sessionsPerDay;
    const sessionsPerGoal = Math.ceil(totalSessions / goals.length);

    goals.forEach((goal, goalIndex) => {
      for (let session = 0; session < sessionsPerGoal; session++) {
        const dayOffset = Math.floor((goalIndex * sessionsPerGoal + session) / sessionsPerDay);
        if (dayOffset < timeframe) {
          schedule.push({
            id: `session-${goalIndex}-${session}`,
            planId: 'demo-plan',
            courseId: watchedValues.courseId,
            topic: goal,
            scheduledDate: addDays(new Date(), dayOffset),
            duration: 90, // 1.5 hours in minutes
            type: session % 3 === 0 ? 'new_material' : session % 3 === 1 ? 'practice' : 'review',
            priority: goalIndex === 0 ? 5 : 3,
            completed: false,
          });
        }
      }
    });

    return schedule.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  };

  if (generatedPlan) {
    return (
      <div className={`max-w-4xl mx-auto p-6 ${className}`}>
        <StudyPlanDisplay 
          plan={generatedPlan} 
          onBack={() => setGeneratedPlan(null)}
          courses={courses}
        />
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Study Plan Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let AI create a personalized study plan based on your goals and learning preferences.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Course
          </label>
          <select
            {...register('courseId')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          {errors.courseId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.courseId.message}</p>
          )}
        </div>

        {/* Study Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Study Goals
          </label>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoal(index, e.target.value)}
                  placeholder={`Goal ${index + 1}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addGoal}
            className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Goal
          </button>
        </div>

        {/* Timeframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timeframe (days)
            </label>
            <input
              {...register('timeframe', { valueAsNumber: true })}
              type="number"
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.timeframe && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.timeframe.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Study Hours per Day
            </label>
            <input
              {...register('studyHoursPerDay', { valueAsNumber: true })}
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.studyHoursPerDay && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.studyHoursPerDay.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading || goals.every(g => !g.trim())}
          className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Plan...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Generate AI Study Plan
            </>
          )}
        </button>
      </form>
    </div>
  );
};

interface StudyPlanDisplayProps {
  plan: AIStudyPlan;
  onBack: () => void;
  courses: Array<{ id: string; name: string; color: string }>;
}

const StudyPlanDisplay: React.FC<StudyPlanDisplayProps> = ({ plan, onBack, courses }) => {
  const course = courses.find(c => c.id === plan.courseId);
  
  const scheduleByDate = plan.schedule.reduce((acc, item) => {
    const dateKey = format(item.scheduledDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, StudyScheduleItem[]>);

  const typeIcons = {
    new_material: '📚',
    practice: '✏️',
    review: '🔄',
    assessment: '📝',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
          {course && (
            <div className="mt-2 inline-flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: course.color }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{course.name}</span>
            </div>
          )}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Goals</h3>
        <div className="space-y-3">
          {plan.goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                goal.priority === 'high' ? 'bg-red-500' : 
                goal.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-gray-900 dark:text-white">{goal.description}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                Due: {format(goal.targetDate, 'MMM dd, yyyy')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Schedule</h3>
        <div className="space-y-4">
          {Object.entries(scheduleByDate).map(([date, sessions]) => (
            <div key={date} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {format(new Date(date), 'EEEE, MMMM dd')}
              </h4>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-lg">{typeIcons[session.type]}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{session.topic}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.type.replace('_', ' ')} • {session.duration} minutes
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      session.priority >= 4 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      session.priority >= 3 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      Priority {session.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {plan.progress.completionPercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {plan.progress.goalsCompleted}/{plan.progress.totalGoals}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {plan.schedule.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(plan.schedule.reduce((sum, s) => sum + s.duration, 0) / 60)}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIStudyPlanGenerator;