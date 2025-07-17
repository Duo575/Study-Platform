import React, { useState } from 'react';
import { useQuestStore } from '../../../store/questStore';
import { useCourseStore } from '../../../store/courseStore';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ProgressBar } from '../../ui/ProgressBar';
import { Badge } from '../../ui/Badge';
import { formatDistanceToNow, format } from 'date-fns';
import type { Quest, QuestRequirement } from '../../../types';

interface QuestDetailsModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
}

const QuestDetailsModal: React.FC<QuestDetailsModalProps> = ({ quest, isOpen, onClose }) => {
  const { completeQuest, updateQuestProgress } = useQuestStore();
  const { courses } = useCourseStore();
  
  const [isCompleting, setIsCompleting] = useState(false);
  
  const course = courses.find(c => c.id === quest.courseId);
  
  const handleComplete = async () => {
    if (quest.status === 'completed') return;
    
    setIsCompleting(true);
    try {
      const result = await completeQuest(quest.id);
      if (result?.levelUp) {
        // Show level up notification or animation
        console.log('Level up!');
      }
      onClose();
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
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quest Details">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={getQuestTypeColor()}>
            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)}
          </Badge>
          <Badge className={getDifficultyColor()}>
            {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
          </Badge>
          <Badge className={getStatusColor()}>
            {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
          </Badge>
          {course && (
            <Badge className="bg-gray-100 text-gray-800">
              {course.name}
            </Badge>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold">{quest.title}</h2>
          <p className="text-gray-600">{quest.description}</p>
        </div>
        
        <div className="flex justify-between items-center py-2 border-t border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold text-lg">{quest.xpReward} XP</span>
            <span className="text-gray-500 text-sm ml-2">Reward</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {quest.expiresAt && (
              <div>
                <span className="font-medium">Expires:</span> {format(quest.expiresAt, 'MMM d, yyyy')}
                <span className="ml-1 text-xs">({formatDistanceToNow(quest.expiresAt)} left)</span>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(calculateTotalProgress())}%</span>
          </div>
          <ProgressBar 
            progress={calculateTotalProgress()} 
            color={quest.status === 'completed' ? 'green' : 'blue'} 
          />
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Requirements:</h3>
          <ul className="space-y-4">
            {quest.requirements.map((req: QuestRequirement, index) => (
              <li key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{req.description}</span>
                  <span>
                    {req.current}/{req.target}
                  </span>
                </div>
                <ProgressBar 
                  progress={(req.current / req.target) * 100} 
                  color={req.current >= req.target ? 'green' : 'blue'} 
                />
                
                {quest.status !== 'completed' && quest.status !== 'expired' && (
                  <div className="mt-3 flex justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleProgressUpdate(req.type, 1)}
                    >
                      +1
                    </Button>
                    {req.type === 'study_time' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProgressUpdate(req.type, 5)}
                        >
                          +5
                        </Button>
                        <Button
                          size="sm"
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
        </div>
        
        {quest.createdAt && (
          <div className="text-sm text-gray-500">
            Created {formatDistanceToNow(quest.createdAt)} ago
          </div>
        )}
        
        {quest.completedAt && (
          <div className="text-sm text-gray-500">
            Completed {formatDistanceToNow(quest.completedAt)} ago
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {quest.status !== 'completed' && quest.status !== 'expired' && (
            <Button
              disabled={!isQuestCompletable() || isCompleting}
              onClick={handleComplete}
              className={isQuestCompletable() ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              {isCompleting ? 'Completing...' : 'Complete Quest'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuestDetailsModal;