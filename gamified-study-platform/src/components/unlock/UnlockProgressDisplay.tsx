/**
 * Unlock Progress Display Component
 *
 * This component displays the progress toward unlocking environments,
 * themes, and other content based on study achievements.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useUnlockSystem,
  useEnvironmentUnlocks,
  useThemeUnlocks,
} from '../../hooks/useUnlockSystem';
import type {
  UnlockableContent,
  UnlockProgress,
} from '../../services/unlockManager';

interface UnlockProgressDisplayProps {
  className?: string;
  showOnlyUnlockable?: boolean;
  contentType?: UnlockableContent['type'] | 'all';
}

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-300 bg-blue-50',
  epic: 'border-purple-300 bg-purple-50',
  legendary: 'border-yellow-300 bg-yellow-50',
};

const rarityTextColors = {
  common: 'text-gray-700',
  rare: 'text-blue-700',
  epic: 'text-purple-700',
  legendary: 'text-yellow-700',
};

const typeIcons = {
  environment: '🌍',
  theme: '🎨',
  pet_accessory: '👑',
  music_pack: '🎵',
  decoration: '✨',
};

export const UnlockProgressDisplay: React.FC<UnlockProgressDisplayProps> = ({
  className = '',
  showOnlyUnlockable = false,
  contentType = 'all',
}) => {
  const unlockSystem = useUnlockSystem();
  const [selectedTab, setSelectedTab] = useState<
    UnlockableContent['type'] | 'all'
  >('all');
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);

  // Filter content based on props
  const getFilteredProgress = (): UnlockProgress[] => {
    let allProgress: UnlockProgress[] = [];

    if (contentType === 'all' || contentType === 'environment') {
      allProgress = [...allProgress, ...unlockSystem.environmentProgress];
    }
    if (contentType === 'all' || contentType === 'theme') {
      allProgress = [...allProgress, ...unlockSystem.themeProgress];
    }
    if (contentType === 'all' || contentType === 'pet_accessory') {
      allProgress = [...allProgress, ...unlockSystem.accessoryProgress];
    }

    if (showOnlyUnlockable) {
      allProgress = allProgress.filter(progress => progress.canUnlock);
    }

    return allProgress;
  };

  const filteredProgress = getFilteredProgress();
  const availableContent = unlockSystem.availableContent;

  const handleUnlock = async (contentId: string) => {
    const result = await unlockSystem.unlockContent(contentId);
    if (result.success) {
      setShowUnlockModal(null);
      // Show success notification (could be handled by a toast system)
      console.log('Unlocked:', result.message);
    } else {
      // Show error notification
      console.error('Failed to unlock:', result.error);
    }
  };

  const getContentForProgress = (
    progress: UnlockProgress
  ): UnlockableContent | undefined => {
    return availableContent.find(content => content.id === progress.contentId);
  };

  if (unlockSystem.isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Unlock Progress
        </h3>
        <p className="text-gray-600 text-sm">
          Complete study milestones to unlock new environments, themes, and
          accessories
        </p>
      </div>

      {/* Content Type Tabs */}
      {contentType === 'all' && (
        <div className="px-6 pt-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'environment', 'theme', 'pet_accessory'] as const).map(
              type => (
                <button
                  key={type}
                  onClick={() => setSelectedTab(type)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === type
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {type === 'all'
                    ? 'All'
                    : type === 'environment'
                      ? '🌍 Environments'
                      : type === 'theme'
                        ? '🎨 Themes'
                        : '👑 Accessories'}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Progress List */}
      <div className="p-6">
        {filteredProgress.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-600">
              {showOnlyUnlockable
                ? 'No content ready to unlock yet. Keep studying to unlock new content!'
                : 'No unlock progress available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProgress.map(progress => {
              const content = getContentForProgress(progress);
              if (!content) return null;

              return (
                <motion.div
                  key={progress.contentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 rounded-lg p-4 ${rarityColors[content.rarity]} ${
                    progress.canUnlock ? 'ring-2 ring-green-200' : ''
                  }`}
                >
                  {/* Content Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{typeIcons[content.type]}</div>
                      <div>
                        <h4
                          className={`font-semibold ${rarityTextColors[content.rarity]}`}
                        >
                          {content.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {content.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              content.rarity === 'legendary'
                                ? 'bg-yellow-100 text-yellow-800'
                                : content.rarity === 'epic'
                                  ? 'bg-purple-100 text-purple-800'
                                  : content.rarity === 'rare'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {content.rarity}
                          </span>
                          {content.coinCost && (
                            <span className="text-xs text-gray-600">
                              💰 {content.coinCost} coins
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {progress.canUnlock && (
                      <button
                        onClick={() => setShowUnlockModal(content.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        Unlock Now!
                      </button>
                    )}
                  </div>

                  {/* Overall Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Overall Progress
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {progress.overallProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${
                          progress.canUnlock ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.overallProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Individual Requirements */}
                  <div className="space-y-2">
                    {progress.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              req.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <span
                            className={
                              req.completed ? 'text-green-700' : 'text-gray-600'
                            }
                          >
                            {req.description}
                          </span>
                        </div>
                        <span
                          className={`font-medium ${
                            req.completed ? 'text-green-700' : 'text-gray-600'
                          }`}
                        >
                          {req.current}/{req.target}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Missing Requirements */}
                  {!progress.canUnlock &&
                    progress.missingRequirements.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800 font-medium mb-1">
                          Still needed:
                        </p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                          {progress.missingRequirements.map((req, index) => (
                            <li
                              key={index}
                              className="flex items-center space-x-1"
                            >
                              <span>•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unlock Confirmation Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUnlockModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const content = availableContent.find(
                  c => c.id === showUnlockModal
                );
                if (!content) return null;

                return (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {typeIcons[content.type]}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Unlock {content.name}?
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {content.description}
                      </p>
                      {content.coinCost && (
                        <p className="text-sm text-gray-700 mt-2">
                          Cost: 💰 {content.coinCost} coins
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowUnlockModal(null)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUnlock(content.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Unlock
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnlockProgressDisplay;
