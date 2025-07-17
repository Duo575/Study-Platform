import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Key, Search, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSocialStore } from '../../store/socialStore';
import type { JoinGroupForm } from '../../types';

const joinGroupSchema = z.object({
  inviteCode: z.string().min(6, 'Invite code must be at least 6 characters').max(8, 'Invite code must be at most 8 characters'),
});

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose }) => {
  const { joinGroup, isLoading, error } = useSocialStore();
  const [joinMethod, setJoinMethod] = useState<'code' | 'search'>('code');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<JoinGroupForm>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: {
      inviteCode: '',
    }
  });

  const inviteCode = watch('inviteCode');

  const onSubmit = async (data: JoinGroupForm) => {
    try {
      await joinGroup(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const handleClose = () => {
    reset();
    setJoinMethod('code');
    onClose();
  };

  const formatInviteCode = (value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setValue('inviteCode', cleaned);
  };

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
                <h2 className="text-xl font-semibold text-gray-900">Join Study Group</h2>
                <p className="text-sm text-gray-600">Connect with other learners</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Join Method Selection */}
              <div className="mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setJoinMethod('code')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      joinMethod === 'code'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    Invite Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinMethod('search')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      joinMethod === 'search'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Search Groups
                  </button>
                </div>
              </div>

              {joinMethod === 'code' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <UserPlus className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Invite Code</h3>
                    <p className="text-sm text-gray-600">
                      Ask a group member for their invite code to join their study group.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Invite Code
                      </label>
                      <div className="relative">
                        <input
                          {...register('inviteCode')}
                          type="text"
                          id="inviteCode"
                          placeholder="Enter 6-8 character code"
                          className="w-full px-4 py-3 text-center text-lg font-mono tracking-wider border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                          onChange={(e) => formatInviteCode(e.target.value)}
                          maxLength={8}
                        />
                        <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                      {errors.inviteCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.inviteCode.message}</p>
                      )}
                      {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">How to get an invite code:</p>
                          <ul className="space-y-1 text-blue-700">
                            <li>• Ask a group member to share their code</li>
                            <li>• Look for codes in study forums or social media</li>
                            <li>• Check if your friends have shared codes</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !inviteCode || inviteCode.length < 6}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isLoading ? 'Joining...' : 'Join Group'}
                    </button>
                  </form>
                </motion.div>
              )}

              {joinMethod === 'search' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <Search className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Groups</h3>
                    <p className="text-sm text-gray-600">
                      Find public study groups that match your interests and subjects.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Groups
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="search"
                          placeholder="Search by name, subject, or keywords..."
                          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Search functionality coming soon! For now, use an invite code to join a group.
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                      </div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Popular group categories:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Mathematics', 'Science', 'Languages', 'Programming', 'History', 'Literature'].map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JoinGroupModal;