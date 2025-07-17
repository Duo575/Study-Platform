import React, { useState } from 'react';
import { useAchievements, useBadges } from '../../hooks/useAchievements';
import type { AchievementCategory } from '../../types';

interface AchievementBoardProps {
  userId: string;
  className?: string;
}

/**
 * Achievement Board Component
 * Displays user's achievements, badges, and progress
 */
export function AchievementBoard({ userId, className = '' }: AchievementBoardProps) {
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges'>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const {
    achievements,
    definitions,
    isLoading,
    error,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    completionPercentage,
    unlockedCount,
    totalAchievements
  } = useAchievements(userId);

  const {
    badges,
    isLoading: badgesLoading,
    getBadgesByRarity,
    totalBadges,
    limitedEditionCount
  } = useBadges(userId);

  if (isLoading || badgesLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Achievements</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const categories: { id: AchievementCategory | 'all'; name: string; icon: string }[] = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'study_time', name: 'Study Time', icon: '📚' },
    { id: 'consistency', name: 'Consistency', icon: '🔥' },
    { id: 'quest_completion', name: 'Quests', icon: '⚔️' },
    { id: 'pet_care', name: 'Pet Care', icon: '🐾' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'special_event', name: 'Events', icon: '🎉' }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? [...getUnlockedAchievements(), ...getLockedAchievements()]
    : getAchievementsByCategory(selectedCategory);

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Achievements & Badges</h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'badges'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Badges
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{unlockedCount}</div>
          <div className="text-sm text-gray-600">Achievements</div>
          <div className="text-xs text-gray-500">{completionPercentage}% Complete</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{totalBadges}</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
          <div className="text-xs text-gray-500">{limitedEditionCount} Limited Edition</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {getBadgesByRarity('legendary').length}
          </div>
          <div className="text-sm text-gray-600">Legendary</div>
          <div className="text-xs text-gray-500">Rarest Achievements</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round((unlockedCount / Math.max(totalAchievements, 1)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Progress</div>
          <div className="text-xs text-gray-500">Overall Completion</div>
        </div>
      </div>

      {activeTab === 'achievements' ? (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map(item => {
              const isUnlocked = 'unlocked' in item ? item.unlocked : !!item.unlockedAt;
              const achievement = 'definition' in item ? item.definition : item;
              const unlockedAt = 'unlocked' in item ? item.unlockedAt : item.unlockedAt;
              
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={isUnlocked}
                  unlockedAt={unlockedAt}
                />
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Start studying to unlock your first achievement!'
                  : `No achievements in the ${categories.find(c => c.id === selectedCategory)?.name} category yet.`
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Badges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {badges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No badges earned yet</h3>
              <p className="text-gray-600">
                Complete achievements and participate in events to earn badges!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Individual Achievement Card
 */
function AchievementCard({ 
  achievement, 
  isUnlocked, 
  unlockedAt 
}: { 
  achievement: any; 
  isUnlocked: boolean; 
  unlockedAt?: Date; 
}) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 'epic': return 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50';
      case 'rare': return 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-700';
      case 'epic': return 'text-purple-700';
      case 'rare': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
      isUnlocked 
        ? getRarityColor(achievement.rarity)
        : 'border-gray-200 bg-gray-50 opacity-60'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
          isUnlocked ? 'bg-white shadow-sm' : 'bg-gray-200'
        }`}>
          {isUnlocked ? (
            <img 
              src={achievement.iconUrl} 
              alt={achievement.title}
              className="w-8 h-8"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/achievements/default.png';
              }}
            />
          ) : (
            '🔒'
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              isUnlocked ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {achievement.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isUnlocked ? getRarityTextColor(achievement.rarity) : 'text-gray-500'
            } ${
              isUnlocked ? 'bg-white bg-opacity-50' : 'bg-gray-200'
            }`}>
              {achievement.rarity}
            </span>
          </div>
          
          <p className={`text-sm mb-2 ${
            isUnlocked ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${
              isUnlocked ? 'text-blue-600' : 'text-gray-400'
            }`}>
              +{achievement.xpReward} XP
            </span>
            
            {isUnlocked && unlockedAt && (
              <span className="text-xs text-gray-500">
                {unlockedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual Badge Card
 */
function BadgeCard({ badge }: { badge: any }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50';
      case 'epic': return 'ring-purple-400 bg-gradient-to-br from-purple-50 to-pink-50';
      case 'rare': return 'ring-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50';
      default: return 'ring-gray-300 bg-white';
    }
  };

  return (
    <div className={`p-3 rounded-lg ring-2 transition-all hover:shadow-md ${getRarityColor(badge.rarity)}`}>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-white shadow-sm flex items-center justify-center">
          <img 
            src={badge.iconUrl} 
            alt={badge.name}
            className="w-8 h-8"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/badges/default.png';
            }}
          />
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">
          {badge.name}
        </h3>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {badge.description}
        </p>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 capitalize">
            {badge.rarity}
          </span>
          
          {badge.isLimitedEdition && (
            <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs font-medium">
              Limited
            </span>
          )}
        </div>
        
        {badge.unlockedAt && (
          <div className="text-xs text-gray-500 mt-1">
            {badge.unlockedAt.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementBoard;