/**
 * Coin Earning System
 *
 * This service manages the integrated coin earning system that rewards users
 * for study sessions, quest completion, streak maintenance, pet care, and environment usage.
 */

import { useStoreStore } from '../store/storeStore';
import { useGamificationStore } from '../store/gamificationStore';
import { usePetStore } from '../store/petStore';
import { useEnvironmentStore } from '../store/environmentStore';
import type { StudyPetExtended } from '../types';

export interface CoinEarningSource {
  type:
    | 'study_session'
    | 'quest_complete'
    | 'streak_bonus'
    | 'pet_care'
    | 'environment_usage'
    | 'daily_bonus'
    | 'achievement'
    | 'mini_game';
  baseAmount: number;
  multipliers: CoinMultiplier[];
  description: string;
}

export interface CoinMultiplier {
  type:
    | 'pet_happiness'
    | 'streak_days'
    | 'environment_premium'
    | 'quality_bonus'
    | 'time_bonus'
    | 'daily_limit';
  factor: number;
  description: string;
  condition?: string;
}

export interface CoinEarningResult {
  baseCoins: number;
  bonusCoins: number;
  totalCoins: number;
  multipliers: AppliedMultiplier[];
  source: string;
  timestamp: Date;
  dailyEarningsAfter: number;
  weeklyEarningsAfter: number;
  hitDailyLimit: boolean;
  hitWeeklyLimit: boolean;
}

export interface AppliedMultiplier {
  type: CoinMultiplier['type'];
  factor: number;
  description: string;
  coinsAdded: number;
}

export interface EarningLimits {
  dailyLimit: number;
  weeklyLimit: number;
  currentDailyEarnings: number;
  currentWeeklyEarnings: number;
  lastResetDate: Date;
  bonusOpportunities: BonusOpportunity[];
}

export interface BonusOpportunity {
  id: string;
  type:
    | 'double_coins'
    | 'bonus_multiplier'
    | 'streak_protection'
    | 'pet_happiness_boost';
  description: string;
  multiplier: number;
  duration: number; // in minutes
  expiresAt: Date;
  isActive: boolean;
}

export class CoinEarningSystem {
  private static instance: CoinEarningSystem;
  private earningHistory: Map<string, CoinEarningResult[]> = new Map();
  private earningLimits: Map<string, EarningLimits> = new Map();

  static getInstance(): CoinEarningSystem {
    if (!CoinEarningSystem.instance) {
      CoinEarningSystem.instance = new CoinEarningSystem();
    }
    return CoinEarningSystem.instance;
  }

  /**
   * Award coins for a study session
   */
  async awardStudySessionCoins(
    userId: string,
    durationMinutes: number,
    quality: 'poor' | 'average' | 'good' | 'excellent' = 'average',
    courseId?: string
  ): Promise<CoinEarningResult> {
    const baseAmount = Math.max(0, Math.floor(durationMinutes / 5)); // 1 coin per 5 minutes, minimum 0
    const multipliers = await this.calculateStudySessionMultipliers(
      userId,
      quality,
      durationMinutes
    );

    return this.awardCoins(userId, {
      type: 'study_session',
      baseAmount,
      multipliers,
      description: `Study session (${durationMinutes} min, ${quality} quality)`,
    });
  }

