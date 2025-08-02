import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Trophy,
  Target,
  Video,
  Bell,
  Settings,
  ChevronRight,
  // Star,
  // Clock,
  // Crown,
  // Award
} from 'lucide-react';
import { useSocial } from '../../hooks/useSocial';
import SocialDashboard from './SocialDashboard';
import GroupChat from './GroupChat';
import GroupLeaderboard from './GroupLeaderboard';
import GroupChallenges from './GroupChallenges';
import StudyRooms from './StudyRooms';
import type { StudyGroup } from '../../types';

interface SocialFeaturesProps {
  className?: string;
}

const SocialFeatures: React.FC<SocialFeaturesProps> = ({ className = '' }) => {
  const {
    groups,
    activeGroup,
    invitations,
    isLoading,
    error,
    fetchMyGroups,
    fetchGroupInvitations,
    setActiveGroup,
    clearError,
  } = useSocial();

  const [activeView, setActiveView] = useState<
    'dashboard' | 'chat' | 'leaderboard' | 'challenges' | 'rooms'
  >('dashboard');
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  useEffect(() => {
    fetchMyGroups();
    fetchGroupInvitations();
  }, [fetchMyGroups, fetchGroupInvitations]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleGroupSelect = (group: StudyGroup) => {
    setActiveGroup(group);
    setShowGroupSelector(false);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Social Dashboard';
      case 'chat':
        return activeGroup ? `${activeGroup.name} - Chat` : 'Group Chat';
      case 'leaderboard':
        return activeGroup
          ? `${activeGroup.name} - Leaderboard`
          : 'Leaderboard';
      case 'challenges':
        return activeGroup ? `${activeGroup.name} - Challenges` : 'Challenges';
      case 'rooms':
        return activeGroup
          ? `${activeGroup.name} - Study Rooms`
          : 'Study Rooms';
      default:
        return 'Social Features';
    }
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Users className="w-4 h-4" />,
      requiresGroup: false,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-4 h-4" />,
      requiresGroup: true,
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <Trophy className="w-4 h-4" />,
      requiresGroup: true,
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: <Target className="w-4 h-4" />,
      requiresGroup: true,
    },
    {
      id: 'rooms',
      label: 'Study Rooms',
      icon: <Video className="w-4 h-4" />,
      requiresGroup: true,
    },
  ];

  const pendingInvitations = invitations.filter(
    inv => inv.status === 'pending'
  ).length;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{getViewTitle()}</h1>
            <p className="text-indigo-100">
              {activeGroup
                ? `${activeGroup.stats.totalMembers} members • ${activeGroup.stats.activeMembers} active`
                : 'Connect and collaborate with fellow learners'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pendingInvitations > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingInvitations}
                </span>
              </div>
            )}
            <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Group Selector */}
        {groups.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowGroupSelector(!showGroupSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{activeGroup ? activeGroup.name : 'Select Group'}</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showGroupSelector ? 'rotate-90' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showGroupSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div className="p-2">
                    {groups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupSelect(group)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          activeGroup?.id === group.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-500">
                            {group.stats.totalMembers} members •{' '}
                            {group.stats.activeMembers} active
                          </div>
                        </div>
                        {group.isPrivate && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Private
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {navigationItems.map(item => {
            const isDisabled = item.requiresGroup && !activeGroup;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveView(item.id as any)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="m-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Content */}
      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SocialDashboard />
            </motion.div>
          )}

          {activeView === 'chat' && activeGroup && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <GroupChat group={activeGroup} className="h-96" />
            </motion.div>
          )}

          {activeView === 'leaderboard' && activeGroup && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <GroupLeaderboard group={activeGroup} />
            </motion.div>
          )}

          {activeView === 'challenges' && activeGroup && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <GroupChallenges group={activeGroup} />
            </motion.div>
          )}

          {activeView === 'rooms' && activeGroup && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <StudyRooms group={activeGroup} />
            </motion.div>
          )}

          {/* No Group Selected State */}
          {activeView !== 'dashboard' && !activeGroup && (
            <motion.div
              key="no-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center h-96"
            >
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Group Selected
                </h3>
                <p className="text-gray-600 mb-4">
                  Select a group from the dropdown above to access group
                  features.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
};

export default SocialFeatures;
