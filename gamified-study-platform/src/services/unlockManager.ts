/**
 * Unlock Manager Service
 *
 * This service manages the unlocking of environments, themes, and other content
 * based on study milestones, achievements, and user progress.
 */

import { useEnvironmentStore } from '../store/environmentStore';
import { useThemeStore } from '../store/themeStore';
import { useGamificationStore } from '../store/gamificationStore';
import { usePetStore } from '../store/petStore';
import { useStoreStore } from '../store/storeStore';
import type {
  UnlockRequirement,
  Achievement,
  StudyPetExtended,
} from '../types';

export interface UnlockableContent {
  id: string;
  name: string;
  description: string;
  type: 'environment' | 'theme' | 'pet_accessory' | 'music_pack' | 'decoration';
  category: string;
  requirements: UnlockRequirement[];
  coinCost?: number;
  premiumCost?: number;
  imageUrl?: string;
  previewUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited?: boolean;
  expiresAt?: Date;
}

export interface UnlockProgress {
  contentId: string;
  requirements: UnlockRequirementProgress[];
  overallProgress: number; // 0-100
  canUnlock: boolean;
  missingRequirements: string[];
}

export interface UnlockRequirementProgress {
  type: UnlockRequirement['type'];
  current: number;
  target: number;
  completed: boolean;
  description: string;
}

export interface UnlockResult {
  success: boolean;
  content: UnlockableContent;
  celebrationLevel: 'small' | 'medium' | 'large';
  message: string;
  error?: string;
}

export class UnlockManager {
  private static instance: UnlockManager;
  private unlockableContent: Map<string, UnlockableContent> = new Map();

  static getInstance(): UnlockManager {
    if (!UnlockManager.instance) {
      UnlockManager.instance = new UnlockManager();
      UnlockManager.instance.initializeContent();
    }
    return UnlockManager.instance;
  }

  /**
   * Initialize unlockable content data
   */
  private initializeContent(): void {
    // Environment unlocks
    const environments: UnlockableContent[] = [
      {
        id: 'cherry-blossom',
        name: 'Cherry Blossom Garden',
        description: 'A serene Japanese garden with falling cherry blossoms',
        type: 'environment',
        category: 'nature',
        requirements: [
          {
            type: 'study_hours',
            target: 25,
            current: 0,
            description: 'Study for 25 hours total',
          },
          {
            type: 'streak_days',
            target: 7,
            current: 0,
            description: 'Maintain a 7-day study streak',
          },
        ],
        rarity: 'rare',
        imageUrl: '/environments/cherry-blossom.jpg',
      },
      {
        id: 'mountain-peak',
        name: 'Mountain Peak',
        description: 'Study among the clouds at a peaceful mountain summit',
        type: 'environment',
        category: 'nature',
        requirements: [
          {
            type: 'level_reached',
            target: 10,
            current: 0,
            description: 'Reach level 10',
          },
          {
            type: 'quests_completed',
            target: 50,
            current: 0,
            description: 'Complete 50 quests',
          },
        ],
        rarity: 'epic',
        imageUrl: '/environments/mountain-peak.jpg',
      },
      {
        id: 'underwater-library',
        name: 'Underwater Library',
        description: 'A magical underwater library with floating books',
        type: 'environment',
        category: 'fantasy',
        requirements: [
          {
            type: 'study_hours',
            target: 100,
            current: 0,
            description: 'Study for 100 hours total',
          },
          {
            type: 'streak_days',
            target: 30,
            current: 0,
            description: 'Maintain a 30-day study streak',
          },
          {
            type: 'level_reached',
            target: 15,
            current: 0,
            description: 'Reach level 15',
          },
        ],
        rarity: 'legendary',
        imageUrl: '/environments/underwater-library.jpg',
      },
      {
        id: 'space-station',
        name: 'Space Station',
        description: 'Study among the stars in a futuristic space station',
        type: 'environment',
        category: 'sci-fi',
        requirements: [
          {
            type: 'study_hours',
            target: 200,
            current: 0,
            description: 'Study for 200 hours total',
          },
          {
            type: 'level_reached',
            target: 25,
            current: 0,
            description: 'Reach level 25',
          },
          {
            type: 'quests_completed',
            target: 200,
            current: 0,
            description: 'Complete 200 quests',
          },
        ],
        rarity: 'legendary',
        imageUrl: '/environments/space-station.jpg',
      },
    ];

    // Theme unlocks
    const themes: UnlockableContent[] = [
      {
        id: 'dark-mode-pro',
        name: 'Dark Mode Pro',
        description: 'Enhanced dark theme with purple accents',
        type: 'theme',
        category: 'dark',
        requirements: [
          {
            type: 'study_hours',
            target: 10,
            current: 0,
            description: 'Study for 10 hours total',
          },
        ],
        rarity: 'common',
        coinCost: 100,
      },
      {
        id: 'neon-cyberpunk',
        name: 'Neon Cyberpunk',
        description: 'Futuristic cyberpunk theme with neon colors',
        type: 'theme',
        category: 'cyberpunk',
        requirements: [
          {
            type: 'streak_days',
            target: 14,
            current: 0,
            description: 'Maintain a 14-day study streak',
          },
          {
            type: 'level_reached',
            target: 8,
            current: 0,
            description: 'Reach level 8',
          },
        ],
        rarity: 'rare',
        coinCost: 500,
      },
      {
        id: 'zen-minimalist',
        name: 'Zen Minimalist',
        description: 'Clean, minimalist theme for focused studying',
        type: 'theme',
        category: 'minimal',
        requirements: [
          {
            type: 'study_hours',
            target: 50,
            current: 0,
            description: 'Study for 50 hours total',
          },
          {
            type: 'quests_completed',
            target: 25,
            current: 0,
            description: 'Complete 25 quests',
          },
        ],
        rarity: 'epic',
        coinCost: 1000,
      },
      {
        id: 'aurora-borealis',
        name: 'Aurora Borealis',
        description: 'Beautiful northern lights theme with animated colors',
        type: 'theme',
        category: 'nature',
        requirements: [
          {
            type: 'study_hours',
            target: 150,
            current: 0,
            description: 'Study for 150 hours total',
          },
          {
            type: 'streak_days',
            target: 60,
            current: 0,
            description: 'Maintain a 60-day study streak',
          },
          {
            type: 'level_reached',
            target: 20,
            current: 0,
            description: 'Reach level 20',
          },
        ],
        rarity: 'legendary',
        coinCost: 2500,
      },
    ];

    // Pet accessories
    const accessories: UnlockableContent[] = [
      {
        id: 'graduation-cap',
        name: 'Graduation Cap',
        description: 'A tiny graduation cap for your studious pet',
        type: 'pet_accessory',
        category: 'academic',
        requirements: [
          {
            type: 'level_reached',
            target: 5,
            current: 0,
            description: 'Reach level 5',
          },
        ],
        rarity: 'common',
        coinCost: 200,
      },
      {
        id: 'reading-glasses',
        name: 'Reading Glasses',
        description: 'Stylish glasses that make your pet look extra smart',
        type: 'pet_accessory',
        category: 'academic',
        requirements: [
          {
            type: 'study_hours',
            target: 20,
            current: 0,
            description: 'Study for 20 hours total',
          },
          {
            type: 'quests_completed',
            target: 10,
            current: 0,
            description: 'Complete 10 quests',
          },
        ],
        rarity: 'rare',
        coinCost: 400,
      },
      {
        id: 'wizard-hat',
        name: 'Wizard Hat',
        description: "A magical hat that boosts your pet's evolution progress",
        type: 'pet_accessory',
        category: 'magical',
        requirements: [
          {
            type: 'streak_days',
            target: 21,
            current: 0,
            description: 'Maintain a 21-day study streak',
          },
          {
            type: 'level_reached',
            target: 12,
            current: 0,
            description: 'Reach level 12',
          },
        ],
        rarity: 'epic',
        coinCost: 800,
      },
    ];

    // Store all content
    [...environments, ...themes, ...accessories].forEach(content => {
      this.unlockableContent.set(content.id, content);
    });
  }

  /**
   * Get all unlockable content
   */
  getAllUnlockableContent(): UnlockableContent[] {
    return Array.from(this.unlockableContent.values());
  }

  /**
   * Get unlockable content by type
   */
  getUnlockableContentByType(
    type: UnlockableContent['type']
  ): UnlockableContent[] {
    return Array.from(this.unlockableContent.values()).filter(
      content => content.type === type
    );
  }

  /**
   * Get unlock progress for specific content
   */
  async getUnlockProgress(
    userId: string,
    contentId: string
  ): Promise<UnlockProgress | null> {
    const content = this.unlockableContent.get(contentId);
    if (!content) {
      return null;
    }

    const userProgress = await this.getUserProgress(userId);
    const requirementProgress: UnlockRequirementProgress[] = [];
    let totalProgress = 0;
    let completedRequirements = 0;

    for (const requirement of content.requirements) {
      const current = this.getCurrentValueForRequirement(
        requirement.type,
        userProgress
      );
      const completed = current >= requirement.target;

      requirementProgress.push({
        type: requirement.type,
        current,
        target: requirement.target,
        completed,
        description: requirement.description,
      });

      if (completed) {
        completedRequirements++;
      }
      totalProgress += Math.min(100, (current / requirement.target) * 100);
    }

    const overallProgress =
      content.requirements.length > 0
        ? Math.floor(totalProgress / content.requirements.length)
        : 0;

    const canUnlock = completedRequirements === content.requirements.length;
    const missingRequirements = requirementProgress
      .filter(req => !req.completed)
      .map(req => req.description);

    return {
      contentId,
      requirements: requirementProgress,
      overallProgress,
      canUnlock,
      missingRequirements,
    };
  }

  /**
   * Get unlock progress for all content of a specific type
   */
  async getUnlockProgressByType(
    userId: string,
    type: UnlockableContent['type']
  ): Promise<UnlockProgress[]> {
    const content = this.getUnlockableContentByType(type);
    const progressPromises = content.map(item =>
      this.getUnlockProgress(userId, item.id)
    );
    const results = await Promise.all(progressPromises);
    return results.filter(progress => progress !== null) as UnlockProgress[];
  }

  /**
   * Attempt to unlock content
   */
  async unlockContent(
    userId: string,
    contentId: string
  ): Promise<UnlockResult> {
    const content = this.unlockableContent.get(contentId);
    if (!content) {
      return {
        success: false,
        content: {} as UnlockableContent,
        celebrationLevel: 'small',
        message: 'Content not found',
        error: 'Content not found',
      };
    }

    const progress = await this.getUnlockProgress(userId, contentId);
    if (!progress || !progress.canUnlock) {
      return {
        success: false,
        content,
        celebrationLevel: 'small',
        message: 'Requirements not met',
        error: `Missing requirements: ${progress?.missingRequirements.join(', ')}`,
      };
    }

    // Check coin cost if applicable
    if (content.coinCost) {
      const storeStore = useStoreStore.getState();
      if (storeStore.coins < content.coinCost) {
        return {
          success: false,
          content,
          celebrationLevel: 'small',
          message: 'Insufficient coins',
          error: `Need ${content.coinCost} coins, have ${storeStore.coins}`,
        };
      }
    }

    // Perform the unlock
    try {
      await this.performUnlock(userId, content);

      // Deduct coins if applicable
      if (content.coinCost) {
        const storeStore = useStoreStore.getState();
        storeStore.updateCoins(-content.coinCost);
      }

      const celebrationLevel = this.getCelebrationLevel(content.rarity);
      const message = this.getUnlockMessage(content);

      return {
        success: true,
        content,
        celebrationLevel,
        message,
      };
    } catch (error) {
      return {
        success: false,
        content,
        celebrationLevel: 'small',
        message: 'Failed to unlock content',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check for automatic unlocks based on recent progress
   */
  async checkForAutoUnlocks(userId: string): Promise<UnlockResult[]> {
    const allContent = this.getAllUnlockableContent();
    const autoUnlocks: UnlockResult[] = [];

    for (const content of allContent) {
      // Skip content that requires coins (manual unlock only)
      if (content.coinCost || content.premiumCost) {
        continue;
      }

      const progress = await this.getUnlockProgress(userId, content.id);
      if (progress && progress.canUnlock) {
        // Check if already unlocked
        const isAlreadyUnlocked = await this.isContentUnlocked(
          userId,
          content.id
        );
        if (!isAlreadyUnlocked) {
          const result = await this.unlockContent(userId, content.id);
          if (result.success) {
            autoUnlocks.push(result);
          }
        }
      }
    }

    return autoUnlocks;
  }

  /**
   * Get user's current progress values
   */
  private async getUserProgress(
    userId: string
  ): Promise<Record<string, number>> {
    const gamificationStore = useGamificationStore.getState();
    const petStore = usePetStore.getState();
    const gameStats = gamificationStore.gameStats;
    const pet = petStore.pet as StudyPetExtended;

    // This would typically fetch from a database
    // For now, we'll use the current store values
    return {
      study_hours: gameStats?.totalXP ? Math.floor(gameStats.totalXP / 10) : 0, // Rough conversion
      streak_days: gameStats?.streakDays || 0,
      level_reached: gameStats?.level || 1,
      quests_completed: 0, // Would be fetched from quest completion history
      pet_level: pet?.level || 1,
      achievements_unlocked: gameStats?.achievements?.length || 0,
    };
  }

  /**
   * Get current value for a specific requirement type
   */
  private getCurrentValueForRequirement(
    type: UnlockRequirement['type'],
    userProgress: Record<string, number>
  ): number {
    switch (type) {
      case 'study_hours':
        return userProgress.study_hours || 0;
      case 'streak_days':
        return userProgress.streak_days || 0;
      case 'level_reached':
        return userProgress.level_reached || 1;
      case 'quests_completed':
        return userProgress.quests_completed || 0;
      default:
        return 0;
    }
  }

  /**
   * Perform the actual unlock operation
   */
  private async performUnlock(
    userId: string,
    content: UnlockableContent
  ): Promise<void> {
    switch (content.type) {
      case 'environment':
        const environmentStore = useEnvironmentStore.getState();
        await environmentStore.unlockEnvironment(content.id);
        break;

      case 'theme':
        const themeStore = useThemeStore.getState();
        await themeStore.unlockTheme(content.id);
        break;

      case 'pet_accessory':
        const petStore = usePetStore.getState();
        await petStore.unlockAccessory(userId, {
          name: content.name,
          description: content.description,
          imageUrl: content.imageUrl || '',
          rarity: content.rarity,
        });
        break;

      default:
        throw new Error(`Unsupported content type: ${content.type}`);
    }
  }

  /**
   * Check if content is already unlocked
   */
  private async isContentUnlocked(
    userId: string,
    contentId: string
  ): Promise<boolean> {
    const content = this.unlockableContent.get(contentId);
    if (!content) return false;

    switch (content.type) {
      case 'environment':
        const environmentStore = useEnvironmentStore.getState();
        return environmentStore.unlockedEnvironments.includes(contentId);

      case 'theme':
        const themeStore = useThemeStore.getState();
        return themeStore.unlockedThemes.includes(contentId);

      case 'pet_accessory':
        const petStore = usePetStore.getState();
        const accessories = await petStore.fetchAccessories(userId);
        return accessories.some(acc => acc.name === content.name);

      default:
        return false;
    }
  }

  /**
   * Get celebration level based on rarity
   */
  private getCelebrationLevel(
    rarity: UnlockableContent['rarity']
  ): 'small' | 'medium' | 'large' {
    switch (rarity) {
      case 'legendary':
        return 'large';
      case 'epic':
        return 'large';
      case 'rare':
        return 'medium';
      case 'common':
      default:
        return 'small';
    }
  }

  /**
   * Get unlock message based on content
   */
  private getUnlockMessage(content: UnlockableContent): string {
    const messages = {
      environment: `New environment unlocked: ${content.name}! You can now study in this beautiful location.`,
      theme: `New theme unlocked: ${content.name}! Customize your interface with this new look.`,
      pet_accessory: `New pet accessory unlocked: ${content.name}! Your pet can now wear this stylish item.`,
      music_pack: `New music pack unlocked: ${content.name}! Enjoy new study music to enhance your focus.`,
      decoration: `New decoration unlocked: ${content.name}! Personalize your study space with this item.`,
    };

    return messages[content.type] || `New content unlocked: ${content.name}!`;
  }
}

// Export singleton instance
export const unlockManager = UnlockManager.getInstance();