  /**
   * Award coins for quest completion
   */
  async awardQuestCompletionCoins(
    userId: string,
    questType: 'daily' | 'weekly' | 'milestone' | 'bonus',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<CoinEarningResult> {
    const baseAmounts = {
      daily: { easy: 10, medium: 15, hard: 25 },
      weekly: { easy: 50, medium: 75, hard: 100 },
      milestone: { easy: 100, medium: 150, hard: 200 },
      bonus: { easy: 20, medium: 30, hard: 50 },
    };

    const baseAmount = baseAmounts[questType][difficulty];
    const multipliers = await this.calculateQuestMultipliers(
      userId,
      questType,
      difficulty
    );

    return this.awardCoins(userId, {
      type: 'quest_complete',
      baseAmount,
      multipliers,
      description: `${questType} quest (${difficulty})`,
    });
  }

  /**
   * Award coins for maintaining study streaks
   */
  async awardStreakBonusCoins(
    userId: string,
    streakDays: number
  ): Promise<CoinEarningResult> {
    let baseAmount = 0;

    // Progressive streak bonuses
    if (streakDays >= 30) {
      baseAmount = 100;
    } else if (streakDays >= 14) {
      baseAmount = 50;
    } else if (streakDays >= 7) {
      baseAmount = 25;
    } else if (streakDays >= 3) {
      baseAmount = 10;
    }

    const multipliers = await this.calculateStreakMultipliers(
      userId,
      streakDays
    );

    return this.awardCoins(userId, {
      type: 'streak_bonus',
      baseAmount,
      multipliers,
      description: `${streakDays}-day streak bonus`,
    });
  }

  /**
   * Award coins for pet care activities
   */
  async awardPetCareCoins(
    userId: string,
    careType: 'feed' | 'play' | 'evolve' | 'accessory_equip',
    petHappinessIncrease: number = 0
  ): Promise<CoinEarningResult> {
    const baseAmounts = {
      feed: 5,
      play: 8,
      evolve: 50,
      accessory_equip: 15,
    };

    const baseAmount = baseAmounts[careType];
    const multipliers = await this.calculatePetCareMultipliers(
      userId,
      careType,
      petHappinessIncrease
    );

    return this.awardCoins(userId, {
      type: 'pet_care',
      baseAmount,
      multipliers,
      description: `Pet care: ${careType}`,
    });
  }

  /**
   * Award coins for environment usage
   */
  async awardEnvironmentUsageCoins(
    userId: string,
    environmentId: string,
    usageDurationMinutes: number
  ): Promise<CoinEarningResult> {
    const environmentStore = useEnvironmentStore.getState();
    const environment = environmentStore.availableEnvironments.find(
      env => env.id === environmentId
    );

    const baseAmount = Math.floor(usageDurationMinutes / 10); // 1 coin per 10 minutes
    const multipliers = await this.calculateEnvironmentMultipliers(
      userId,
      environment?.category || 'free',
      usageDurationMinutes
    );

    return this.awardCoins(userId, {
      type: 'environment_usage',
      baseAmount,
      multipliers,
      description: `Environment usage: ${environment?.name || environmentId}`,
    });
  }

  /**
   * Award daily bonus coins
   */
  async awardDailyBonusCoins(userId: string): Promise<CoinEarningResult> {
    const gamificationStore = useGamificationStore.getState();
    const streakDays = gamificationStore.gameStats?.streakDays || 0;

    let baseAmount = 20; // Base daily bonus

    // Streak-based daily bonus increase
    if (streakDays >= 30) {
      baseAmount = 100;
    } else if (streakDays >= 14) {
      baseAmount = 60;
    } else if (streakDays >= 7) {
      baseAmount = 40;
    }

    const multipliers = await this.calculateDailyBonusMultipliers(userId);

    return this.awardCoins(userId, {
      type: 'daily_bonus',
      baseAmount,
      multipliers,
      description: 'Daily login bonus',
    });
  }

  /**
   * Award coins for mini-game completion
   */
  async awardMiniGameCoins(
    userId: string,
    gameId: string,
    score: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<CoinEarningResult> {
    const baseAmounts = { easy: 5, medium: 10, hard: 15 };
    const baseAmount = baseAmounts[difficulty];

    const multipliers = await this.calculateMiniGameMultipliers(
      userId,
      score,
      difficulty
    );

    return this.awardCoins(userId, {
      type: 'mini_game',
      baseAmount,
      multipliers,
      description: `Mini-game: ${gameId} (${difficulty})`,
    });
  }

  /**
   * Core coin awarding logic with limits and multipliers
   */
  private async awardCoins(
    userId: string,
    source: CoinEarningSource
  ): Promise<CoinEarningResult> {
    const limits = this.getEarningLimits(userId);
    const storeStore = useStoreStore.getState();

    // Check daily and weekly limits
    let effectiveBaseAmount = source.baseAmount;
    let hitDailyLimit = false;
    let hitWeeklyLimit = false;

    if (limits.currentDailyEarnings + effectiveBaseAmount > limits.dailyLimit) {
      effectiveBaseAmount = Math.max(
        0,
        limits.dailyLimit - limits.currentDailyEarnings
      );
      hitDailyLimit = true;
    }

    if (
      limits.currentWeeklyEarnings + effectiveBaseAmount >
      limits.weeklyLimit
    ) {
      effectiveBaseAmount = Math.max(
        0,
        limits.weeklyLimit - limits.currentWeeklyEarnings
      );
      hitWeeklyLimit = true;
    }

    // Apply multipliers
    const appliedMultipliers: AppliedMultiplier[] = [];
    let bonusCoins = 0;

    for (const multiplier of source.multipliers) {
      const bonusAmount = Math.floor(
        effectiveBaseAmount * (multiplier.factor - 1)
      );
      bonusCoins += bonusAmount;

      appliedMultipliers.push({
        type: multiplier.type,
        factor: multiplier.factor,
        description: multiplier.description,
        coinsAdded: bonusAmount,
      });
    }

    const totalCoins = effectiveBaseAmount + bonusCoins;

    // Update earning limits
    limits.currentDailyEarnings += totalCoins;
    limits.currentWeeklyEarnings += totalCoins;
    this.earningLimits.set(userId, limits);

    // Award the coins
    if (totalCoins > 0) {
      await storeStore.addCoins(totalCoins);
    }

    // Create earning result
    const result: CoinEarningResult = {
      baseCoins: effectiveBaseAmount,
      bonusCoins,
      totalCoins,
      multipliers: appliedMultipliers,
      source: source.description,
      timestamp: new Date(),
      dailyEarningsAfter: limits.currentDailyEarnings,
      weeklyEarningsAfter: limits.currentWeeklyEarnings,
      hitDailyLimit,
      hitWeeklyLimit,
    };

    // Add to earning history
    const history = this.earningHistory.get(userId) || [];
    history.push(result);
    this.earningHistory.set(userId, history.slice(-100)); // Keep last 100 entries

    return result;
  }

  /**
   * Calculate multipliers for study sessions
   */
  private async calculateStudySessionMultipliers(
    userId: string,
    quality: string,
    durationMinutes: number
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];
    const petStore = usePetStore.getState();
    const gamificationStore = useGamificationStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    // Quality bonus
    const qualityMultipliers = {
      poor: 0.7,
      average: 1.0,
      good: 1.3,
      excellent: 1.6,
    };

    if (quality !== 'average') {
      multipliers.push({
        type: 'quality_bonus',
        factor: qualityMultipliers[quality as keyof typeof qualityMultipliers],
        description: `${quality} quality bonus`,
      });
    }

    // Pet happiness bonus
    if (pet && pet.happiness >= 80) {
      multipliers.push({
        type: 'pet_happiness',
        factor: 1.2,
        description: 'Happy pet bonus (+20%)',
      });
    } else if (pet && pet.happiness >= 60) {
      multipliers.push({
        type: 'pet_happiness',
        factor: 1.1,
        description: 'Content pet bonus (+10%)',
      });
    }

    // Streak bonus
    const streakDays = gamificationStore.gameStats?.streakDays || 0;
    if (streakDays >= 7) {
      const streakMultiplier = Math.min(1.5, 1 + streakDays * 0.02);
      multipliers.push({
        type: 'streak_days',
        factor: streakMultiplier,
        description: `${streakDays}-day streak bonus`,
      });
    }

    // Long session bonus
    if (durationMinutes >= 60) {
      multipliers.push({
        type: 'time_bonus',
        factor: 1.3,
        description: 'Long session bonus (+30%)',
      });
    } else if (durationMinutes >= 30) {
      multipliers.push({
        type: 'time_bonus',
        factor: 1.15,
        description: 'Extended session bonus (+15%)',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for quest completion
   */
  private async calculateQuestMultipliers(
    userId: string,
    questType: string,
    difficulty: string
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    // Pet happiness bonus for quests
    if (pet && pet.happiness >= 90) {
      multipliers.push({
        type: 'pet_happiness',
        factor: 1.25,
        description: 'Excited pet bonus (+25%)',
      });
    }

    // Weekly and milestone quest bonuses
    if (questType === 'weekly' || questType === 'milestone') {
      multipliers.push({
        type: 'quality_bonus',
        factor: 1.2,
        description: 'Important quest bonus (+20%)',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for streak bonuses
   */
  private async calculateStreakMultipliers(
    userId: string,
    streakDays: number
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    // Pet happiness amplifies streak bonuses
    if (pet && pet.happiness >= 80) {
      multipliers.push({
        type: 'pet_happiness',
        factor: 1.3,
        description: 'Happy pet amplifies streak bonus',
      });
    }

    // Long streak multiplier
    if (streakDays >= 30) {
      multipliers.push({
        type: 'streak_days',
        factor: 1.5,
        description: 'Long streak achievement bonus',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for pet care
   */
  private async calculatePetCareMultipliers(
    userId: string,
    careType: string,
    happinessIncrease: number
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];
    const gamificationStore = useGamificationStore.getState();

    // Streak bonus for consistent pet care
    const streakDays = gamificationStore.gameStats?.streakDays || 0;
    if (streakDays >= 7) {
      multipliers.push({
        type: 'streak_days',
        factor: 1.2,
        description: 'Consistent care bonus',
      });
    }

    // Evolution bonus
    if (careType === 'evolve') {
      multipliers.push({
        type: 'quality_bonus',
        factor: 2.0,
        description: 'Evolution achievement bonus',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for environment usage
   */
  private async calculateEnvironmentMultipliers(
    userId: string,
    environmentCategory: string,
    durationMinutes: number
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];

    // Premium environment bonus
    if (environmentCategory === 'premium') {
      multipliers.push({
        type: 'environment_premium',
        factor: 1.5,
        description: 'Premium environment bonus (+50%)',
      });
    }

    // Long usage bonus
    if (durationMinutes >= 60) {
      multipliers.push({
        type: 'time_bonus',
        factor: 1.2,
        description: 'Extended environment usage bonus',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for daily bonus
   */
  private async calculateDailyBonusMultipliers(
    userId: string
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];
    const petStore = usePetStore.getState();
    const pet = petStore.pet as StudyPetExtended;

    // Pet happiness bonus for daily login
    if (pet && pet.happiness >= 70) {
      multipliers.push({
        type: 'pet_happiness',
        factor: 1.3,
        description: 'Happy pet welcomes you back',
      });
    }

    return multipliers;
  }

  /**
   * Calculate multipliers for mini-games
   */
  private async calculateMiniGameMultipliers(
    userId: string,
    score: number,
    difficulty: string
  ): Promise<CoinMultiplier[]> {
    const multipliers: CoinMultiplier[] = [];

    // High score bonus
    if (score >= 90) {
      multipliers.push({
        type: 'quality_bonus',
        factor: 1.5,
        description: 'Excellent score bonus (+50%)',
      });
    } else if (score >= 70) {
      multipliers.push({
        type: 'quality_bonus',
        factor: 1.2,
        description: 'Good score bonus (+20%)',
      });
    }

    return multipliers;
  }

  /**
   * Get earning limits for a user
   */
  private getEarningLimits(userId: string): EarningLimits {
    const existing = this.earningLimits.get(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!existing || existing.lastResetDate < today) {
      // Reset daily limits
      const newLimits: EarningLimits = {
        dailyLimit: 500, // 500 coins per day
        weeklyLimit: 2500, // 2500 coins per week
        currentDailyEarnings: 0,
        currentWeeklyEarnings: existing?.currentWeeklyEarnings || 0,
        lastResetDate: today,
        bonusOpportunities: [],
      };

      // Reset weekly limits on Monday
      if (
        now.getDay() === 1 &&
        (!existing ||
          now.getTime() - existing.lastResetDate.getTime() >=
            7 * 24 * 60 * 60 * 1000)
      ) {
        newLimits.currentWeeklyEarnings = 0;
      }

      this.earningLimits.set(userId, newLimits);
      return newLimits;
    }

    return existing;
  }

  /**
   * Get earning history for a user
   */
  getEarningHistory(userId: string, limit: number = 50): CoinEarningResult[] {
    const history = this.earningHistory.get(userId) || [];
    return history.slice(-limit);
  }

  /**
   * Get earning statistics for a user
   */
  getEarningStats(userId: string): {
    todayTotal: number;
    weekTotal: number;
    averagePerSession: number;
    topSource: string;
    streakBonus: number;
    petCareBonus: number;
  } {
    const history = this.getEarningHistory(userId, 100);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEarnings = history.filter(h => h.timestamp >= today);
    const weekEarnings = history.filter(
      h => h.timestamp >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    );

    const todayTotal = todayEarnings.reduce((sum, h) => sum + h.totalCoins, 0);
    const weekTotal = weekEarnings.reduce((sum, h) => sum + h.totalCoins, 0);
    const averagePerSession =
      history.length > 0
        ? Math.round(
            history.reduce((sum, h) => sum + h.totalCoins, 0) / history.length
          )
        : 0;

    // Find top earning source
    const sourceCounts = history.reduce(
      (acc, h) => {
        const sourceType = h.source.split(':')[0] || h.source;
        acc[sourceType] = (acc[sourceType] || 0) + h.totalCoins;
        return acc;
      },
      {} as Record<string, number>
    );

    const topSource =
      Object.entries(sourceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'None';

    const streakBonus = history
      .filter(h => h.source.includes('streak'))
      .reduce((sum, h) => sum + h.totalCoins, 0);

    const petCareBonus = history
      .filter(h => h.source.includes('Pet care'))
      .reduce((sum, h) => sum + h.totalCoins, 0);

    return {
      todayTotal,
      weekTotal,
      averagePerSession,
      topSource,
      streakBonus,
      petCareBonus,
    };
  }

  /**
   * Create bonus opportunity
   */
  createBonusOpportunity(
    userId: string,
    type: BonusOpportunity['type'],
    multiplier: number,
    durationMinutes: number
  ): void {
    const limits = this.getEarningLimits(userId);
    const bonusOpportunity: BonusOpportunity = {
      id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description: this.getBonusDescription(type),
      multiplier,
      duration: durationMinutes,
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000),
      isActive: true,
    };

    limits.bonusOpportunities.push(bonusOpportunity);
    this.earningLimits.set(userId, limits);
  }

  /**
   * Get bonus description
   */
  private getBonusDescription(type: BonusOpportunity['type']): string {
    const descriptions = {
      double_coins: 'Double coins for all activities',
      bonus_multiplier: 'Extra coin multiplier active',
      streak_protection: 'Streak protection active',
      pet_happiness_boost: 'Pet happiness bonus active',
    };
    return descriptions[type];
  }
}

// Export singleton instance
export const coinEarningSystem = CoinEarningSystem.getInstance();
