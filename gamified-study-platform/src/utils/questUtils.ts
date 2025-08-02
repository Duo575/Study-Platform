// import { v4 as uuidv4 } from 'uuid';
import type {
  Quest,
  QuestType,
  QuestDifficulty,
  QuestRequirement,
  SyllabusItem,
  Course,
} from '../types';

/**
 * Utility functions for quest generation and management
 */
export const questUtils = {
  /**
   * Generate quest title based on type and course content
   */
  generateQuestTitle(
    type: QuestType,
    difficulty: QuestDifficulty,
    topic?: string
  ): string {
    const dailyTitles = [
      'Daily Study Challenge',
      'Quick Knowledge Boost',
      "Today's Learning Goal",
      'Daily Brain Exercise',
      'Study Sprint',
    ];

    const weeklyTitles = [
      'Weekly Deep Dive',
      'Week-long Challenge',
      'Weekly Mastery Goal',
      'Seven Day Study Plan',
      'Weekly Knowledge Builder',
    ];

    const milestoneTitles = [
      'Major Achievement',
      'Knowledge Milestone',
      'Subject Mastery',
      'Expert Level Challenge',
      'Comprehensive Understanding',
    ];

    const bonusTitles = [
      'Bonus Challenge',
      'Extra Credit',
      'Special Achievement',
      'Bonus XP Opportunity',
      'Exceptional Task',
    ];

    let titles: string[] = [];

    switch (type) {
      case 'daily':
        titles = dailyTitles;
        break;
      case 'weekly':
        titles = weeklyTitles;
        break;
      case 'milestone':
        titles = milestoneTitles;
        break;
      case 'bonus':
        titles = bonusTitles;
        break;
    }

    // Select a random title
    const baseTitle = titles[Math.floor(Math.random() * titles.length)];

    // Add topic if available
    if (topic) {
      return `${baseTitle}: ${topic}`;
    }

    return baseTitle;
  },

  /**
   * Generate quest description based on type, difficulty, and requirements
   */
  generateQuestDescription(
    type: QuestType,
    difficulty: QuestDifficulty,
    _requirements: QuestRequirement[],
    topic?: string
  ): string {
    let description = '';

    switch (type) {
      case 'daily':
        description =
          'Complete this daily quest to maintain your study streak and earn XP.';
        break;
      case 'weekly':
        description =
          'A week-long challenge to deepen your understanding and build consistent study habits.';
        break;
      case 'milestone':
        description =
          'A significant achievement that demonstrates mastery of important concepts.';
        break;
      case 'bonus':
        description =
          'Special bonus quest with extra XP rewards for going above and beyond.';
        break;
    }

    // Add topic-specific information
    if (topic) {
      description += ` Focus on ${topic} to complete this quest.`;
    }

    // Add difficulty-specific information
    switch (difficulty) {
      case 'easy':
        description +=
          ' This is an easy quest that should be quick to complete.';
        break;
      case 'medium':
        description += ' This quest requires moderate effort and focus.';
        break;
      case 'hard':
        description +=
          ' This challenging quest will test your dedication and understanding.';
        break;
    }

    return description;
  },

  /**
   * Calculate appropriate XP reward based on quest type and difficulty
   */
  calculateXpReward(type: QuestType, difficulty: QuestDifficulty): number {
    // Base XP values
    const baseXp = {
      daily: 20,
      weekly: 50,
      milestone: 100,
      bonus: 75,
    };

    // Difficulty multipliers
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };

    return Math.round(baseXp[type] * difficultyMultiplier[difficulty]);
  },

  /**
   * Generate quest requirements based on type and difficulty
   */
  generateRequirements(
    type: QuestType,
    difficulty: QuestDifficulty,
    topic?: string
  ): QuestRequirement[] {
    const requirements: QuestRequirement[] = [];

    switch (type) {
      case 'daily':
        // Study time requirement
        requirements.push({
          type: 'study_time',
          target:
            difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 45,
          current: 0,
          description: `Study for ${difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 45} minutes`,
        });

        // Add topic completion for medium and hard difficulties
        if (difficulty !== 'easy' && topic) {
          requirements.push({
            type: 'complete_topic',
            target: 1,
            current: 0,
            description: `Complete the ${topic} topic`,
          });
        }
        break;

      case 'weekly':
        // Study time requirement (longer)
        requirements.push({
          type: 'study_time',
          target:
            difficulty === 'easy' ? 60 : difficulty === 'medium' ? 120 : 180,
          current: 0,
          description: `Study for ${difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3} hours this week`,
        });

        // Streak requirement for medium and hard difficulties
        if (difficulty !== 'easy') {
          requirements.push({
            type: 'maintain_streak',
            target: difficulty === 'medium' ? 3 : 5,
            current: 0,
            description: `Maintain a study streak for ${difficulty === 'medium' ? 3 : 5} days`,
          });
        }
        break;

      case 'milestone':
        // Topic completion requirement
        requirements.push({
          type: 'complete_topic',
          target: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
          current: 0,
          description: `Complete ${difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3} topic${difficulty === 'easy' ? '' : 's'}`,
        });

        // Study time requirement
        requirements.push({
          type: 'study_time',
          target:
            difficulty === 'easy' ? 90 : difficulty === 'medium' ? 180 : 300,
          current: 0,
          description: `Study for ${difficulty === 'easy' ? '1.5' : difficulty === 'medium' ? '3' : '5'} hours total`,
        });
        break;

      case 'bonus':
        // Task completion requirement
        requirements.push({
          type: 'complete_tasks',
          target: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 10,
          current: 0,
          description: `Complete ${difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 10} todo items`,
        });

        // For hard difficulty, add streak requirement
        if (difficulty === 'hard') {
          requirements.push({
            type: 'maintain_streak',
            target: 7,
            current: 0,
            description: 'Maintain a 7-day study streak',
          });
        }
        break;
    }

    return requirements;
  },

  /**
   * Generate expiration date based on quest type
   */
  generateExpirationDate(type: QuestType): Date {
    const now = new Date();

    switch (type) {
      case 'daily': {
        // Expires at the end of the day
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      }

      case 'weekly': {
        // Expires in 7 days
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
      }

      case 'milestone': {
        // Expires in 30 days
        const nextMonth = new Date(now);
        nextMonth.setDate(nextMonth.getDate() + 30);
        return nextMonth;
      }

      case 'bonus': {
        // Expires in 14 days
        const twoWeeks = new Date(now);
        twoWeeks.setDate(twoWeeks.getDate() + 14);
        return twoWeeks;
      }

      default: {
        // Default to 7 days
        const sevenDays = new Date(now);
        sevenDays.setDate(sevenDays.getDate() + 7);
        return sevenDays;
      }
    }
  },

  /**
   * Generate a quest object with all required properties
   */
  generateQuest(
    type: QuestType,
    difficulty: QuestDifficulty,
    courseId?: string,
    topic?: string
  ): Partial<Quest> {
    const requirements = this.generateRequirements(type, difficulty, topic);
    const title = this.generateQuestTitle(type, difficulty, topic);
    const description = this.generateQuestDescription(
      type,
      difficulty,
      requirements,
      topic
    );
    const xpReward = this.calculateXpReward(type, difficulty);
    const expiresAt = this.generateExpirationDate(type);

    return {
      title,
      description,
      type,
      difficulty,
      xpReward,
      requirements,
      status: 'available',
      courseId,
      expiresAt,
    };
  },

  /**
   * Generate a set of quests for a course based on its syllabus
   */
  generateQuestsForCourse(
    courseId: string,
    syllabus: SyllabusItem[]
  ): Partial<Quest>[] {
    const quests: Partial<Quest>[] = [];

    // Get active (not completed) syllabus items
    const activeItems = syllabus.filter(item => !item.completed);

    if (activeItems.length === 0) {
      return quests;
    }

    // Generate daily quests
    activeItems.slice(0, 2).forEach(item => {
      // Generate an easy daily quest
      quests.push(this.generateQuest('daily', 'easy', courseId, item.title));

      // For high priority items, add a medium difficulty quest too
      if (item.priority === 'high') {
        quests.push(
          this.generateQuest('daily', 'medium', courseId, item.title)
        );
      }
    });

    // Generate weekly quests (1-2 based on syllabus size)
    if (activeItems.length > 0) {
      quests.push(
        this.generateQuest('weekly', 'medium', courseId, activeItems[0].title)
      );

      if (activeItems.length >= 3) {
        quests.push(
          this.generateQuest('weekly', 'hard', courseId, activeItems[1].title)
        );
      }
    }

    // Generate milestone quests (1 per active syllabus item, up to 3)
    activeItems.slice(0, 3).forEach(item => {
      const difficulty: QuestDifficulty =
        item.priority === 'high'
          ? 'hard'
          : item.priority === 'medium'
            ? 'medium'
            : 'easy';

      quests.push(
        this.generateQuest('milestone', difficulty, courseId, item.title)
      );
    });

    // Generate 1 bonus quest if there are high priority items
    const highPriorityItems = activeItems.filter(
      item => item.priority === 'high'
    );
    if (highPriorityItems.length > 0) {
      quests.push(
        this.generateQuest(
          'bonus',
          'hard',
          courseId,
          highPriorityItems[0].title
        )
      );
    }

    return quests;
  },

  /**
   * Calculate course weights for balanced quest generation
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
   * Generate balanced quests across multiple courses
   */
  generateBalancedQuests(courses: Course[]): Partial<Quest>[] {
    const quests: Partial<Quest>[] = [];

    if (courses.length === 0) {
      return quests;
    }

    // Calculate course weights
    const courseWeights = this.calculateCourseWeights(courses);

    // Determine how many quests to generate per course (minimum 1, maximum 5)
    const questsPerCourse = courseWeights.map(({ courseId, weight }) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return { courseId, count: 0 };

      // Base count on weight, but ensure at least 1 and at most 5 quests per course
      const count = Math.min(5, Math.max(1, Math.round(weight * 3)));

      return { courseId, count };
    });

    // Generate quests for each course based on the calculated counts
    for (const { courseId, count } of questsPerCourse) {
      const course = courses.find(c => c.id === courseId);
      if (!course || count === 0) continue;

      // Get active syllabus items
      const activeItems = course.syllabus.filter(item => !item.completed);
      if (activeItems.length === 0) continue;

      // Determine quest types based on count
      const questTypes: QuestType[] = [];

      // Always include at least one daily quest
      questTypes.push('daily');

      // Add weekly quest if count >= 2
      if (count >= 2) {
        questTypes.push('weekly');
      }

      // Add milestone quest if count >= 3
      if (count >= 3) {
        questTypes.push('milestone');
      }

      // Add bonus quest if count >= 4
      if (count >= 4) {
        questTypes.push('bonus');
      }

      // Add another daily quest if count >= 5
      if (count >= 5) {
        questTypes.push('daily');
      }

      // Generate quests for each type
      for (const type of questTypes) {
        // Select a random active item for the quest
        const item =
          activeItems[Math.floor(Math.random() * activeItems.length)];

        // Determine difficulty based on item priority
        const difficulty: QuestDifficulty =
          item.priority === 'high'
            ? 'hard'
            : item.priority === 'medium'
              ? 'medium'
              : 'easy';

        // Generate the quest
        quests.push(this.generateQuest(type, difficulty, courseId, item.title));
      }
    }

    return quests;
  },

  /**
   * Check if a quest is completable based on its requirements
   */
  isQuestCompletable(quest: Quest): boolean {
    if (quest.status === 'completed' || quest.status === 'expired') {
      return false;
    }

    if (!quest.requirements || quest.requirements.length === 0) {
      return true;
    }

    return quest.requirements.every(req => req.current >= req.target);
  },

  /**
   * Calculate overall progress percentage for a quest
   */
  calculateQuestProgress(quest: Quest): number {
    if (quest.status === 'completed') {
      return 100;
    }

    if (!quest.requirements || quest.requirements.length === 0) {
      return 0;
    }

    const totalProgress = quest.requirements.reduce((sum, req) => {
      return sum + req.current / req.target;
    }, 0);

    return Math.min(
      100,
      Math.round((totalProgress / quest.requirements.length) * 100)
    );
  },
};

export default questUtils;
