import { create } from 'zustand';
import { questService as dbQuestService } from '../services/database';
import questService from '../services/questService';
import { getCurrentUser } from '../lib/supabase';
import { MOCK_MODE } from '../services/mockDatabase';
import type { Quest, QuestFilters, QuestStatus, Course } from '../types';

interface QuestState {
  quests: Quest[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  isLoading: boolean;
  error: string | null;
  filters: QuestFilters;

  // Actions
  fetchQuests: () => Promise<void>;
  fetchQuestById: (id: string) => Promise<Quest | null>;
  generateQuestsForCourse: (
    courseId: string,
    syllabus: any[]
  ) => Promise<Quest[]>;
  generateBalancedQuests: (courses: Course[]) => Promise<Quest[]>;
  completeQuest: (questId: string) => Promise<{
    xpAwarded: number;
    levelUp: boolean;
    petUpdated: boolean;
  } | null>;
  updateQuestProgress: (
    questId: string,
    requirementType: string,
    progress: number
  ) => Promise<Quest | null>;
  handleOverdueQuests: () => Promise<void>;
  updateFilters: (newFilters: Partial<QuestFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const defaultFilters: QuestFilters = {
  type: 'all',
  difficulty: 'all',
  status: 'all',
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  activeQuests: [],
  completedQuests: [],
  isLoading: false,
  error: null,
  filters: defaultFilters,

  fetchQuests: async () => {
    try {
      set({ isLoading: true, error: null });

      // Use mock data if in mock mode or if database fails
      if (MOCK_MODE) {
        console.log('🔧 Using mock quest data');
        const mockQuests: Quest[] = [
          {
            id: '1',
            title: 'Complete React Basics',
            description: 'Finish the first 3 lessons of React fundamentals',
            type: 'daily',
            xpReward: 50,
            difficulty: 'easy',
            requirements: [
              {
                type: 'complete_topic',
                target: 3,
                current: 1,
                description: 'Complete 3 React lessons',
              },
            ],
            status: 'active',
            courseId: '1',
            createdAt: new Date('2024-01-20'),
            expiresAt: new Date('2024-01-25'),
          },
          {
            id: '2',
            title: 'Study for 2 Hours',
            description: 'Maintain focus and study for 2 consecutive hours',
            type: 'daily',
            xpReward: 75,
            difficulty: 'medium',
            requirements: [
              {
                type: 'study_time',
                target: 120,
                current: 45,
                description: 'Study for 120 minutes',
              },
            ],
            status: 'active',
            createdAt: new Date('2024-01-21'),
            expiresAt: new Date('2024-01-22'),
          },
          {
            id: '3',
            title: 'Weekly Streak Master',
            description: 'Study every day for 7 consecutive days',
            type: 'weekly',
            xpReward: 200,
            difficulty: 'hard',
            requirements: [
              {
                type: 'maintain_streak',
                target: 7,
                current: 3,
                description: 'Maintain 7-day study streak',
              },
            ],
            status: 'active',
            createdAt: new Date('2024-01-15'),
            expiresAt: new Date('2024-01-28'),
          },
          {
            id: '4',
            title: 'JavaScript Master',
            description: 'Complete all JavaScript fundamentals',
            type: 'milestone',
            xpReward: 150,
            difficulty: 'medium',
            requirements: [
              {
                type: 'complete_topic',
                target: 15,
                current: 15,
                description: 'Complete all JavaScript lessons',
              },
            ],
            status: 'completed',
            courseId: '2',
            createdAt: new Date('2024-01-10'),
            completedAt: new Date('2024-01-18'),
          },
        ];

        // Separate active and completed quests
        const active = mockQuests.filter(
          q => q.status !== 'completed' && q.status !== 'expired'
        );
        const completed = mockQuests.filter(q => q.status === 'completed');

        set({
          quests: mockQuests,
          activeQuests: active,
          completedQuests: completed,
          isLoading: false,
        });

        // Apply filters
        get().applyFilters();
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        // Fallback to mock data if no user
        console.log('🔧 No user found, using mock quest data');
        set({ isLoading: false });
        return;
      }

      const questsData = await dbQuestService.getByUserId(user.id);

      // Transform database quests to frontend Quest type
      const transformedQuests: Quest[] = questsData.map(quest => ({
        id: quest.id,
        title: quest.title,
        description: quest.description || '',
        type: quest.type,
        xpReward: quest.xp_reward,
        difficulty: quest.difficulty,
        requirements: quest.requirements as any[],
        status: quest.status,
        courseId: quest.course_id || undefined,
        createdAt: new Date(quest.created_at),
        expiresAt: quest.expires_at ? new Date(quest.expires_at) : undefined,
        completedAt: quest.completed_at
          ? new Date(quest.completed_at)
          : undefined,
      }));

      // Separate active and completed quests
      const active = transformedQuests.filter(
        q => q.status !== 'completed' && q.status !== 'expired'
      );
      const completed = transformedQuests.filter(q => q.status === 'completed');

      set({
        quests: transformedQuests,
        activeQuests: active,
        completedQuests: completed,
        isLoading: false,
      });

      // Apply filters
      get().applyFilters();
    } catch (error) {
      console.error('Error fetching quests:', error);
      set({ error: 'Failed to load quests', isLoading: false });
    }
  },

  fetchQuestById: async (id: string) => {
    try {
      // First check if we already have this quest in state
      const { quests } = get();
      const existingQuest = quests.find(q => q.id === id);

      if (existingQuest) {
        return existingQuest;
      }

      // Otherwise fetch from database
      set({ isLoading: true, error: null });

      const { data: questData } = await dbQuestService.update(id, {}); // Using update as a hack to get the quest

      if (!questData) {
        set({ error: 'Quest not found', isLoading: false });
        return null;
      }

      // Transform to frontend Quest type
      const quest: Quest = {
        id: questData.id,
        title: questData.title,
        description: questData.description || '',
        type: questData.type,
        xpReward: questData.xp_reward,
        difficulty: questData.difficulty,
        requirements: questData.requirements as any[],
        status: questData.status,
        courseId: questData.course_id || undefined,
        createdAt: new Date(questData.created_at),
        expiresAt: questData.expires_at
          ? new Date(questData.expires_at)
          : undefined,
        completedAt: questData.completed_at
          ? new Date(questData.completed_at)
          : undefined,
      };

      set({ isLoading: false });
      return quest;
    } catch (error) {
      console.error('Error fetching quest:', error);
      set({ error: 'Failed to load quest', isLoading: false });
      return null;
    }
  },

  generateQuestsForCourse: async (courseId, syllabus) => {
    try {
      set({ isLoading: true, error: null });

      const generatedQuests = await questService.generateQuestsFromSyllabus(
        courseId,
        syllabus
      );

      // Refresh quests list
      await get().fetchQuests();

      set({ isLoading: false });
      return generatedQuests;
    } catch (error) {
      console.error('Error generating quests:', error);
      set({ error: 'Failed to generate quests', isLoading: false });
      return [];
    }
  },

  generateBalancedQuests: async courses => {
    try {
      set({ isLoading: true, error: null });

      const generatedQuests =
        await questService.generateBalancedQuests(courses);

      // Refresh quests list
      await get().fetchQuests();

      set({ isLoading: false });
      return generatedQuests;
    } catch (error) {
      console.error('Error generating balanced quests:', error);
      set({ error: 'Failed to generate balanced quests', isLoading: false });
      return [];
    }
  },

  completeQuest: async questId => {
    try {
      set({ isLoading: true, error: null });

      const result = await questService.completeQuest(questId);

      // Update the quest in the local state
      const { quests, activeQuests, completedQuests } = get();
      const questIndex = quests.findIndex(q => q.id === questId);

      if (questIndex !== -1) {
        const updatedQuest = {
          ...quests[questIndex],
          status: 'completed' as QuestStatus,
          completedAt: new Date(),
        };

        const updatedQuests = [...quests];
        updatedQuests[questIndex] = updatedQuest;

        const updatedActiveQuests = activeQuests.filter(q => q.id !== questId);
        const updatedCompletedQuests = [...completedQuests, updatedQuest];

        set({
          quests: updatedQuests,
          activeQuests: updatedActiveQuests,
          completedQuests: updatedCompletedQuests,
          isLoading: false,
        });
      } else {
        // If we don't have the quest in state, refresh the list
        await get().fetchQuests();
      }

      return result;
    } catch (error) {
      console.error('Error completing quest:', error);
      set({ error: 'Failed to complete quest', isLoading: false });
      return null;
    }
  },

  updateQuestProgress: async (questId, requirementType, progress) => {
    try {
      set({ isLoading: true, error: null });

      const updatedQuest = await questService.updateQuestProgress(
        questId,
        requirementType,
        progress
      );

      // Update the quest in the local state
      const { quests, activeQuests, completedQuests } = get();
      const questIndex = quests.findIndex(q => q.id === questId);

      if (questIndex !== -1) {
        const updatedQuests = [...quests];
        updatedQuests[questIndex] = updatedQuest;

        // Update active/completed lists based on status
        let updatedActiveQuests = [...activeQuests];
        let updatedCompletedQuests = [...completedQuests];

        if (updatedQuest.status === 'completed') {
          updatedActiveQuests = updatedActiveQuests.filter(
            q => q.id !== questId
          );
          updatedCompletedQuests = [...updatedCompletedQuests, updatedQuest];
        } else {
          const activeIndex = updatedActiveQuests.findIndex(
            q => q.id === questId
          );
          if (activeIndex !== -1) {
            updatedActiveQuests[activeIndex] = updatedQuest;
          } else {
            updatedActiveQuests = [...updatedActiveQuests, updatedQuest];
          }
        }

        set({
          quests: updatedQuests,
          activeQuests: updatedActiveQuests,
          completedQuests: updatedCompletedQuests,
          isLoading: false,
        });
      } else {
        // If we don't have the quest in state, refresh the list
        await get().fetchQuests();
      }

      return updatedQuest;
    } catch (error) {
      console.error('Error updating quest progress:', error);
      set({ error: 'Failed to update quest progress', isLoading: false });
      return null;
    }
  },

  handleOverdueQuests: async () => {
    try {
      set({ isLoading: true, error: null });

      const user = await getCurrentUser();
      if (!user) {
        set({ error: 'User not authenticated', isLoading: false });
        return;
      }

      await questService.handleOverdueQuests(user.id);

      // Refresh quests list
      await get().fetchQuests();

      set({ isLoading: false });
    } catch (error) {
      console.error('Error handling overdue quests:', error);
      set({ error: 'Failed to handle overdue quests', isLoading: false });
    }
  },

  updateFilters: newFilters => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().applyFilters();
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { quests, filters } = get();

    // Apply filters to get filtered quests
    let filteredQuests = [...quests];

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filteredQuests = filteredQuests.filter(q => q.type === filters.type);
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
      filteredQuests = filteredQuests.filter(
        q => q.difficulty === filters.difficulty
      );
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filteredQuests = filteredQuests.filter(q => q.status === filters.status);
    }

    // Filter by course
    if (filters.courseId) {
      filteredQuests = filteredQuests.filter(
        q => q.courseId === filters.courseId
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredQuests = filteredQuests.filter(
        q =>
          q.title.toLowerCase().includes(searchLower) ||
          q.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort quests
    if (filters.sortBy) {
      filteredQuests.sort((a, b) => {
        let valueA, valueB;

        switch (filters.sortBy) {
          case 'created_at':
            valueA = a.createdAt.getTime();
            valueB = b.createdAt.getTime();
            break;
          case 'xp_reward':
            valueA = a.xpReward;
            valueB = b.xpReward;
            break;
          case 'difficulty':
            const difficultyValues = { easy: 1, medium: 2, hard: 3 };
            valueA = difficultyValues[a.difficulty];
            valueB = difficultyValues[b.difficulty];
            break;
          case 'expires_at':
            valueA = a.expiresAt
              ? a.expiresAt.getTime()
              : Number.MAX_SAFE_INTEGER;
            valueB = b.expiresAt
              ? b.expiresAt.getTime()
              : Number.MAX_SAFE_INTEGER;
            break;
          default:
            valueA = a.createdAt.getTime();
            valueB = b.createdAt.getTime();
        }

        return filters.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }

    // Update active and completed quests
    const active = filteredQuests.filter(
      q => q.status !== 'completed' && q.status !== 'expired'
    );
    const completed = filteredQuests.filter(q => q.status === 'completed');

    set({
      activeQuests: active,
      completedQuests: completed,
    });
  },
}));
