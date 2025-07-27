/**
 * Coin Earning Display Component
 *
 * This component displays coin earning progress, recent earnings,
 * and daily/weekly limits with multiplier information.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoinEarning, useEarningProgress } from '../../hooks/useCoinEarning';
import { useStoreStore } from '../../store/storeStore';
import type { CoinEarningResult } from '../../services/coinEarningSystem';

interface CoinEarningDisplayProps {
  className?: string;
  showRecentEarnings?: boolean;
  showLimits?: boolean;
  showStats?: boolean;
}

const sourceIcons: Record<string, string> = {
  study_session: '📚',
  quest_complete: '🎯',
  streak_bonus: '🔥',
  pet_care: '🐾',
  environment_usage: '🌍',
  daily_bonus: '🎁',
  mini_game: '🎮',
};

const multiplierIcons: Record<string, string> = {
  pet_happiness: '😊',
  streak_days: '🔥',
  environment_premium: '✨',
  quality_bonus: '⭐',
  time_bonus: '⏰',
  daily_limit: '📊',
};

export const CoinEarningDisplay: React.FC<CoinEarningDisplayProps> = ({
  className = '',
  showRecentEarnings = true,
  showLimits = true,
  showStats = true,
}) => {
  const {
    todayEarnings,
    weeklyEarnings,
    dailyLimit,
    weeklyLimit,
    recentEarnings,
    earningStats,
    isLoading,
    error,
  } = useCoinEarning();

  const { coins } = useStoreStore();
  const earningProgress = useEarningProgress();
  const [selectedTab, setSelectedTab] = useState<'recent' | 'stats' | 'limits'>(
    'recent'
  );

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <div className="text-2xl mb-2">⚠️</div>
          <p>Error loading earning data</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">💰 Coin Earnings</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">
              {coins.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Coins</div>
          </div>
        </div>

        {/* Daily/Weekly Progress */}
        {showLimits && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Today</span>
                <span className="text-sm font-bold text-gray-800">
                  {todayEarnings}/{dailyLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${earningProgress.dailyProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">
                  This Week
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {weeklyEarnings}/{weeklyLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${earningProgress.weeklyProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['recent', 'stats', 'limits'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'recent'
                ? '📋 Recent'
                : tab === 'stats'
                  ? '📊 Stats'
                  : '⚖️ Limits'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'recent' && showRecentEarnings && (
            <RecentEarningsTab key="recent" recentEarnings={recentEarnings} />
          )}

          {selectedTab === 'stats' && showStats && (
            <StatsTab key="stats" earningStats={earningStats} />
          )}

          {selectedTab === 'limits' && showLimits && (
            <LimitsTab
              key="limits"
              todayEarnings={todayEarnings}
              weeklyEarnings={weeklyEarnings}
              dailyLimit={dailyLimit}
              weeklyLimit={weeklyLimit}
              earningProgress={earningProgress}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface RecentEarningsTabProps {
  recentEarnings: CoinEarningResult[];
}

const RecentEarningsTab: React.FC<RecentEarningsTabProps> = ({
  recentEarnings,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-3"
  >
    {recentEarnings.length === 0 ? (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">💰</div>
        <p className="text-gray-600">No recent earnings</p>
        <p className="text-sm text-gray-500 mt-1">
          Start studying to earn your first coins!
        </p>
      </div>
    ) : (
      recentEarnings.map((earning, index) => (
        <EarningCard key={`${earning.timestamp}-${index}`} earning={earning} />
      ))
    )}
  </motion.div>
);

interface StatsTabProps {
  earningStats: {
    todayTotal: number;
    weekTotal: number;
    averagePerSession: number;
    topSource: string;
    streakBonus: number;
    petCareBonus: number;
  };
}

const StatsTab: React.FC<StatsTabProps> = ({ earningStats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-2 gap-4"
  >
    <div className="bg-yellow-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-yellow-600">
        {earningStats.todayTotal}
      </div>
      <div className="text-sm text-yellow-700">Today's Total</div>
    </div>

    <div className="bg-blue-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-blue-600">
        {earningStats.weekTotal}
      </div>
      <div className="text-sm text-blue-700">Week's Total</div>
    </div>

    <div className="bg-green-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-green-600">
        {earningStats.averagePerSession}
      </div>
      <div className="text-sm text-green-700">Avg per Session</div>
    </div>

    <div className="bg-purple-50 rounded-lg p-4">
      <div className="text-lg font-bold text-purple-600">
        {earningStats.topSource}
      </div>
      <div className="text-sm text-purple-700">Top Source</div>
    </div>

    <div className="bg-orange-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-orange-600">
        {earningStats.streakBonus}
      </div>
      <div className="text-sm text-orange-700">Streak Bonus</div>
    </div>

    <div className="bg-pink-50 rounded-lg p-4">
      <div className="text-2xl font-bold text-pink-600">
        {earningStats.petCareBonus}
      </div>
      <div className="text-sm text-pink-700">Pet Care Bonus</div>
    </div>
  </motion.div>
);

interface LimitsTabProps {
  todayEarnings: number;
  weeklyEarnings: number;
  dailyLimit: number;
  weeklyLimit: number;
  earningProgress: {
    dailyProgress: number;
    weeklyProgress: number;
    canEarnMore: boolean;
    nextResetTime: Date;
  };
}

const LimitsTab: React.FC<LimitsTabProps> = ({
  todayEarnings,
  weeklyEarnings,
  dailyLimit,
  weeklyLimit,
  earningProgress,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Daily Limit */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-800 mb-3">Daily Earning Limit</h4>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-bold text-gray-800">
          {todayEarnings}/{dailyLimit} coins
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            earningProgress.dailyProgress >= 100
              ? 'bg-red-500'
              : earningProgress.dailyProgress >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(100, earningProgress.dailyProgress)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Resets at midnight ({earningProgress.nextResetTime.toLocaleTimeString()}
        )
      </p>
    </div>

    {/* Weekly Limit */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-800 mb-3">Weekly Earning Limit</h4>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progress</span>
        <span className="text-sm font-bold text-gray-800">
          {weeklyEarnings}/{weeklyLimit} coins
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            earningProgress.weeklyProgress >= 100
              ? 'bg-red-500'
              : earningProgress.weeklyProgress >= 80
                ? 'bg-yellow-500'
                : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, earningProgress.weeklyProgress)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">Resets every Monday</p>
    </div>

    {/* Status */}
    <div
      className={`rounded-lg p-4 ${
        earningProgress.canEarnMore
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className="text-2xl">
          {earningProgress.canEarnMore ? '✅' : '🚫'}
        </div>
        <div>
          <p
            className={`font-medium ${
              earningProgress.canEarnMore ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {earningProgress.canEarnMore
              ? 'You can still earn more coins today!'
              : 'Daily or weekly limit reached'}
          </p>
          <p
            className={`text-sm ${
              earningProgress.canEarnMore ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {earningProgress.canEarnMore
              ? 'Keep studying to maximize your earnings'
              : 'Limits reset automatically'}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

interface EarningCardProps {
  earning: CoinEarningResult;
}

const EarningCard: React.FC<EarningCardProps> = ({ earning }) => {
  const [showDetails, setShowDetails] = useState(false);
  const sourceType = earning.source
    .split(' ')[0]
    .toLowerCase()
    .replace(':', '');
  const icon = sourceIcons[sourceType] || '💰';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <p className="font-medium text-gray-800">{earning.source}</p>
            <p className="text-sm text-gray-600">
              {earning.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-yellow-600">
            +{earning.totalCoins}
          </div>
          {earning.bonusCoins > 0 && (
            <div className="text-xs text-green-600">
              +{earning.bonusCoins} bonus
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200"
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Base:</span>
                <span className="ml-2 font-medium">{earning.baseCoins}</span>
              </div>
              <div>
                <span className="text-gray-600">Bonus:</span>
                <span className="ml-2 font-medium text-green-600">
                  +{earning.bonusCoins}
                </span>
              </div>
            </div>

            {earning.multipliers.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Multipliers:</p>
                <div className="space-y-1">
                  {earning.multipliers.map((multiplier, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center space-x-1">
                        <span>{multiplierIcons[multiplier.type] || '⚡'}</span>
                        <span>{multiplier.description}</span>
                      </span>
                      <span className="text-green-600 font-medium">
                        +{multiplier.coinsAdded}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(earning.hitDailyLimit || earning.hitWeeklyLimit) && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <span className="text-yellow-800">
                  ⚠️ {earning.hitDailyLimit ? 'Daily' : 'Weekly'} limit reached
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoinEarningDisplay;
