import { v4 as uuidv4 } from 'uuid';
import { questService as dbQuestService } from './database';
import { getCurrentUser } from '../lib/supabase';
import questUtils from '../utils/questUtils';
import type {
  Quest,
  QuestType,
  QuestDifficulty,
  QuestRequirement,
  SyllabusItem,
  Course,
} from '../types';

/**
 * Service for generating and managing quests
 */
export const questService = {
  /**
   * Generate quests based on syllabus content
   */
  async generateQuestsFromSyllabus(
    courseId: string,
    syllabus: SyllabusItem[]
  ): Promise<Quest[]> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const generatedQuests: Quest[] = [];

      // Generate daily quests
      const dailyQuests = this.generateDailyQuests(courseId, syllabus);
      for (const quest of dailyQuests) {
        const dbQuest = await dbQuestService.create({
          user_id: user.id,
          course_id: courseId,
          title: quest.title || 'Untitled Quest',
          description: quest.description,
          type: quest.type || 'daily',
          difficulty: quest.difficulty,
          xp_reward: quest.xpReward,
          requirements: quest.requirements as any, // Cast to any for JSON compatibility
          status: 'available',
          expires_at: quest.expiresAt?.toISOString(),
        });

        generatedQuests.push({
          ...quest,
          id: dbQuest.id,
          title: quest.title || 'Untitled Quest',
          type: quest.type || 'daily',
          createdAt: new Date(dbQuest.created_at),
        } as Quest);
      }

      // Generate weekly quests
      const weeklyQuests = this.generateWeeklyQuests(courseId, syllabus);
      for (const quest of weeklyQuests) {
        const dbQuest = await dbQuestService.create({
          user_id: user.id,
          course_id: courseId,
          title: quest.title || 'Untitled Quest',
          description: quest.description,
          type: quest.type || 'daily',
          difficulty: quest.difficulty,
          xp_reward: quest.xpReward,
          requirements: quest.requirements as any, // Cast to any for JSON compatibility
          status: 'available',
          expires_at: quest.expiresAt?.toISOString(),
        });

        generatedQuests.push({
          ...quest,
          id: dbQuest.id,
          title: quest.title || 'Untitled Quest',
          type: quest.type || 'daily',
          createdAt: new Date(dbQuest.created_at),
        } as Quest);
      }

      // Generate milestone quests
      const milestoneQuests = this.generateMilestoneQuests(courseId, syllabus);
      for (const quest of milestoneQuests) {
        const dbQuest = await dbQuestService.create({
          user_id: user.id,
          course_id: courseId,
          title: quest.title || 'Untitled Quest',
          description: quest.description,
          type: quest.type || 'daily',
          difficulty: quest.difficulty,
          xp_reward: quest.xpReward,
          requirements: quest.requirements as any, // Cast to any for JSON compatibility
          status: 'available',
          expires_at: quest.expiresAt?.toISOString(),
        });

        generatedQuests.push({
          ...quest,
          id: dbQuest.id,
          title: quest.title || 'Untitled Quest',
          type: quest.type || 'daily',
          createdAt: new Date(dbQuest.created_at),
        } as Quest);
      }

      return generatedQuests;
    } catch (error) {
      console.error('Error generating quests:', error);
      throw error;
    }
  },

  /**
   * Generate daily quests based on syllabus content
   */
  generateDailyQuests(
    courseId: string,
    syllabus: SyllabusItem[]
  ): Partial<Quest>[] {
    // Get active topics (not completed)
    const activeTopics = syllabus.filter(item => !item.completed);

    if (activeTopics.length === 0) {
      return [];
    }

    // Use questUtils to generate daily quests
    const quests: Partial<Quest>[] = [];

    // Generate an easy daily quest
    quests.push(
      questUtils.generateQuest('daily', 'easy', courseId, activeTopics[0].title)
    );

    // Generate a medium daily quest if there are topics
    if (activeTopics[0].topics.length > 0) {
      quests.push(
        questUtils.generateQuest(
          'daily',
          'medium',
          courseId,
          activeTopics[0].topics[0]
        )
      );
    }

    return quests;
  },

  /**
   * Generate weekly quests based on syllabus content
   */
  generateWeeklyQuests(
    courseId: string,
    syllabus: SyllabusItem[]
  ): Partial<Quest>[] {
    // Get active topics (not completed)
    const activeTopics = syllabus.filter(item => !item.completed);

    if (activeTopics.length === 0) {
      return [];
    }

    // Use questUtils to generate weekly quests
    const quests: Partial<Quest>[] = [];

    // Generate a medium weekly quest
    quests.push(
      questUtils.generateQuest(
        'weekly',
        'medium',
        courseId,
        activeTopics[0].title
      )
    );

    // Generate a hard weekly consistency quest
    quests.push({
      title: 'Weekly Consistency Challenge',
      description:
        'Maintain your study streak for 5 days this week to build strong study habits',
      type: 'weekly',
      difficulty: 'hard',
      xpReward: questUtils.calculateXpReward('weekly', 'hard'),
      requirements: [
        {
          type: 'maintain_streak',
          target: 5,
          current: 0,
          description: 'Study for 5 consecutive days',
        },
      ],
      status: 'available',
      courseId,
      expiresAt: questUtils.generateExpirationDate('weekly'),
    });

    return quests;
  },

  /**
   * Generate milestone quests based on syllabus content
   */
  generateMilestoneQuests(
    courseId: string,
    syllabus: SyllabusItem[]
  ): Partial<Quest>[] {
    const quests: Partial<Quest>[] = [];

    // Generate a milestone quest for each syllabus item
    for (const item of syllabus) {
      if (item.completed) continue;

      // Determine difficulty based on item priority
      const difficulty: QuestDifficulty =
        item.priority === 'high'
          ? 'hard'
          : item.priority === 'medium'
            ? 'medium'
            : 'easy';

      // Use questUtils to generate milestone quest
      const quest = questUtils.generateQuest(
        'milestone',
        difficulty,
        courseId,
        item.title
      );

      // Override some properties to make it specific to the syllabus item
      const milestoneQuest: Partial<Quest> = {
        ...quest,
        title: `Master ${item.title}`,
        description: `Complete all topics in ${item.title} to demonstrate mastery of this subject`,
        requirements: [
          {
            type: 'complete_topic',
            target: item.topics.length,
            current: 0,
            description: `Complete all ${item.topics.length} topics in ${item.title}`,
          },
          {
            type: 'study_time',
            target: Math.round(item.estimatedHours * 60), // Convert hours to minutes
            current: 0,
            description: `Study for ${item.estimatedHours} hour${item.estimatedHours !== 1 ? 's' : ''}`,
          },
        ],
        // Milestone quests expire based on the deadline if available, otherwise 30 days
        expiresAt:
          item.deadline || questUtils.generateExpirationDate('milestone'),
      };

      quests.push(milestoneQuest);
    }

    return quests;
  },

  /**
   * Generate bonus quests for additional challenges
   */
  generateBonusQuests(courseId: string): Partial<Quest>[] {
    // Use questUtils to generate bonus quests
    const quests: Partial<Quest>[] = [];

    // Generate a streak bonus quest
    quests.push({
      title: 'Streak Master',
      description:
        'Maintain a 10-day study streak for a massive XP bonus and improved retention',
      type: 'bonus',
      difficulty: 'hard',
      xpReward: questUtils.calculateXpReward('bonus', 'hard'),
      requirements: [
        {
          type: 'maintain_streak',
          target: 10,
          current: 0,
          description: 'Study for 10 consecutive days',
        },
      ],
      status: 'available',
      courseId,
      expiresAt: questUtils.generateExpirationDate('bonus'),
    });

    // Generate a task completion bonus quest
    quests.push({
      title: 'Task Champion',
      description:
        'Complete 20 todo items for a special reward and productivity boost',
      type: 'bonus',
      difficulty: 'medium',
      xpReward: questUtils.calculateXpReward('bonus', 'medium'),
      requirements: [
        {
          type: 'complete_tasks',
          target: 20,
          current: 0,
          description: 'Complete 20 todo items',
        },
      ],
      status: 'available',
      courseId,
      expiresAt: questUtils.generateExpirationDate('bonus'),
    });

    return quests;
  },

  /**
   * Generate balanced quests for multiple courses
   */
  async generateBalancedQuests(courses: Course[]): Promise<Quest[]> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const generatedQuests: Quest[] = [];

      // Use questUtils to generate balanced quests
      const balancedQuests = questUtils.generateBalancedQuests(courses);

      // Save the generated quests to the database
      for (const quest of balancedQuests) {
        const dbQuest = await dbQuestService.create({
          user_id: user.id,
          course_id: quest.courseId || null,
          title: quest.title || '',
          description: quest.description || '',
          type: quest.type as any,
          difficulty: quest.difficulty as any,
          xp_reward: quest.xpReward || 0,
          requirements: (quest.requirements || []) as any,
          status: 'available',
          expires_at: quest.expiresAt?.toISOString(),
        });

        generatedQuests.push({
          ...(quest as Quest),
          id: dbQuest.id,
          createdAt: new Date(dbQuest.created_at),
        });
      }

      return generatedQuests;
    } catch (error) {
      console.error('Error generating balanced quests:', error);
      throw error;
    }
  },

  /**
   * Calculate weights for each course to balance quest generation
   */
  calculateCourseWeights(
    courses: Course[]
  ): { courseId: string; weight: number }[] {
    const weights: { courseId: string; weight: number }[] = [];

    for (const course of courses) {
      // Base weight starts at 1
      let weight = 1;

      // Adjust weight based on progress (less progress = higher weight)
      weight *= 1 + (1 - course.progress.completionPercentage / 100);

      // Adjust weight based on priority of syllabus items
      const highPriorityItems = course.syllabus.filter(
        item => !item.completed && item.priority === 'high'
      ).length;

      weight *= 1 + highPriorityItems * 0.1;

      // Adjust weight based on deadlines
      const itemsWithDeadlines = course.syllabus.filter(
        item => !item.completed && item.deadline && item.deadline > new Date()
      );

      if (itemsWithDeadlines.length > 0) {
        // Find the closest deadline
        const closestDeadline = new Date(
          Math.min(...itemsWithDeadlines.map(item => item.deadline!.getTime()))
        );

        const daysUntilDeadline = Math.max(
          1,
          Math.ceil(
            (closestDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        );

        // Closer deadlines get higher weight
        weight *= 1 + 7 / daysUntilDeadline;
      }

      weights.push({ courseId: course.id, weight });
    }

    // Normalize weights so they sum to the number of courses
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    const normalizedWeights = weights.map(item => ({
      courseId: item.courseId,
      weight: (item.weight * courses.length) / totalWeight,
    }));

    return normalizedWeights;
  },

  /**
   * Handle overdue quests by adjusting difficulty and providing catch-up options
   */
  async handleOverdueQuests(userId: string): Promise<void> {
    try {
      // Get all expired quests
      const quests = await dbQuestService.getByUserId(userId);
      const expiredQuests = quests.filter(
        quest =>
          quest.status === 'available' &&
          quest.expires_at &&
          new Date(quest.expires_at) < new Date()
      );

      for (const quest of expiredQuests) {
        // For daily and weekly quests, create a catch-up version with adjusted difficulty
        if (quest.type === 'daily' || quest.type === 'weekly') {
          // Create a new catch-up quest with reduced requirements
          const requirements = quest.requirements as QuestRequirement[];
          const adjustedRequirements = requirements.map(req => ({
            ...req,
            target: Math.max(1, Math.floor(req.target * 0.7)), // Reduce target by 30%
          }));

          await dbQuestService.create({
            user_id: userId,
            course_id: quest.course_id,
            title: `Catch-up: ${quest.title}`,
            description: `${quest.description} (Catch-up version with adjusted difficulty)`,
            type: quest.type,
            difficulty: 'easy', // Reduce difficulty
            xp_reward: Math.floor(quest.xp_reward * 0.8), // Reduce XP reward by 20%
            requirements: adjustedRequirements,
            status: 'available',
            expires_at: this.getDateInFuture(2).toISOString(), // Short expiration
          });
        }

        // Mark the original quest as expired
        await dbQuestService.update(quest.id, { status: 'expired' });
      }
    } catch (error) {
      console.error('Error handling overdue quests:', error);
      throw error;
    }
  },

  /**
   * Complete a quest and award XP
   */
  async completeQuest(questId: string): Promise<{
    xpAwarded: number;
    levelUp: boolean;
    petUpdated: boolean;
  }> {
    try {
      // Get the quest
      const { data: quest } = await dbQuestService.complete(questId);

      if (!quest) {
        throw new Error('Quest not found');
      }

      // Award XP using gamification service
      const gamificationService = (await import('./gamificationService'))
        .default;
      const result = await gamificationService.handleStudyActivity(
        quest.user_id,
        'quest_complete',
        undefined,
        quest.difficulty
      );

      return result;
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  },

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    questId: string,
    requirementType: string,
    progress: number
  ): Promise<Quest> {
    try {
      // Get the quest
      const { data: quest } = await dbQuestService.update(questId, {});

      if (!quest) {
        throw new Error('Quest not found');
      }

      // Update the requirement progress
      const requirements = quest.requirements as QuestRequirement[];
      const updatedRequirements = requirements.map(req => {
        if (req.type === requirementType) {
          return {
            ...req,
            current: Math.min(req.target, req.current + progress),
          };
        }
        return req;
      });

      // Check if all requirements are met
      const allRequirementsMet = updatedRequirements.every(
        req => req.current >= req.target
      );

      // Update the quest
      const { data: updatedQuest } = await dbQuestService.update(questId, {
        requirements: updatedRequirements as any,
        status: allRequirementsMet ? 'completed' : 'active',
        completed_at: allRequirementsMet ? new Date().toISOString() : null,
      });

      if (!updatedQuest) {
        throw new Error('Failed to update quest');
      }

      // If all requirements are met, award XP
      if (allRequirementsMet) {
        await this.completeQuest(questId);
      }

      // Convert to frontend Quest type
      return {
        id: updatedQuest.id,
        title: updatedQuest.title,
        description: updatedQuest.description || '',
        type: updatedQuest.type,
        xpReward: updatedQuest.xp_reward,
        difficulty: updatedQuest.difficulty,
        requirements: updatedQuest.requirements as QuestRequirement[],
        status: updatedQuest.status,
        courseId: updatedQuest.course_id || undefined,
        createdAt: new Date(updatedQuest.created_at),
        expiresAt: updatedQuest.expires_at
          ? new Date(updatedQuest.expires_at)
          : undefined,
        completedAt: updatedQuest.completed_at
          ? new Date(updatedQuest.completed_at)
          : undefined,
      };
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  },

  // Helper methods for date calculations
  getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return tomorrow;
  },

  getNextWeek(): Date {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    return nextWeek;
  },

  getDateInFuture(days: number): Date {
    const future = new Date();
    future.setDate(future.getDate() + days);
    future.setHours(23, 59, 59, 999);
    return future;
  },
};

export default questService;
