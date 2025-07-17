import React, { useState } from 'react';
import { useQuestStore } from '../../../store/questStore';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import { Badge } from '../../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import type { Quest, QuestRequirement } from '../../../types';

interface QuestCardProps {
  quest: Quest;
  onQuestClick?: (quest: Quest) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onQuestClick }) => {
  const { completeQuest, updateQuestProgress } = useQuestStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleComplete = async () => {
    if (quest.status === 'completed') return;
    
    setIsCompleting(true);
    try {
      const result = await completeQuest(quest.id);
      if (result?.levelUp) {
        // Show level up notification or animation
        console.log('Level up!');
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
    } finally {
      setIsCompleting(false);
    }
  };
  
  const handleProgressUpdate = async (requirementType: string, amount: number) => {
    try {
      await updateQuestProgress(quest.id, requirementType, amount);
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  };
  
  const getQuestTypeColor = () => {
    switch (quest.type) {
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
  
  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = () => {
    switch (quest.status) {
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const calculateTotalProgress = () => {
    if (!quest.requirements || quest.requirements.length === 0) return 0;
    
    const totalProgress = quest.requirements.reduce((sum, req) => sum + (req.current / req.target), 0);
    return (totalProgress / quest.requirements.length) * 100;
  };
  
  const isQuestCompletable = () => {
    if (quest.status === 'completed' || quest.status === 'expired') return false;
    
    if (!quest.requirements || quest.requirements.length === 0) return true;
    
    return quest.requirements.every(req => req.current >= req.target);
  };
  
  const formatTimeRemaining = () => {
    if (!quest.expiresAt) return 'No deadline';
    
    if (quest.expiresAt < new Date()) {
      return 'Expired';
    }
    
    return `Expires in ${formatDistanceToNow(quest.expiresAt)}`;
  };
  
  return (
    <div 
      className={`border rounded-lg shadow-sm overflow-hidden ${
        quest.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
      } ${onQuestClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={() => onQuestClick && onQuestClick(quest)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getQuestTypeColor()}>
            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
          </Badge>
          <div className="flex space-x-2">
            <Badge className={getDifficultyColor()}>
              {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
            </Badge>
            <Badge className={getStatusColor()}>
              {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-1">{quest.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold">{quest.xpReward} XP</span>
          </div>
          <div className="text-xs text-gray-500">
            {formatTimeRemaining()}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(calculateTotalProgress())}%</span>
          </div>
          <ProgressBar 
            progress={calculateTotalProgress()} 
            color={quest.status === 'completed' ? 'green' : 'blue'} 
          />
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          {quest.status !== 'completed' && quest.status !== 'expired' && (
            <Button
              size="sm"
              disabled={!isQuestCompletable() || isCompleting}
              onClick={handleComplete}
              className={isQuestCompletable() ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {isCompleting ? 'Completing...' : 'Complete Quest'}
            </Button>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium text-sm mb-2">Requirements:</h4>
          <ul className="space-y-3">
            {quest.requirements.map((req: QuestRequirement, index) => (
              <li key={index} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>{req.description}</span>
                  <span className="font-medium">
                    {req.current}/{req.target}
                  </span>
                </div>
                <ProgressBar 
                  progress={(req.current / req.target) * 100} 
                  color={req.current >= req.target ? 'green' : 'blue'} 
                  size="sm"
                />
                
                {quest.status !== 'completed' && quest.status !== 'expired' && (
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleProgressUpdate(req.type, 1)}
                    >
                      +1
                    </Button>
                    {req.type === 'study_time' && (
                      <>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleProgressUpdate(req.type, 5)}
                        >
                          +5
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleProgressUpdate(req.type, 15)}
                        >
                          +15
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          
          {quest.completedAt && (
            <div className="mt-3 text-xs text-gray-500">
              Completed {formatDistanceToNow(quest.completedAt)} ago
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestCard;