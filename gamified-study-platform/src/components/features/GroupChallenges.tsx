import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Plus, 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import type { StudyGroup, GroupChallenge, ChallengeType, ChallengeStatus } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';

interface GroupChallengesProps {
  group: StudyGroup;
  className?: string;
}

const GroupChallenges: React.FC<GroupChallengesProps> = ({ group, className = '' }) => {
  const { challenges, fetchGroupChallenges, joinChallenge, isLoading } = useSocialStore();
  const [selectedStatus, setSelectedStatus] = useState<ChallengeStatus | 'all'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const statusOptions: { value: ChallengeStatus | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'text-gray-600' },
    { value: 'upcoming', label: 'Upcoming', color: 'text-blue-600' },
    { value: 'active', label: 'Active', color: 'text-green-600' },
    { value: 'completed', label: 'Completed', color: 'text-purple-600' },
  ];

  useEffect(() => {
    fetchGroupChallenges(group.id, { 
      status: selectedStatus === 'all' ? undefined : selectedStatus 
    });
  }, [group.id, selectedStatus, fetchGroupChallenges]);

  const filteredChallenges = challenges.filter(challenge => 
    selectedStatus === 'all' || challenge.status === selectedStatus
  );

  const getChallengeIcon = (type: ChallengeType) => {
    switch (type) {
      case 'study_time':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'quest_completion':
        return <Target className="w-5 h-5 text-green-500" />;
      case 'streak_maintenance':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'collaboration':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status) {
      case 'upcoming':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const calculateProgress = (challenge: GroupChallenge) => {
    if (challenge.goal.isCollective) {
      const totalProgress = challenge.participants.reduce((sum, p) => sum + p.progress, 0);
      return Math.min((totalProgress / challenge.goal.target) * 100, 100);
    } else {
      const completedParticipants = challenge.participants.filter(p => p.completed).length;
      return challenge.participants.length > 0 
        ? (completedParticipants / challenge.participants.length) * 100 
        : 0;
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Group Challenges</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No challenges yet</h4>
            <p className="text-gray-600 text-sm mb-4">
              Create the first challenge to motivate your group!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Challenge Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {challenge.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participants.length} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(challenge.endDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                        {getStatusIcon(challenge.status)}
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Challenge Goal */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Goal: {challenge.goal.description}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(calculateProgress(challenge))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(challenge)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Challenge Rewards */}
                  {challenge.rewards.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Rewards:</h5>
                      <div className="flex flex-wrap gap-2">
                        {challenge.rewards.map((reward, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                          >
                            {reward.type === 'xp' && <Star className="w-3 h-3" />}
                            {reward.type === 'badge' && <Award className="w-3 h-3" />}
                            {reward.type === 'pet_accessory' && <Trophy className="w-3 h-3" />}
                            {reward.description}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Participants Preview */}
                  {challenge.participants.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Top Participants:</span>
                        <span className="text-xs text-gray-500">
                          {challenge.participants.filter(p => p.completed).length} completed
                        </span>
                      </div>
                      <div className="space-y-2">
                        {challenge.participants
                          .sort((a, b) => b.progress - a.progress)
                          .slice(0, 3)
                          .map((participant) => (
                            <div key={participant.userId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {participant.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-900">{participant.username}</span>
                                {participant.completed && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {challenge.goal.isCollective 
                                  ? `${participant.progress}/${challenge.goal.target}`
                                  : `${Math.round((participant.progress / challenge.goal.target) * 100)}%`
                                }
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Challenge Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {challenge.status === 'active' && (
                        <span>Ends {formatDistanceToNow(challenge.endDate, { addSuffix: true })}</span>
                      )}
                      {challenge.status === 'upcoming' && (
                        <span>Starts {formatDistanceToNow(challenge.startDate, { addSuffix: true })}</span>
                      )}
                      {challenge.status === 'completed' && (
                        <span>Completed {formatDistanceToNow(challenge.endDate, { addSuffix: true })}</span>
                      )}
                    </div>
                    
                    {challenge.status === 'active' && (
                      <button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Join Challenge
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* TODO: Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Challenge</h3>
            <p className="text-gray-600 text-sm mb-4">
              Challenge creation form coming soon! This will allow group admins to create custom challenges for their members.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChallenges;