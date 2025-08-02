import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Trophy,
  Target,
  // Calendar,
  Bell,
  // Settings,
  Plus,
  Search,
  // Filter,
  Star,
  Crown,
  // Award,
  TrendingUp,
} from 'lucide-react';
import { useSocial } from '../../hooks/useSocial';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';
import type { StudyGroup } from '../../types';

interface SocialDashboardProps {
  className?: string;
}

const SocialDashboard: React.FC<SocialDashboardProps> = ({
  className = '',
}) => {
  const {
    groups,
    activeGroup,
    invitations,
    activities,
    isLoading,
    error,
    fetchMyGroups,
    fetchGroupInvitations,
    fetchGroupActivities,
    setActiveGroup,
    clearError,
  } = useSocial();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'groups' | 'invitations' | 'activities'
  >('overview');

  useEffect(() => {
    fetchMyGroups();
    fetchGroupInvitations();
    if (activeGroup) {
      fetchGroupActivities(activeGroup.id);
    }
  }, [fetchMyGroups, fetchGroupInvitations, fetchGroupActivities, activeGroup]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleGroupSelect = (group: StudyGroup) => {
    setActiveGroup(group);
    fetchGroupActivities(group.id);
  };

  const getGroupStats = () => {
    if (groups.length === 0) return null;

    const totalMembers = groups.reduce(
      (sum, g) => sum + g.stats.totalMembers,
      0
    );
    const totalXP = groups.reduce((sum, g) => sum + g.stats.groupXP, 0);
    const totalStudyHours = groups.reduce(
      (sum, g) => sum + g.stats.totalStudyHours,
      0
    );
    const averageLevel =
      groups.reduce((sum, g) => sum + g.stats.averageLevel, 0) / groups.length;

    return {
      totalGroups: groups.length,
      totalMembers,
      totalXP,
      totalStudyHours,
      averageLevel: Math.round(averageLevel),
    };
  };

  const stats = getGroupStats();

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    { id: 'groups', label: 'My Groups', icon: <Users className="w-4 h-4" /> },
    {
      id: 'invitations',
      label: 'Invitations',
      icon: <Bell className="w-4 h-4" />,
      badge: invitations.filter(i => i.status === 'pending').length,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Social Hub</h2>
            <p className="text-gray-600">
              Connect, collaborate, and compete with fellow learners
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Join Group
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.totalGroups}
              </div>
              <div className="text-sm text-gray-600">Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalMembers}
              </div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalStudyHours}h
              </div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.averageLevel}
              </div>
              <div className="text-sm text-gray-600">Avg Level</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                selectedTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Create Group</div>
                    <div className="text-sm opacity-90">
                      Start a new study group
                    </div>
                  </button>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all"
                  >
                    <Search className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Join Group</div>
                    <div className="text-sm opacity-90">
                      Find groups to join
                    </div>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all">
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Leaderboards</div>
                    <div className="text-sm opacity-90">View rankings</div>
                  </button>
                  <button className="p-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all">
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Challenges</div>
                    <div className="text-sm opacity-90">Join challenges</div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                {activities.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500">
                      Join a group to see activity here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {selectedTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {isLoading && groups.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Groups Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join or create your first study group to start collaborating
                    with other learners.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setShowJoinModal(true)}
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Join Group
                    </button>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Create Group
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map(group => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -2 }}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        activeGroup?.id === group.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {group.name}
                            </h3>
                            {group.isPrivate && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                Private
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-500">
                            Lv.{Math.floor(group.stats.averageLevel)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {group.stats.totalMembers}
                          </div>
                          <div className="text-xs text-gray-500">Members</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {group.stats.activeMembers}
                          </div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {group.stats.groupXP.toLocaleString()} XP
                        </span>
                        <span>{group.stats.totalStudyHours}h studied</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'invitations' && (
            <motion.div
              key="invitations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {invitations.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Invitations
                  </h3>
                  <p className="text-gray-600">
                    You don't have any pending group invitations.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map(invitation => (
                    <div
                      key={invitation.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {invitation.groupName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Invited by {invitation.invitedByUsername}
                          </p>
                          {invitation.message && (
                            <p className="text-sm text-gray-700 mb-3 italic">
                              "{invitation.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Expires {invitation.expiresAt.toLocaleDateString()}
                          </p>
                        </div>
                        {invitation.status === 'pending' && (
                          <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                              Accept
                            </button>
                            <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors">
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Activity
                  </h3>
                  <p className="text-gray-600">
                    Join a group to see activity from your study groups.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{activity.timestamp.toLocaleString()}</span>
                          <span>•</span>
                          <span>{activity.groupId}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </div>
  );
};

export default SocialDashboard;
