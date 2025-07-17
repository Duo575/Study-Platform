import React, { useState, useEffect } from 'react';
import { useQuestStore } from '../../../store/questStore';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Toast } from '../../ui/Toast';
import type { Quest } from '../../../types';

interface QuestNotificationProps {
  onViewQuest?: (quest: Quest) => void;
}

const QuestNotification: React.FC<QuestNotificationProps> = ({ onViewQuest }) => {
  const { activeQuests, completedQuests } = useQuestStore();
  
  const [showNewQuestToast, setShowNewQuestToast] = useState(false);
  const [showCompletedToast, setShowCompletedToast] = useState(false);
  const [newQuest, setNewQuest] = useState<Quest | null>(null);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);
  
  // Track quests to detect new ones
  const [previousActiveQuestIds, setPreviousActiveQuestIds] = useState<string[]>([]);
  const [previousCompletedQuestIds, setPreviousCompletedQuestIds] = useState<string[]>([]);
  
  useEffect(() => {
    // Check for new quests
    const currentActiveQuestIds = activeQuests.map(q => q.id);
    
    if (previousActiveQuestIds.length > 0) {
      const newQuestIds = currentActiveQuestIds.filter(id => !previousActiveQuestIds.includes(id));
      
      if (newQuestIds.length > 0) {
        const latestNewQuest = activeQuests.find(q => q.id === newQuestIds[0]) || null;
        if (latestNewQuest) {
          setNewQuest(latestNewQuest);
          setShowNewQuestToast(true);
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowNewQuestToast(false);
          }, 5000);
        }
      }
    }
    
    setPreviousActiveQuestIds(currentActiveQuestIds);
    
    // Check for newly completed quests
    const currentCompletedQuestIds = completedQuests.map(q => q.id);
    
    if (previousCompletedQuestIds.length > 0) {
      const newCompletedQuestIds = currentCompletedQuestIds.filter(
        id => !previousCompletedQuestIds.includes(id)
      );
      
      if (newCompletedQuestIds.length > 0) {
        const latestCompletedQuest = completedQuests.find(q => q.id === newCompletedQuestIds[0]) || null;
        if (latestCompletedQuest) {
          setCompletedQuest(latestCompletedQuest);
          setShowCompletedToast(true);
          
          // Auto-hide after 5 seconds
          setTimeout(() => {
            setShowCompletedToast(false);
          }, 5000);
        }
      }
    }
    
    setPreviousCompletedQuestIds(currentCompletedQuestIds);
  }, [activeQuests, completedQuests]);
  
  const handleViewNewQuest = () => {
    if (newQuest && onViewQuest) {
      onViewQuest(newQuest);
    }
    setShowNewQuestToast(false);
  };
  
  const handleViewCompletedQuest = () => {
    if (completedQuest && onViewQuest) {
      onViewQuest(completedQuest);
    }
    setShowCompletedToast(false);
  };
  
  const getQuestTypeColor = (type: string) => {
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
    <>
      {/* New Quest Toast */}
      <Toast
        isOpen={showNewQuestToast}
        onClose={() => setShowNewQuestToast(false)}
        title="New Quest Available!"
        variant="info"
      >
        {newQuest && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getQuestTypeColor(newQuest.type)}>
                {newQuest.type.charAt(0).toUpperCase() + newQuest.type.slice(1)}
              </Badge>
              <span className="text-yellow-500 font-bold">{newQuest.xpReward} XP</span>
            </div>
            <p className="font-medium">{newQuest.title}</p>
            <p className="text-sm text-gray-600">{newQuest.description}</p>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleViewNewQuest}>
                View Quest
              </Button>
            </div>
          </div>
        )}
      </Toast>
      
      {/* Completed Quest Toast */}
      <Toast
        isOpen={showCompletedToast}
        onClose={() => setShowCompletedToast(false)}
        title="Quest Completed!"
        variant="success"
      >
        {completedQuest && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getQuestTypeColor(completedQuest.type)}>
                {completedQuest.type.charAt(0).toUpperCase() + completedQuest.type.slice(1)}
              </Badge>
              <span className="text-yellow-500 font-bold">+{completedQuest.xpReward} XP</span>
            </div>
            <p className="font-medium">{completedQuest.title}</p>
            <p className="text-sm text-gray-600">You've successfully completed this quest!</p>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleViewCompletedQuest}>
                View Details
              </Button>
            </div>
          </div>
        )}
      </Toast>
    </>
  );
};

export default QuestNotification;