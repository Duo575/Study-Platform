import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Crown,
  Star,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useSocialStore } from '../../store/socialStore';
import type { StudyGroup, LeaderboardType, LeaderboardPeriod, LeaderboardEntry } from '../../types';

interface GroupLeaderboardProps {
  group: StudyGroup;
  className?: string;
}

const GroupLeaderboard: React.FC<GroupLeaderboardProps> = ({ group, className = '' }) => {
  const { leaderboards, fetchLeaderboard, isLoading } = useSocialStore();
  const [selectedType, setSelectedType] = useState<LeaderboardType>('xp');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');

  const leaderboardTypes: { value: LeaderboardType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'xp', label: 'XP', icon: <Star className="w-4 h-4" />, color: 'text-purple-600' },
    { value: 'study_time', label: 'Study Time', icon: <Clock className="w-4 h-4" />, color: 'text-blue-600' },
    { value: 'quests_completed', label: 'Quests', icon: <Target className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'streak_days', label: 'Streak', icon: <Zap className="w-4 h-4" />, color: 'text-orange-600' },
    { value: 'contribution', label: 'Contribution', icon: <Trophy className="w-4 h-4" />, color: 'text-indigo-600' },
  ];

  const periods: { value: LeaderboardPeriod; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all_time', label: 'All Time' },
  ];

  useEffect(() => {
    fetchLeaderboard(group.id, selectedType, selectedPeriod);
  }, [group.id, selectedType, selectedPeriod, fetchLeaderboard]);

  const currentLeaderboard = leaderboards.find(
    l => l.groupId === group.id && l.type === selectedType && l.period === selectedPeriod
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatValue = (value: number, type: LeaderboardType) => {
    switch (type) {
      case 'xp':
        return value.toLocaleString();
      case 'study_time':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      case 'quests_completed':
        return value.toString();
      case 'streak_days':
        return `${value} days`;
      case 'contribution':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const selectedTypeConfig = leaderboardTypes.find(t => t.value === selectedType);

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Crown className="w-4 h-4" />
            <span>{group.stats.totalMembers} members</span>
          </div>
        </div>

        {/* Type Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {leaderboardTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className={selectedType === type.value ? type.color : 'text-gray-400'}>
                {type.icon}
              </span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Period Selection */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : !currentLeaderboard || currentLeaderboard.entries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No data yet</h4>
            <p className="text-gray-600 text-sm">
              Start studying to see rankings appear here!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentLeaderboard.entries.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  entry.isCurrentUser 
                    ? 'bg-indigo-50 border-2 border-indigo-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getRankBadgeColor(entry.rank)}`}>
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <span className="font-bold text-sm">#{entry.rank}</span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {entry.avatarUrl ? (
                      <img 
                        src={entry.avatarUrl} 
                        alt={entry.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${entry.isCurrentUser ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {entry.username}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          You
                        </span>
                      )}
                      {entry.badge && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Value and Change */}
                <div className="text-right">
                  <div className={`font-semibold ${selectedTypeConfig?.color || 'text-gray-900'}`}>
                    {formatValue(entry.value, selectedType)}
                  </div>
                  {entry.change !== 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      {getChangeIcon(entry.change)}
                      <span className={entry.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(entry.change)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {currentLeaderboard && currentLeaderboard.entries.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {currentLeaderboard.entries.length}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatValue(
                    Math.max(...currentLeaderboard.entries.map(e => e.value)), 
                    selectedType
                  )}
                </div>
                <div className="text-sm text-gray-600">Top Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatValue(
                    Math.round(
                      currentLeaderboard.entries.reduce((sum, e) => sum + e.value, 0) / 
                      currentLeaderboard.entries.length
                    ), 
                    selectedType
                  )}
                </div>
                <div className="text-sm text-gray-600">Average</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupLeaderboard;