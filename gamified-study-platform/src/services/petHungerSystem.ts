import type { StudyPetExtended, PetStatus } from '../types';

/**
 * Service for managing pet hunger system with automatic hunger increase over time
 */
export class PetHungerSystemService {
  private hungerIntervals: Map<string, NodeJS.Timeout> = new Map();
  private hungerRates: Map<string, number> = new Map();

  /**
   * Start monitoring hunger for a pet
   */
  startHungerMonitoring(
    petId: string,
    onHungerUpdate: (petId: string, newHunger: number) => void,
    hungerRate: number = 1 // hunger points per hour
  ): void {
    // Clear existing interval if any
    this.stopHungerMonitoring(petId);

    // Set hunger rate
    this.hungerRates.set(petId, hungerRate);

    // Start interval to increase hunger every minute
    const interval = setInterval(() => {
      const currentRate = this.hungerRates.get(petId) || hungerRate;
      const hungerIncrease = currentRate / 60; // Convert hourly rate to per-minute

      onHungerUpdate(petId, hungerIncrease);
    }, 60000); // Every minute

    this.hungerIntervals.set(petId, interval);
  }

  /**
   * Stop monitoring hunger for a pet
   */
  stopHungerMonitoring(petId: string): void {
    const interval = this.hungerIntervals.get(petId);
    if (interval) {
      clearInterval(interval);
      this.hungerIntervals.delete(petId);
      this.hungerRates.delete(petId);
    }
  }

  /**
   * Update hunger rate for a pet
   */
  updateHungerRate(petId: string, newRate: number): void {
    this.hungerRates.set(petId, newRate);
  }

  /**
   * Calculate hunger based on time since last fed
   */
  calculateHungerFromTime(lastFed: Date, baseHunger: number = 0): number {
    const now = new Date();
    const hoursSinceLastFed =
      (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);

    // Hunger increases by 2 points per hour
    const hungerIncrease = Math.floor(hoursSinceLastFed * 2);

    return Math.min(100, baseHunger + hungerIncrease);
  }

  /**
   * Get feeding recommendations based on hunger level
   */
  getFeedingRecommendations(hunger: number): {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendedFood?: string[];
  } {
    if (hunger >= 90) {
      return {
        urgency: 'critical',
        message:
          'Your pet is starving! Feed immediately to prevent health loss.',
        recommendedFood: ['premium-treats', 'basic-kibble'],
      };
    } else if (hunger >= 70) {
      return {
        urgency: 'high',
        message: 'Your pet is very hungry and needs food soon.',
        recommendedFood: ['basic-kibble', 'premium-treats'],
      };
    } else if (hunger >= 50) {
      return {
        urgency: 'medium',
        message: 'Your pet is getting hungry. Consider feeding soon.',
        recommendedFood: ['basic-kibble'],
      };
    } else if (hunger >= 30) {
      return {
        urgency: 'low',
        message: 'Your pet is slightly hungry but doing fine.',
      };
    } else {
      return {
        urgency: 'low',
        message: 'Your pet is well-fed and content.',
      };
    }
  }

  /**
   * Calculate health impact from hunger
   */
  calculateHealthImpact(hunger: number, currentHealth: number): number {
    if (hunger >= 95) {
      // Critical hunger causes health loss
      return Math.max(0, currentHealth - 5);
    } else if (hunger >= 85) {
      // High hunger causes minor health loss
      return Math.max(0, currentHealth - 2);
    }

    return currentHealth; // No health impact
  }

  /**
   * Calculate happiness impact from hunger
   */
  calculateHappinessImpact(hunger: number, currentHappiness: number): number {
    if (hunger >= 80) {
      // High hunger reduces happiness
      const reduction = Math.floor((hunger - 80) / 5);
      return Math.max(0, currentHappiness - reduction);
    }

    return currentHappiness; // No happiness impact
  }

  /**
   * Get feeding cooldown time in minutes
   */
  getFeedingCooldown(lastFed: Date): number {
    const now = new Date();
    const minutesSinceLastFed =
      (now.getTime() - lastFed.getTime()) / (1000 * 60);
    const cooldownMinutes = 30; // 30 minutes between feedings

    return Math.max(0, cooldownMinutes - minutesSinceLastFed);
  }

  /**
   * Check if pet can be fed (not in cooldown)
   */
  canFeedPet(lastFed: Date): boolean {
    return this.getFeedingCooldown(lastFed) === 0;
  }

  /**
   * Calculate feeding effects based on food type and pet hunger
   */
  calculateFeedingEffects(
    foodId: string,
    currentHunger: number,
    currentHealth: number,
    currentHappiness: number
  ): {
    hungerReduction: number;
    healthIncrease: number;
    happinessIncrease: number;
    evolutionBoost?: number;
  } {
    let baseHungerReduction = 30;
    let baseHealthIncrease = 5;
    let baseHappinessIncrease = 10;
    let evolutionBoost = 0;

    // Adjust effects based on food type
    switch (foodId) {
      case 'basic-kibble':
        baseHungerReduction = 30;
        baseHealthIncrease = 5;
        baseHappinessIncrease = 10;
        break;
      case 'premium-treats':
        baseHungerReduction = 25;
        baseHealthIncrease = 8;
        baseHappinessIncrease = 20;
        evolutionBoost = 2;
        break;
      case 'gourmet-meal':
        baseHungerReduction = 40;
        baseHealthIncrease = 15;
        baseHappinessIncrease = 25;
        evolutionBoost = 5;
        break;
      default:
        // Basic feeding
        baseHungerReduction = 20;
        baseHealthIncrease = 3;
        baseHappinessIncrease = 8;
    }

    // Adjust effects based on current hunger (hungrier pets get more benefit)
    const hungerMultiplier = Math.max(0.5, currentHunger / 100);

    return {
      hungerReduction: Math.floor(baseHungerReduction * hungerMultiplier),
      healthIncrease: Math.min(100 - currentHealth, baseHealthIncrease),
      happinessIncrease: Math.min(
        100 - currentHappiness,
        Math.floor(baseHappinessIncrease * hungerMultiplier)
      ),
      evolutionBoost,
    };
  }

  /**
   * Generate feeding history entry
   */
  createFeedingHistoryEntry(
    foodId: string,
    foodName: string,
    effects: any,
    coinsSpent: number
  ): any {
    return {
      id: `feeding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      foodId,
      foodName,
      timestamp: new Date(),
      effects: [
        { type: 'hunger', value: -effects.hungerReduction },
        { type: 'health', value: effects.healthIncrease },
        { type: 'happiness', value: effects.happinessIncrease },
        ...(effects.evolutionBoost
          ? [{ type: 'evolution_boost', value: effects.evolutionBoost }]
          : []),
      ],
      coinsSpent,
    };
  }

  /**
   * Dispose of all intervals
   */
  dispose(): void {
    for (const [petId] of this.hungerIntervals) {
      this.stopHungerMonitoring(petId);
    }
  }
}

// Create and export singleton instance
export const petHungerSystem = new PetHungerSystemService();
