import React from 'react';
import { useQuestStore } from '../../../store/questStore';
import { Card } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { Badge } from '../../ui/Badge';
import questUtils from '../../../utils/questUtils';
import type { Quest, QuestType } from '../../../types';

interface QuestProgressProps {
  className?: string;
}

const QuestProgress: React.FC<QuestProgressProps> = ({ className = '' }) => {
  const { quests, activeQuests, completedQuests } = useQuestStore();

  // Calculate statistics
  const totalQuests = quests.length;
  const completedCount = completedQuests.length;
  const activeCount = activeQuests.length;
  const completionRate =
    totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0;

  // Calculate XP earned from completed quests
  const totalXpEarned = completedQuests.reduce(
    (sum, quest) => sum + quest.xpReward,
    0
  );
  const potentialXp = activeQuests.reduce(
    (sum, quest) => sum + quest.xpReward,
    0
  );

  // Group quests by type
  const questsByType = quests.reduce(
    (acc, quest) => {
      if (!acc[quest.type]) {
        acc[quest.type] = { total: 0, completed: 0, active: 0 };
      }
      acc[quest.type].total++;
      if (quest.status === 'completed') {
        acc[quest.type].completed++;
      } else if (quest.status === 'active' || quest.status === 'available') {
        acc[quest.type].active++;
      }
      return acc;
    },
    {} as Record<
      QuestType,
      { total: number; completed: number; active: number }
    >
  );

  // Calculate average progress for active quests
  const averageProgress =
    activeQuests.length > 0
      ? activeQuests.reduce(
          (sum, quest) => sum + questUtils.calculateQuestProgress(quest),
          0
        ) / activeQuests.length
      : 0;

  // Find quests expiring soon (within 24 hours)
  const questsExpiringSoon = activeQuests.filter(quest => {
    if (!quest.expiresAt) return false;
    const hoursUntilExpiry =
      (quest.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  });

  const getQuestTypeColor = (type: QuestType) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      case 'milestone':
        return 'bg-amber-100 text-amber-800';
      case 'bonus':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Quest Progress Overview</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalQuests}
            </div>
            <div className="text-sm text-gray-600">Total Quests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {completedCount}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {activeCount}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {totalXpEarned}
            </div>
            <div className="text-sm text-gray-600">XP Earned</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <ProgressBar progress={completionRate} color="green" />
        </div>

        {activeCount > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Average Active Quest Progress</span>
              <span>{Math.round(averageProgress)}%</span>
            </div>
            <ProgressBar progress={averageProgress} color="blue" />
          </div>
        )}
      </Card>

      {/* Quest Types Breakdown */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Quest Types</h3>

        <div className="space-y-3">
          {Object.entries(questsByType).map(([type, stats]) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getQuestTypeColor(type as QuestType)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {stats.completed}/{stats.total}
                </span>
              </div>
              <div className="flex-1 mx-4">
                <ProgressBar
                  progress={
                    stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                  }
                  color="blue"
                  size="sm"
                />
              </div>
              <div className="text-sm text-gray-500">{stats.active} active</div>
            </div>
          ))}
        </div>
      </Card>

      {/* XP Information */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">XP Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">XP Earned</div>
            <div className="text-xl font-bold text-yellow-600">
              {totalXpEarned} XP
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">
              Potential XP (Active Quests)
            </div>
            <div className="text-xl font-bold text-orange-600">
              {potentialXp} XP
            </div>
          </div>
        </div>

        {potentialXp > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              Complete all active quests to earn{' '}
              <strong>{potentialXp} XP</strong> more!
            </p>
          </div>
        )}
      </Card>

      {/* Urgent Quests */}
      {questsExpiringSoon.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <h3 className="text-lg font-semibold mb-3 text-orange-800">
            ⚠️ Quests Expiring Soon
          </h3>

          <div className="space-y-2">
            {questsExpiringSoon.map(quest => {
              const hoursLeft = Math.ceil(
                (quest.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60)
              );
              return (
                <div
                  key={quest.id}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={getQuestTypeColor(quest.type)}>
                      {quest.type}
                    </Badge>
                    <span className="font-medium">{quest.title}</span>
                  </div>
                  <div className="text-sm text-orange-600 font-medium">
                    {hoursLeft}h left
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Motivational Message */}
      {totalQuests > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            {completionRate >= 80 ? (
              <div>
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-semibold text-blue-800">
                  Excellent progress!
                </p>
                <p className="text-sm text-blue-600">
                  You're crushing your quest goals!
                </p>
              </div>
            ) : completionRate >= 50 ? (
              <div>
                <div className="text-2xl mb-2">💪</div>
                <p className="font-semibold text-purple-800">Great momentum!</p>
                <p className="text-sm text-purple-600">
                  Keep up the fantastic work!
                </p>
              </div>
            ) : completionRate >= 25 ? (
              <div>
                <div className="text-2xl mb-2">🚀</div>
                <p className="font-semibold text-indigo-800">
                  You're getting started!
                </p>
                <p className="text-sm text-indigo-600">
                  Every quest completed is progress!
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-2">🌟</div>
                <p className="font-semibold text-gray-800">Ready to begin?</p>
                <p className="text-sm text-gray-600">
                  Start with your first quest today!
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuestProgress;
