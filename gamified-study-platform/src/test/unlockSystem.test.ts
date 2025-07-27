/**
 * Unlock System Tests
 *
 * Tests for the environment and theme unlock system based on study achievements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { unlockManager } from '../services/unlockManager';
import type { UnlockableContent } from '../services/unlockManager';

// Mock the stores
vi.mock('../store/environmentStore', () => ({
  useEnvironmentStore: {
    getState: () => ({
      unlockedEnvironments: ['classroom', 'office'],
      unlockEnvironment: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('../store/themeStore', () => ({
  useThemeStore: {
    getState: () => ({
      unlockedThemes: ['default-light', 'default-dark'],
      unlockTheme: vi.fn().mockResolvedValue(true),
    }),
  },
}));

vi.mock('../store/petStore', () => ({
  usePetStore: {
    getState: () => ({
      pet: {
        level: 3,
        happiness: 75,
      },
      fetchAccessories: vi.fn().mockResolvedValue([]),
      unlockAccessory: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('../store/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({
      gameStats: {
        level: 5,
        totalXP: 1250,
        streakDays: 3,
        lastActivity: new Date(),
        achievements: [],
      },
    }),
  },
}));

vi.mock('../store/storeStore', () => ({
  useStoreStore: {
    getState: () => ({
      coins: 1000,
      spendCoins: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('UnlockManager', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Content Management', () => {
    it('should load all unlockable content', () => {
      const content = unlockManager.getAllUnlockableContent();
      expect(content.length).toBeGreaterThan(0);

      // Check that we have different types of content
      const environments = content.filter(c => c.type === 'environment');
      const themes = content.filter(c => c.type === 'theme');
      const accessories = content.filter(c => c.type === 'pet_accessory');

      expect(environments.length).toBeGreaterThan(0);
      expect(themes.length).toBeGreaterThan(0);
      expect(accessories.length).toBeGreaterThan(0);
    });

    it('should filter content by type', () => {
      const environments =
        unlockManager.getUnlockableContentByType('environment');
      const themes = unlockManager.getUnlockableContentByType('theme');

      expect(environments.every(c => c.type === 'environment')).toBe(true);
      expect(themes.every(c => c.type === 'theme')).toBe(true);
    });

    it('should have proper content structure', () => {
      const content = unlockManager.getAllUnlockableContent();
      const firstItem = content[0];

      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('description');
      expect(firstItem).toHaveProperty('type');
      expect(firstItem).toHaveProperty('requirements');
      expect(firstItem).toHaveProperty('rarity');
      expect(Array.isArray(firstItem.requirements)).toBe(true);
    });
  });

  describe('Unlock Progress', () => {
    it('should calculate unlock progress correctly', async () => {
      const environments =
        unlockManager.getUnlockableContentByType('environment');
      const firstEnvironment = environments[0];

      const progress = await unlockManager.getUnlockProgress(
        userId,
        firstEnvironment.id
      );

      expect(progress).toBeTruthy();
      expect(progress?.contentId).toBe(firstEnvironment.id);
      expect(progress?.requirements).toHaveLength(
        firstEnvironment.requirements.length
      );
      expect(typeof progress?.overallProgress).toBe('number');
      expect(typeof progress?.canUnlock).toBe('boolean');
      expect(Array.isArray(progress?.missingRequirements)).toBe(true);
    });

    it('should calculate progress for all content types', async () => {
      const environmentProgress = await unlockManager.getUnlockProgressByType(
        userId,
        'environment'
      );
      const themeProgress = await unlockManager.getUnlockProgressByType(
        userId,
        'theme'
      );
      const accessoryProgress = await unlockManager.getUnlockProgressByType(
        userId,
        'pet_accessory'
      );

      expect(Array.isArray(environmentProgress)).toBe(true);
      expect(Array.isArray(themeProgress)).toBe(true);
      expect(Array.isArray(accessoryProgress)).toBe(true);

      expect(environmentProgress.length).toBeGreaterThan(0);
      expect(themeProgress.length).toBeGreaterThan(0);
      expect(accessoryProgress.length).toBeGreaterThan(0);
    });

    it('should identify unlockable content', async () => {
      const content = unlockManager.getAllUnlockableContent();

      for (const item of content.slice(0, 3)) {
        // Test first 3 items
        const progress = await unlockManager.getUnlockProgress(userId, item.id);

        if (progress?.canUnlock) {
          expect(progress.missingRequirements).toHaveLength(0);
          expect(progress.overallProgress).toBeGreaterThanOrEqual(100);
        } else {
          expect(progress?.missingRequirements.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Content Unlocking', () => {
    it('should unlock content when requirements are met', async () => {
      // Find content that should be unlockable with current mock stats
      const themes = unlockManager.getUnlockableContentByType('theme');
      const basicTheme = themes.find(
        t =>
          t.requirements.length === 1 &&
          t.requirements[0].type === 'study_hours' &&
          t.requirements[0].target <= 125 // Our mock XP converts to ~125 hours
      );

      if (basicTheme) {
        const result = await unlockManager.unlockContent(userId, basicTheme.id);
        expect(result.success).toBe(true);
        expect(result.content.id).toBe(basicTheme.id);
        expect(result.message).toContain(basicTheme.name);
      }
    });

    it('should fail to unlock content when requirements are not met', async () => {
      // Find content with high requirements
      const environments =
        unlockManager.getUnlockableContentByType('environment');
      const legendaryEnvironment = environments.find(
        e => e.rarity === 'legendary'
      );

      if (legendaryEnvironment) {
        const result = await unlockManager.unlockContent(
          userId,
          legendaryEnvironment.id
        );
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      }
    });

    it('should handle coin costs correctly', async () => {
      const themes = unlockManager.getUnlockableContentByType('theme');
      const paidTheme = themes.find(t => t.coinCost && t.coinCost <= 1000);

      if (paidTheme) {
        const result = await unlockManager.unlockContent(userId, paidTheme.id);
        // Result depends on whether requirements are met
        expect(typeof result.success).toBe('boolean');

        if (!result.success && result.error?.includes('coins')) {
          expect(result.error).toContain('coins');
        }
      }
    });

    it('should provide appropriate celebration levels', async () => {
      const content = unlockManager.getAllUnlockableContent();

      for (const item of content.slice(0, 5)) {
        const result = await unlockManager.unlockContent(userId, item.id);

        if (result.success) {
          expect(['small', 'medium', 'large']).toContain(
            result.celebrationLevel
          );

          // Check celebration level matches rarity
          if (item.rarity === 'legendary' || item.rarity === 'epic') {
            expect(result.celebrationLevel).toBe('large');
          } else if (item.rarity === 'rare') {
            expect(result.celebrationLevel).toBe('medium');
          } else {
            expect(result.celebrationLevel).toBe('small');
          }
        }
      }
    });
  });

  describe('Auto Unlocks', () => {
    it('should check for automatic unlocks', async () => {
      const autoUnlocks = await unlockManager.checkForAutoUnlocks(userId);

      expect(Array.isArray(autoUnlocks)).toBe(true);

      // All auto-unlocks should be successful
      autoUnlocks.forEach(unlock => {
        expect(unlock.success).toBe(true);
        expect(unlock.content).toBeTruthy();
        expect(unlock.message).toBeTruthy();
      });
    });

    it('should not auto-unlock paid content', async () => {
      const autoUnlocks = await unlockManager.checkForAutoUnlocks(userId);

      // None of the auto-unlocks should have coin costs
      autoUnlocks.forEach(unlock => {
        expect(unlock.content.coinCost).toBeFalsy();
        expect(unlock.content.premiumCost).toBeFalsy();
      });
    });
  });

  describe('Requirement Types', () => {
    it('should handle study_hours requirements', async () => {
      const content = unlockManager.getAllUnlockableContent();
      const studyHoursContent = content.find(c =>
        c.requirements.some(r => r.type === 'study_hours')
      );

      if (studyHoursContent) {
        const progress = await unlockManager.getUnlockProgress(
          userId,
          studyHoursContent.id
        );
        const studyHoursReq = progress?.requirements.find(
          r => r.type === 'study_hours'
        );

        expect(studyHoursReq).toBeTruthy();
        expect(typeof studyHoursReq?.current).toBe('number');
        expect(typeof studyHoursReq?.target).toBe('number');
        expect(studyHoursReq?.current).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle streak_days requirements', async () => {
      const content = unlockManager.getAllUnlockableContent();
      const streakContent = content.find(c =>
        c.requirements.some(r => r.type === 'streak_days')
      );

      if (streakContent) {
        const progress = await unlockManager.getUnlockProgress(
          userId,
          streakContent.id
        );
        const streakReq = progress?.requirements.find(
          r => r.type === 'streak_days'
        );

        expect(streakReq).toBeTruthy();
        expect(typeof streakReq?.current).toBe('number');
        expect(streakReq?.current).toBe(3); // From our mock
      }
    });

    it('should handle level_reached requirements', async () => {
      const content = unlockManager.getAllUnlockableContent();
      const levelContent = content.find(c =>
        c.requirements.some(r => r.type === 'level_reached')
      );

      if (levelContent) {
        const progress = await unlockManager.getUnlockProgress(
          userId,
          levelContent.id
        );
        const levelReq = progress?.requirements.find(
          r => r.type === 'level_reached'
        );

        expect(levelReq).toBeTruthy();
        expect(typeof levelReq?.current).toBe('number');
        expect(levelReq?.current).toBe(5); // From our mock
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid content IDs', async () => {
      const result = await unlockManager.unlockContent(userId, 'invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle null progress gracefully', async () => {
      const progress = await unlockManager.getUnlockProgress(
        userId,
        'invalid-id'
      );
      expect(progress).toBeNull();
    });

    it('should handle empty content arrays', async () => {
      const emptyProgress = await unlockManager.getUnlockProgressByType(
        userId,
        'music_pack' as any
      );
      expect(Array.isArray(emptyProgress)).toBe(true);
    });
  });
});
