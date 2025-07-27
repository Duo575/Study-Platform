/**
 * Synchronization Service for handling offline/online data sync
 * Manages data synchronization between IndexedDB and server
 */

import { indexedDBService, type SyncQueueItem } from './indexedDBService';
import type {
  StudyPet,
  GameSession,
  PetFeedingRecord,
  PetEvolutionRecord,
} from '../types';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  failedItems: number;
  syncErrors: string[];
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  failedItems: number;
  errors: string[];
}

export class SyncService {
  private static instance: SyncService;
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: Date | null = null;
  private maxRetries = 3;
  private syncIntervalMs = 30000; // 30 seconds
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    this.setupOnlineStatusListeners();
    this.startPeriodicSync();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    try {
      await indexedDBService.initialize();

      // Perform initial sync if online
      if (this.isOnline) {
        await this.syncPendingItems();
      }

      console.log('Sync service initialized');
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
      throw error;
    }
  }

  /**
   * Add a status change listener
   */
  addStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a status change listener
   */
  removeStatusListener(listener: (status: SyncStatus) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingItems = await indexedDBService.getPendingSyncItems();
    const failedItems = pendingItems.filter(
      item => item.retryCount >= this.maxRetries
    );

    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingItems: pendingItems.length,
      failedItems: failedItems.length,
      syncErrors: failedItems.map(item => item.lastError || 'Unknown error'),
    };
  }

  /**
   * Force a sync operation
   */
  async forceSync(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: ['Device is offline'],
      };
    }

    return this.syncPendingItems();
  }

  /**
   * Sync pet data to server
   */
  async syncPetData(petData: StudyPet): Promise<boolean> {
    if (!this.isOnline) {
      // Store in IndexedDB for later sync
      await indexedDBService.storePetData(petData);
      return true;
    }

    try {
      // Simulate API call to sync pet data
      await this.simulateApiCall('POST', '/api/pets/sync', petData);

      // Update local storage
      await indexedDBService.storePetData(petData);

      return true;
    } catch (error) {
      console.error('Failed to sync pet data:', error);

      // Store in IndexedDB for later sync
      await indexedDBService.storePetData(petData);
      await indexedDBService.addToSyncQueue({
        id: this.generateId(),
        type: 'pet',
        action: 'update',
        data: petData,
        timestamp: new Date(),
        retryCount: 0,
      });

      return false;
    }
  }

  /**
   * Sync feeding record to server
   */
  async syncFeedingRecord(record: PetFeedingRecord): Promise<boolean> {
    // Always store locally first
    await indexedDBService.storeFeedingRecord(record);

    if (!this.isOnline) {
      return true; // Will sync when online
    }

    try {
      // Simulate API call to sync feeding record
      await this.simulateApiCall('POST', '/api/pets/feeding', record);
      return true;
    } catch (error) {
      console.error('Failed to sync feeding record:', error);
      return false;
    }
  }

  /**
   * Sync evolution record to server
   */
  async syncEvolutionRecord(record: PetEvolutionRecord): Promise<boolean> {
    // Always store locally first
    await indexedDBService.storeEvolutionRecord(record);

    if (!this.isOnline) {
      return true; // Will sync when online
    }

    try {
      // Simulate API call to sync evolution record
      await this.simulateApiCall('POST', '/api/pets/evolution', record);
      return true;
    } catch (error) {
      console.error('Failed to sync evolution record:', error);
      return false;
    }
  }

  /**
   * Sync game session to server
   */
  async syncGameSession(session: GameSession): Promise<boolean> {
    // Always store locally first
    await indexedDBService.storeGameSession(session);

    if (!this.isOnline) {
      return true; // Will sync when online
    }

    try {
      // Simulate API call to sync game session
      await this.simulateApiCall('POST', '/api/games/sessions', session);
      return true;
    } catch (error) {
      console.error('Failed to sync game session:', error);
      return false;
    }
  }

  /**
   * Sync all pending items
   */
  private async syncPendingItems(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: ['Sync already in progress'],
      };
    }

    this.isSyncing = true;
    this.notifyStatusChange();

    try {
      const pendingItems = await indexedDBService.getPendingSyncItems();
      let syncedItems = 0;
      let failedItems = 0;
      const errors: string[] = [];

      for (const item of pendingItems) {
        try {
          // Skip items that have exceeded max retries
          if (item.retryCount >= this.maxRetries) {
            failedItems++;
            continue;
          }

          await this.syncItem(item);
          await indexedDBService.removeSyncItem(item.id);
          syncedItems++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync ${item.type} item: ${errorMessage}`);

          await indexedDBService.updateSyncItemRetry(item.id, errorMessage);
          failedItems++;
        }
      }

      this.lastSyncTime = new Date();

      const result: SyncResult = {
        success: syncedItems > 0 || pendingItems.length === 0,
        syncedItems,
        failedItems,
        errors,
      };

      console.log('Sync completed:', result);
      return result;
    } catch (error) {
      console.error('Sync operation failed:', error);
      return {
        success: false,
        syncedItems: 0,
        failedItems: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    } finally {
      this.isSyncing = false;
      this.notifyStatusChange();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getEndpointForItem(item);
    const method = item.action === 'delete' ? 'DELETE' : 'POST';

    await this.simulateApiCall(method, endpoint, item.data);
  }

  /**
   * Get API endpoint for sync item
   */
  private getEndpointForItem(item: SyncQueueItem): string {
    switch (item.type) {
      case 'pet':
        return '/api/pets/sync';
      case 'feeding':
        return '/api/pets/feeding';
      case 'evolution':
        return '/api/pets/evolution';
      case 'game':
        return '/api/games/sessions';
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }
  }

  /**
   * Simulate API call (replace with actual API calls)
   */
  private async simulateApiCall(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }

    console.log(`${method} ${endpoint}`, data ? 'with data' : 'no data');
    return { success: true };
  }

  /**
   * Setup online/offline status listeners
   */
  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Device came online, starting sync...');
      this.syncPendingItems();
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Device went offline');
      this.notifyStatusChange();
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncPendingItems();
      }
    }, this.syncIntervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Notify status change listeners
   */
  private async notifyStatusChange(): Promise<void> {
    const status = await this.getSyncStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync status listener:', error);
      }
    });
  }

  /**
   * Clean up old sync queue items
   */
  async cleanupOldSyncItems(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const cutoffTime = Date.now() - maxAge;
    const pendingItems = await indexedDBService.getPendingSyncItems();

    for (const item of pendingItems) {
      if (
        item.timestamp.getTime() < cutoffTime &&
        item.retryCount >= this.maxRetries
      ) {
        await indexedDBService.removeSyncItem(item.id);
        console.log(`Removed old failed sync item: ${item.id}`);
      }
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStatistics(): Promise<{
    totalPendingItems: number;
    itemsByType: Record<string, number>;
    oldestPendingItem: Date | null;
    averageRetryCount: number;
  }> {
    const pendingItems = await indexedDBService.getPendingSyncItems();

    const itemsByType: Record<string, number> = {};
    let totalRetries = 0;
    let oldestTimestamp = Date.now();

    for (const item of pendingItems) {
      itemsByType[item.type] = (itemsByType[item.type] || 0) + 1;
      totalRetries += item.retryCount;

      if (item.timestamp.getTime() < oldestTimestamp) {
        oldestTimestamp = item.timestamp.getTime();
      }
    }

    return {
      totalPendingItems: pendingItems.length,
      itemsByType,
      oldestPendingItem:
        pendingItems.length > 0 ? new Date(oldestTimestamp) : null,
      averageRetryCount:
        pendingItems.length > 0 ? totalRetries / pendingItems.length : 0,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPeriodicSync();
    this.listeners.clear();
    window.removeEventListener('online', this.setupOnlineStatusListeners);
    window.removeEventListener('offline', this.setupOnlineStatusListeners);
  }
}

// Singleton instance
export const syncService = SyncService.getInstance();
