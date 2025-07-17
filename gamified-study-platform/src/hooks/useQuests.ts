import { useEffect, useCallback } from 'react';
import { useQuestStore } from '../store/questStore';
import { useCourseStore } from '../store/courseStore';
import questUtils from '../utils/questUtils';
import type { Quest, Course } from '../types';

/**
 * Custom hook for quest management functionality
 */
export const useQuests = () => {
  const {
    quests,
    activeQuests,
    completedQuests,
    isLoading,
    error,
    filters,
    fetchQuests,
    generateQuestsForCourse,
    generateBalancedQuests,
    completeQuest,
    updateQuestProgress,
    handleOverdueQuests,
    updateFilters,
    resetFilters
  } = useQuestStore();
  
  const { courses } = useCourseStore();
  
  // Initialize quests on mount
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);
  
  // Check for overdue quests periodically
  useEffect(() => {
    const interval = setInterval(() => {
      handleOverdueQuests();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(interval);
  }, [handleOverdueQuests]);
  
  /**
   * Generate quests for a specific course
   */
  const generateCourseQuests = useCallback(async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    return await generateQuestsForCourse(courseId, course.syllabus);
  }, [courses, generateQuestsForCourse]);
  
  /**
   * Generate balanced quests across all courses
   */
  const generateAllQuests = useCallback(async () => {
    if (courses.length === 0) {
      throw new Error('No courses available');
    }
    
    return await generateBalancedQuests(courses);
  }, [courses, generateBalancedQuests]);
  
  /**
   * Complete a quest and handle rewards
   */
  const completeQuestWithRewards = useCallback(async (questId: string) => {
    const result = await completeQuest(questId);
    
    if (result) {
      // You could add additional reward handling here
      // For example, showing notifications, updating pet stats, etc.
      return result;
    }
    
    return null;
  }, [completeQuest]);
  
  /**
   * Update quest progress for a specific requirement type
   */
  const updateProgress = useCallback(async (
    questId: string, 
    requirementType: string, 
    amount: number
  ) => {
    return await updateQuestProgress(questId, requirementType, amount);
  }, [updateQuestProgress]);
  
  /**
   * Get quests filtered by type
   */
  const getQuestsByType = useCallback((type: string) => {
    return quests.filter(quest => quest.type === type);
  }, [quests]);
  
  /**
   * Get quests filtered by difficulty
   */
  const getQuestsByDifficulty = useCallback((difficulty: string) => {
    return quests.filter(quest => quest.difficulty === difficulty);
  }, [quests]);
  
  /**
   * Get quests for a specific course
   */
  const getQuestsByCourse = useCallback((courseId: string) => {
    return quests.filter(quest => quest.courseId === courseId);
  }, [quests]);
  
  /**
   * Get quests expiring soon (within specified hours)
   */
  const getQuestsExpiringSoon = useCallback((hours: number = 24) => {
    const cutoffTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    
    return activeQuests.filter(quest => {
      if (!quest.expiresAt) return false;
      return quest.expiresAt <= cutoffTime;
    });
  }, [activeQuests]);
  
  /**
   * Calculate total XP earned from completed quests
   */
  const getTotalXpEarned = useCallback(() => {
    return completedQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
  }, [completedQuests]);
  
  /**
   * Calculate potential XP from active quests
   */
  const getPotentialXp = useCallback(() => {
    return activeQuests.reduce((sum, quest) => sum + quest.xpReward, 0);
  }, [activeQuests]);
  
  /**
   * Get quest completion statistics
   */
  const getQuestStats = useCallback(() => {
    const total = quests.length;
    const completed = completedQuests.length;
    const active = activeQuests.length;
    const expired = quests.filter(q => q.status === 'expired').length;
    
    return {
      total,
      completed,
      active,
      expired,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      xpEarned: getTotalXpEarned(),
      potentialXp: getPotentialXp()
    };
  }, [quests, completedQuests, activeQuests, getTotalXpEarned, getPotentialXp]);
  
  /**
   * Get quest progress for a specific quest
   */
  const getQuestProgress = useCallback((quest: Quest) => {
    return questUtils.calculateQuestProgress(quest);
  }, []);
  
  /**
   * Check if a quest is completable
   */
  const isQuestCompletable = useCallback((quest: Quest) => {
    return questUtils.isQuestCompletable(quest);
  }, []);
  
  /**
   * Get recommended next quest based on user's progress and preferences
   */
  const getRecommendedQuest = useCallback(() => {
    if (activeQuests.length === 0) return null;
    
    // Prioritize quests expiring soon
    const expiringSoon = getQuestsExpiringSoon(24);
    if (expiringSoon.length > 0) {
      return expiringSoon[0];
    }
    
    // Prioritize daily quests
    const dailyQuests = activeQuests.filter(q => q.type === 'daily');
    if (dailyQuests.length > 0) {
      return dailyQuests[0];
    }
    
    // Return the first active quest
    return activeQuests[0];
  }, [activeQuests, getQuestsExpiringSoon]);
  
  /**
   * Auto-update quest progress based on study activity
   */
  const updateQuestProgressFromActivity = useCallback(async (
    activityType: 'study_session' | 'topic_complete' | 'task_complete' | 'streak_maintain',
    amount: number = 1,
    courseId?: string
  ) => {
    // Find relevant active quests
    let relevantQuests = activeQuests;
    
    // Filter by course if specified
    if (courseId) {
      relevantQuests = relevantQuests.filter(q => q.courseId === courseId);
    }
    
    // Map activity types to requirement types
    const requirementTypeMap = {
      study_session: 'study_time',
      topic_complete: 'complete_topic',
      task_complete: 'complete_tasks',
      streak_maintain: 'maintain_streak'
    };
    
    const requirementType = requirementTypeMap[activityType];
    
    // Update progress for relevant quests
    const updatePromises = relevantQuests
      .filter(quest => 
        quest.requirements.some(req => req.type === requirementType)
      )
      .map(quest => updateQuestProgress(quest.id, requirementType, amount));
    
    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating quest progress from activity:', error);
    }
  }, [activeQuests, updateQuestProgress]);
  
  return {
    // State
    quests,
    activeQuests,
    completedQuests,
    isLoading,
    error,
    filters,
    
    // Actions
    fetchQuests,
    generateCourseQuests,
    generateAllQuests,
    completeQuestWithRewards,
    updateProgress,
    updateFilters,
    resetFilters,
    handleOverdueQuests,
    
    // Getters
    getQuestsByType,
    getQuestsByDifficulty,
    getQuestsByCourse,
    getQuestsExpiringSoon,
    getTotalXpEarned,
    getPotentialXp,
    getQuestStats,
    getQuestProgress,
    isQuestCompletable,
    getRecommendedQuest,
    
    // Utilities
    updateQuestProgressFromActivity
  };
};

export default useQuests;