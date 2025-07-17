import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  MessageCircle, 
  Calendar,
  Settings,
  UserPlus,
  Crown,
  Star,
  Clock,
  Target
} from 'lucide-react';
import { useSocialStore } from '../store/socialStore';
import CreateGroupModal from '../components/features/CreateGroupModal';
import JoinGroupModal from '../components/features/JoinGroupModal';
import GroupChat from '../components/features/GroupChat';
import GroupLeaderboard from '../components/features/GroupLeaderboard';
import GroupChallenges from '../components/features/GroupChallenges';
import StudyRooms from '../components/features/StudyRooms';
import type { StudyGroup, GroupFilters } from '../types';

const StudyGroupsPage: React.FC = () => {
  const {
    groups,
    activeGroup,
    isLoading,
    error,
    fetchMyGroups,
    setActiveGroup,
    searchGroups,
    clearError
  } = useSocialStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<GroupFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchResults, setSearchResults] = useState<StudyGroup[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'chat' | 'leaderboard' | 'challenges' | 'rooms'>('overview');

  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchGroups({ 
        ...filters, 
        search: searchTerm 
      });
      setSearchResults(results);
    }
  };

  const handleGroupSelect = (group: StudyGroup) => {
    setActiveGroup(group);
  };

  const getGroupStatusColor = (group: StudyGroup) => {
    const activeMembers = group.stats.activeMembers;
    const totalMembers = group.stats.totalMembers;
    const activityRate = totalMembers > 0 ? activeMembers / totalMembers : 0;
    
    if (activityRate >= 0.7) return 'bg-green-100 text-green-800';
    if (activityRate >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getGroupStatusText = (group: StudyGroup) => {
    const activeMembers = group.stats.activeMembers;
    const totalMembers = group.stats.totalMembers;
    const activityRate = totalMembers > 0 ? activeMembers / totalMembers : 0;
    
    if (activityRate >= 0.7) return 'Very Active';
    if (activityRate >= 0.4) return 'Moderately Active';
    return 'Low Activity';
  };

  if (isLoading && groups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
              <p className="text-gray-600">Connect, collaborate, and achieve your goals together</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
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
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Groups</h2>
              
              {groups.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Join or create your first study group to start collaborating with other learners.
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
                groups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer transition-all ${
                      activeGroup?.id === group.id ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                          {group.isPrivate && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Private
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${getGroupStatusColor(group)}`}>
                            {getGroupStatusText(group)}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-500">Level {Math.floor(group.stats.averageLevel)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{group.stats.totalMembers}</div>
                        <div className="text-xs text-gray-500">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{group.stats.activeMembers}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{group.stats.totalStudyHours}h</div>
                        <div className="text-xs text-gray-500">Study Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">{group.stats.totalQuestsCompleted}</div>
                        <div className="text-xs text-gray-500">Quests</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {group.stats.groupXP.toLocaleString()} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {group.stats.weeklyProgress.totalStudyTime}h this week
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                          <Trophy className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results</h2>
                  <div className="space-y-4">
                    {searchResults.map((group) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                              {group.isPrivate && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  Private
                                </span>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{group.stats.totalMembers} members</span>
                              <span>{group.stats.activeMembers} active</span>
                              <span>Level {Math.floor(group.stats.averageLevel)}</span>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            Join
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Group Details Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-6"
            >
              {activeGroup ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{activeGroup.name}</h3>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {activeGroup.description && (
                    <p className="text-gray-600 text-sm mb-4">{activeGroup.description}</p>
                  )}

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Invite Code</span>
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        {activeGroup.inviteCode}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Members</span>
                      <span className="text-sm font-medium">
                        {activeGroup.stats.totalMembers}/{activeGroup.maxMembers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Group XP</span>
                      <span className="text-sm font-medium text-purple-600">
                        {activeGroup.stats.groupXP.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setActiveView('overview')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'overview'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveView('chat')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeView === 'chat'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Chat
                    </button>
                  </div>

                  {/* View Content */}
                  {activeView === 'overview' && (
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveView('chat')}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Group Chat
                      </button>
                      <button 
                        onClick={() => setActiveView('leaderboard')}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                      </button>
                      <button 
                        onClick={() => setActiveView('challenges')}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <Target className="w-4 h-4" />
                        Challenges
                      </button>
                      <button 
                        onClick={() => setActiveView('rooms')}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Study Rooms
                      </button>
                    </div>
                  )}

                  {activeView === 'chat' && (
                    <div className="h-96">
                      <GroupChat group={activeGroup} className="h-full" />
                    </div>
                  )}

                  {activeView === 'leaderboard' && (
                    <div>
                      <GroupLeaderboard group={activeGroup} />
                    </div>
                  )}

                  {activeView === 'challenges' && (
                    <div>
                      <GroupChallenges group={activeGroup} />
                    </div>
                  )}

                  {activeView === 'rooms' && (
                    <div>
                      <StudyRooms group={activeGroup} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Group</h3>
                  <p className="text-gray-600 text-sm">
                    Choose a study group to view details and access group features.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
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

export default StudyGroupsPage;