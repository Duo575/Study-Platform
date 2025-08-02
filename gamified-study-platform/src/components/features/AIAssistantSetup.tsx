import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAI } from '../../hooks/useAI';
import { LearningStyle } from '../../types';

const setupSchema = z.object({
  name: z
    .string()
    .min(1, 'Assistant name is required')
    .max(50, 'Name too long'),
  personalityType: z.enum([
    'encouraging',
    'analytical',
    'casual',
    'professional',
  ]),
  communicationStyle: z.enum(['formal', 'friendly', 'motivational', 'direct']),
  studyMethodSuggestions: z.boolean(),
  motivationalMessages: z.boolean(),
  progressCelebrations: z.boolean(),
  reminderStyle: z.enum(['gentle', 'firm', 'playful']),
  explanationDepth: z.enum(['basic', 'intermediate', 'advanced']),
  learningStyle: z
    .array(
      z.enum([
        'visual',
        'auditory',
        'kinesthetic',
        'reading_writing',
        'logical',
        'social',
        'solitary',
      ])
    )
    .min(1, 'Select at least one learning style'),
});

type SetupFormData = z.infer<typeof setupSchema>;

interface AIAssistantSetupProps {
  userId: string;
  onComplete?: () => void;
  className?: string;
}

export const AIAssistantSetup: React.FC<AIAssistantSetupProps> = ({
  userId,
  onComplete,
  className = '',
}) => {
  const { setupAssistant, isLoading, error } = useAI();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: 'Study Buddy',
      personalityType: 'encouraging',
      communicationStyle: 'friendly',
      studyMethodSuggestions: true,
      motivationalMessages: true,
      progressCelebrations: true,
      reminderStyle: 'gentle',
      explanationDepth: 'intermediate',
      learningStyle: ['visual'],
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit = async (data: SetupFormData) => {
    try {
      await setupAssistant(
        userId,
        data.name,
        data.personalityType,
        data.communicationStyle,
        {
          studyMethodSuggestions: data.studyMethodSuggestions,
          motivationalMessages: data.motivationalMessages,
          progressCelebrations: data.progressCelebrations,
          reminderStyle: data.reminderStyle,
          explanationDepth: data.explanationDepth,
          contextAwareness: true,
        },
        data.learningStyle
      );
      onComplete?.();
    } catch (err) {
      console.error('Failed to setup assistant:', err);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const personalityDescriptions = {
    encouraging: 'Supportive and motivating, always cheering you on',
    analytical: 'Logical and detailed, focuses on systematic learning',
    casual: 'Friendly and relaxed, like chatting with a study buddy',
    professional: 'Formal and structured, efficient and focused',
  };

  const learningStyleDescriptions = {
    visual: 'Learn best with diagrams, charts, and visual aids',
    auditory: 'Learn best through listening and discussion',
    kinesthetic: 'Learn best through hands-on activities',
    reading_writing: 'Learn best through reading and writing',
    logical: 'Learn best through logical reasoning and patterns',
    social: 'Learn best in groups and through collaboration',
    solitary: 'Learn best when studying alone',
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Set Up Your AI Study Assistant
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let's personalize your AI assistant to match your learning style and
          preferences.
        </p>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assistant Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Give your assistant a name..."
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Personality Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(personalityDescriptions).map(
                    ([type, description]) => (
                      <label
                        key={type}
                        className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                          watchedValues.personalityType === type
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <input
                          {...register('personalityType')}
                          type="radio"
                          value={type}
                          className="sr-only"
                        />
                        <div className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {type}
                          </span>
                          <span className="block text-sm text-gray-500 dark:text-gray-400">
                            {description}
                          </span>
                        </div>
                      </label>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Communication Style
                </label>
                <div className="space-y-3">
                  {['formal', 'friendly', 'motivational', 'direct'].map(
                    style => (
                      <label
                        key={style}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                          watchedValues.communicationStyle === style
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <input
                          {...register('communicationStyle')}
                          type="radio"
                          value={style}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {style}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Explanation Depth
                </label>
                <div className="space-y-3">
                  {['basic', 'intermediate', 'advanced'].map(depth => (
                    <label
                      key={depth}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer ${
                        watchedValues.explanationDepth === depth
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <input
                        {...register('explanationDepth')}
                        type="radio"
                        value={depth}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {depth}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Learning Styles (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(learningStyleDescriptions).map(
                    ([style, description]) => (
                      <label
                        key={style}
                        className={`relative flex cursor-pointer rounded-lg border p-4 ${
                          watchedValues.learningStyle?.includes(
                            style as LearningStyle
                          )
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={style}
                          checked={watchedValues.learningStyle?.includes(
                            style as LearningStyle
                          )}
                          onChange={e => {
                            const currentStyles =
                              watchedValues.learningStyle || [];
                            if (e.target.checked) {
                              setValue('learningStyle', [
                                ...currentStyles,
                                style as LearningStyle,
                              ]);
                            } else {
                              setValue(
                                'learningStyle',
                                currentStyles.filter(s => s !== style)
                              );
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {style.replace('_', ' ')}
                          </span>
                          <span className="block text-sm text-gray-500 dark:text-gray-400">
                            {description}
                          </span>
                        </div>
                      </label>
                    )
                  )}
                </div>
                {errors.learningStyle && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {errors.learningStyle.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      {...register('studyMethodSuggestions')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Receive study method suggestions
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('motivationalMessages')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Receive motivational messages
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('progressCelebrations')}
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Celebrate progress milestones
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Reminder Style
                </label>
                <div className="space-y-2">
                  {['gentle', 'firm', 'playful'].map(style => (
                    <label
                      key={style}
                      className={`flex items-center p-2 rounded border cursor-pointer ${
                        watchedValues.reminderStyle === style
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <input
                        {...register('reminderStyle')}
                        type="radio"
                        value={style}
                        className="sr-only"
                      />
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AIAssistantSetup;
