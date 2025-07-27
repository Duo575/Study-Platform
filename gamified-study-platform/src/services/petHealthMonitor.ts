import type { StudyPetExtended, PetStatus, PetNeed } from '../types';

export interface HealthAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  petId: string;
  acknowledged: boolean;
  actionRequired?: string;
}

export interface HealthTrend {
  timestamp: Date;
  health: number;
  happiness: number;
  hunger: number;
  energy: number;
}

/**
 * Service for monitoring pet health and providing alerts and recommendations
 */
export class PetHealthMonitorService {
  private healthIntervals: Map<string, NodeJS.Timeout> = new Map();
  private healthTrends: Map<string, HealthTrend[]> = new Map();
  private healthAlerts: Map<string, HealthAlert[]> = new Map();
  private alertCallbacks: Map<string, (alert: HealthAlert) => void> = new Map();

  /**
   * Start monitoring health for a pet
   */
  startHealthMonitoring(
    petId: string,
    onHealthUpdate: (petId: string, healthData: any) => void,
    onAlert?: (alert: HealthAlert) => void
  ): void {
    // Clear existing monitoring
    this.stopHealthMonitoring(petId);

    // Set alert callback
    if (onAlert) {
      this.alertCallbacks.set(petId, onAlert);
    }

    // Start monitoring interval (every 5 minutes)
    const interval = setInterval(
      () => {
        this.performHealthCheck(petId, onHealthUpdate);
      },
      5 * 60 * 1000
    );

    this.healthIntervals.set(petId, interval);
  }

  /**
   * Stop monitoring health for a pet
   */
  stopHealthMonitoring(petId: string): void {
    const interval = this.healthIntervals.get(petId);
    if (interval) {
      clearInterval(interval);
      this.healthIntervals.delete(petId);
      this.alertCallbacks.delete(petId);
    }
  }

  /**
   * Perform a health check for a pet
   */
  private async performHealthCheck(
    petId: string,
    onHealthUpdate: (petId: string, healthData: any) => void
  ): Promise<void> {
    try {
      // This would typically fetch current pet data
      // For now, we'll simulate the health check
      const healthData = await this.calculateHealthMetrics(petId);

      // Record health trend
      this.recordHealthTrend(petId, healthData);

      // Check for health issues
      const alerts = this.checkHealthIssues(petId, healthData);

      // Trigger alerts
      alerts.forEach(alert => {
        this.addAlert(petId, alert);
        const callback = this.alertCallbacks.get(petId);
        if (callback) {
          callback(alert);
        }
      });

      // Update health data
      onHealthUpdate(petId, healthData);
    } catch (error) {
      console.error('Error performing health check:', error);
    }
  }

  /**
   * Calculate health metrics for a pet
   */
  private async calculateHealthMetrics(petId: string): Promise<any> {
    // This would typically fetch real pet data
    // For now, we'll return mock data
    return {
      health: 75,
      happiness: 60,
      hunger: 45,
      energy: 80,
      lastFed: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastPlayed: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      lastInteraction: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    };
  }

  /**
   * Record health trend data
   */
  private recordHealthTrend(petId: string, healthData: any): void {
    const trends = this.healthTrends.get(petId) || [];
    const newTrend: HealthTrend = {
      timestamp: new Date(),
      health: healthData.health,
      happiness: healthData.happiness,
      hunger: healthData.hunger,
      energy: healthData.energy,
    };

    trends.push(newTrend);

    // Keep only last 24 hours of data (288 entries at 5-minute intervals)
    if (trends.length > 288) {
      trends.splice(0, trends.length - 288);
    }

    this.healthTrends.set(petId, trends);
  }

  /**
   * Check for health issues and generate alerts
   */
  private checkHealthIssues(petId: string, healthData: any): HealthAlert[] {
    const alerts: HealthAlert[] = [];
    const now = new Date();

    // Critical health alerts
    if (healthData.health <= 20) {
      alerts.push({
        id: `health_critical_${Date.now()}`,
        type: 'critical',
        title: 'Critical Health Alert',
        message:
          "Your pet's health is critically low! Immediate care is needed.",
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Feed your pet and provide care immediately',
      });
    } else if (healthData.health <= 40) {
      alerts.push({
        id: `health_warning_${Date.now()}`,
        type: 'warning',
        title: 'Low Health Warning',
        message:
          "Your pet's health is getting low. Consider providing care soon.",
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Feed your pet or provide care',
      });
    }

    // Happiness alerts
    if (healthData.happiness <= 20) {
      alerts.push({
        id: `happiness_critical_${Date.now()}`,
        type: 'critical',
        title: 'Pet is Very Unhappy',
        message: 'Your pet is very unhappy and needs attention!',
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Play with your pet or provide treats',
      });
    } else if (healthData.happiness <= 40) {
      alerts.push({
        id: `happiness_warning_${Date.now()}`,
        type: 'warning',
        title: 'Pet Needs Attention',
        message: 'Your pet is feeling down and could use some playtime.',
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Play with your pet',
      });
    }

    // Hunger alerts
    if (healthData.hunger >= 80) {
      alerts.push({
        id: `hunger_critical_${Date.now()}`,
        type: 'critical',
        title: 'Pet is Starving',
        message: 'Your pet is very hungry and needs food immediately!',
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Feed your pet right away',
      });
    } else if (healthData.hunger >= 60) {
      alerts.push({
        id: `hunger_warning_${Date.now()}`,
        type: 'warning',
        title: 'Pet is Hungry',
        message: 'Your pet is getting hungry and should be fed soon.',
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Feed your pet',
      });
    }

    // Neglect alerts (based on time since last interaction)
    const hoursSinceInteraction =
      (now.getTime() - healthData.lastInteraction.getTime()) / (1000 * 60 * 60);
    if (hoursSinceInteraction >= 24) {
      alerts.push({
        id: `neglect_critical_${Date.now()}`,
        type: 'critical',
        title: 'Pet Feels Neglected',
        message:
          "Your pet hasn't been cared for in over 24 hours and feels abandoned.",
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Interact with your pet immediately',
      });
    } else if (hoursSinceInteraction >= 12) {
      alerts.push({
        id: `neglect_warning_${Date.now()}`,
        type: 'warning',
        title: 'Pet Misses You',
        message:
          "Your pet hasn't seen you in a while and misses your attention.",
        timestamp: now,
        petId,
        acknowledged: false,
        actionRequired: 'Spend some time with your pet',
      });
    }

    return alerts;
  }

  /**
   * Add an alert for a pet
   */
  private addAlert(petId: string, alert: HealthAlert): void {
    const alerts = this.healthAlerts.get(petId) || [];

    // Check if similar alert already exists (avoid spam)
    const existingAlert = alerts.find(
      a =>
        a.type === alert.type &&
        a.title === alert.title &&
        !a.acknowledged &&
        Date.now() - a.timestamp.getTime() < 30 * 60 * 1000 // Within 30 minutes
    );

    if (!existingAlert) {
      alerts.push(alert);

      // Keep only last 50 alerts
      if (alerts.length > 50) {
        alerts.splice(0, alerts.length - 50);
      }

      this.healthAlerts.set(petId, alerts);
    }
  }

