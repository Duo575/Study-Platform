import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Lock, Globe, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSocialStore } from '../../store/socialStore';
import type { CreateGroupForm } from '../../types';

const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters').max(50, 'Group name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  isPrivate: z.boolean(),
  maxMembers: z.number().min(2, 'Minimum 2 members').max(50, 'Maximum 50 members'),
});

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { createGroup, isLoading } = useSocialStore();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
      maxMembers: 10,
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateGroupForm) => {
    try {
      await createGroup({
        ...data,
        settings: {
          allowInvites: true,
          requireApproval: data.isPrivate,
          shareProgress: true,
          enableCompetition: true,
          enableGroupChallenges: true,
          studyRoomEnabled: true,
          notificationSettings: {
            memberJoined: true,
            memberLeft: true,
            challengeStarted: true,
            challengeCompleted: true,
            milestoneReached: true,
            studySessionStarted: false
          }
        }
      });
      reset();
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Study Group</h2>
                <p className="text-sm text-gray-600">Step {step} of 2</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Group Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      placeholder="Enter group name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      id="description"
                      rows={3}
                      placeholder="Describe your study group's purpose and goals"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Privacy Setting */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Privacy Setting
                    </label>
                    <div className="space-y-3">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          !watchedValues.isPrivate
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setValue('isPrivate', false)}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-900">Public</div>
                            <div className="text-sm text-gray-600">Anyone can find and join this group</div>
                          </div>
                        </div>
                      </div>
                      
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          watchedValues.isPrivate
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setValue('isPrivate', true)}
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="font-medium text-gray-900">Private</div>
                            <div className="text-sm text-gray-600">Only invited members can join</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Max Members */}
                  <div>
                    <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Members
                    </label>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <input
                        {...register('maxMembers', { valueAsNumber: true })}
                        type="number"
                        id="maxMembers"
                        min="2"
                        max="50"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    {errors.maxMembers && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxMembers.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Group Settings</h3>
                    <p className="text-sm text-gray-600">
                      Review your group settings. You can change these later.
                    </p>
                  </div>

                  {/* Settings Preview */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Allow member invites</span>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Require approval to join</span>
                      <span className="text-sm font-medium text-gray-600">
                        {watchedValues.isPrivate ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Share progress</span>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Group challenges</span>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Study rooms</span>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                  </div>

                  {/* Group Summary */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Group Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{watchedValues.name}</span>
                      </div>
                      {watchedValues.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Description:</span>
                          <span className="font-medium text-right max-w-48 truncate">
                            {watchedValues.description}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Privacy:</span>
                        <span className="font-medium">
                          {watchedValues.isPrivate ? 'Private' : 'Public'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Members:</span>
                        <span className="font-medium">{watchedValues.maxMembers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating...' : 'Create Group'}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;