  /**
   * Get health alerts for a pet
   */
  getHealthAlerts(
    petId: string,
    unacknowledgedOnly: boolean = false
  ): HealthAlert[] {
    const alerts = this.healthAlerts.get(petId) || [];

    if (unacknowledgedOnly) {
      return alerts.filter(alert => !alert.acknowledged);
    }

    return [...alerts];
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(petId: string, alertId: string): void {
    const alerts = this.healthAlerts.get(petId) || [];
    const alert = alerts.find(a => a.id === alertId);

    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get health trends for a pet
   */
  getHealthTrends(petId: string, hours: number = 24): HealthTrend[] {
    const trends = this.healthTrends.get(petId) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return trends.filter(trend => trend.timestamp >= cutoffTime);
  }

  /**
   * Calculate health recovery recommendations
   */
  getHealthRecoveryPlan(
    petId: string,
    currentStatus: PetStatus
  ): {
    priority: 'low' | 'medium' | 'high' | 'critical';
    actions: Array<{
      action: string;
      description: string;
      urgency: 'immediate' | 'soon' | 'when_convenient';
      estimatedEffect: string;
    }>;
    timeToRecovery: string;
  } {
    const actions: any[] = [];
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Health recovery actions
    if (currentStatus.health <= 30) {
      priority = 'critical';
      actions.push({
        action: 'Feed Premium Food',
        description:
          'Give your pet high-quality food to restore health quickly',
        urgency: 'immediate',
        estimatedEffect: '+15-20 health',
      });
      actions.push({
        action: 'Provide Medical Care',
        description: 'Use health items or visit a pet care center',
        urgency: 'immediate',
        estimatedEffect: '+25-30 health',
      });
    } else if (currentStatus.health <= 50) {
      priority = Math.max(priority as any, 'high' as any) as any;
      actions.push({
        action: 'Regular Feeding',
        description: 'Feed your pet regularly to maintain health',
        urgency: 'soon',
        estimatedEffect: '+10-15 health',
      });
    }

    // Happiness recovery actions
    if (currentStatus.happiness <= 30) {
      priority = Math.max(priority as any, 'high' as any) as any;
      actions.push({
        action: 'Play Time',
        description: 'Spend quality time playing with your pet',
        urgency: 'soon',
        estimatedEffect: '+20-25 happiness',
      });
      actions.push({
        action: 'Give Treats',
        description: 'Provide special treats to boost mood',
        urgency: 'soon',
        estimatedEffect: '+15-20 happiness',
      });
    }

    // Hunger actions
    if (currentStatus.hunger >= 70) {
      priority = Math.max(priority as any, 'high' as any) as any;
      actions.push({
        action: 'Feed Immediately',
        description: 'Your pet is very hungry and needs food now',
        urgency: 'immediate',
        estimatedEffect: '-30-40 hunger',
      });
    }

    // Calculate recovery time
    let timeToRecovery = 'Unknown';
    if (actions.length > 0) {
      const immediateActions = actions.filter(
        a => a.urgency === 'immediate'
      ).length;
      const soonActions = actions.filter(a => a.urgency === 'soon').length;

      if (immediateActions > 0) {
        timeToRecovery = '30 minutes - 1 hour';
      } else if (soonActions > 0) {
        timeToRecovery = '2-4 hours';
      } else {
        timeToRecovery = '1-2 days';
      }
    } else {
      timeToRecovery = 'Pet is healthy';
    }

    return {
      priority,
      actions,
      timeToRecovery,
    };
  }

  /**
   * Generate pet needs based on current status
   */
  generatePetNeeds(petStatus: PetStatus): PetNeed[] {
    const needs: PetNeed[] = [];

    // Food needs
    if (petStatus.hunger >= 80) {
      needs.push({
        type: 'food',
        urgency: 'critical',
        description: 'Your pet is starving and needs food immediately!',
        timeRemaining: 0,
      });
    } else if (petStatus.hunger >= 60) {
      needs.push({
        type: 'food',
        urgency: 'high',
        description: 'Your pet is very hungry',
        timeRemaining: 60,
      });
    } else if (petStatus.hunger >= 40) {
      needs.push({
        type: 'food',
        urgency: 'medium',
        description: 'Your pet is getting hungry',
        timeRemaining: 120,
      });
    }

    // Play needs
    if (petStatus.happiness <= 20) {
      needs.push({
        type: 'play',
        urgency: 'critical',
        description: 'Your pet is very sad and needs attention!',
        timeRemaining: 0,
      });
    } else if (petStatus.happiness <= 40) {
      needs.push({
        type: 'play',
        urgency: 'high',
        description: 'Your pet wants to play',
        timeRemaining: 90,
      });
    } else if (petStatus.happiness <= 60) {
      needs.push({
        type: 'play',
        urgency: 'medium',
        description: 'Your pet could use some playtime',
        timeRemaining: 180,
      });
    }

    // Health needs
    if (petStatus.health <= 30) {
      needs.push({
        type: 'care',
        urgency: 'critical',
        description: 'Your pet needs medical attention!',
        timeRemaining: 0,
      });
    } else if (petStatus.health <= 50) {
      needs.push({
        type: 'care',
        urgency: 'high',
        description: 'Your pet needs some care',
        timeRemaining: 120,
      });
    }

    return needs;
  }

  /**
   * Dispose of all monitoring
   */
  dispose(): void {
    for (const [petId] of this.healthIntervals) {
      this.stopHealthMonitoring(petId);
    }
    this.healthTrends.clear();
    this.healthAlerts.clear();
  }
}

// Create and export singleton instance
export const petHealthMonitor = new PetHealthMonitorService();
