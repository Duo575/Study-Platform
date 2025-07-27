/**
 * IndexedDB Service for storing pet data, game progress, and offline support
 * Provides structured storage for complex data with offline synchronization
 */

import type {
  StudyPet,
  PetActivity,
  GameSession,
  MiniGameProgress,
  PetEvolution,
  PetFood,
  PetAccessory,
} from '../types';

export interface PetStorageData {
  id: string;
  petData: StudyPet;
  activities: PetActivity[];
  feedingHistory: PetFeedingRecord[];
  evolutionHistory: PetEvolutionRecord[];
  lastSynced: Date;
  version: number;
}

export interface PetFeedingRecord {
  id: string;
  petId: string;
  foodId: string;
  foodName: string;
  timestamp: Date;
  healthChange: number;
  happinessChange: number;
  energyChange: number;
}

export interface PetEvolutionRecord {
  id: string;
  petId: string;
  fromStage: string;
  toStage: string;
  timestamp: Date;
  requirements: string[];
  celebrationShown: boolean;
}

export interface GameStorageData {
  id: string;
  gameId: string;
  userId: string;
  sessions: GameSession[];
  progress: MiniGameProgress;
  achievements: string[];
  lastSynced: Date;
  version: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'pet' | 'game' | 'feeding' | 'evolution';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

export class IndexedDBService {
  private static instance: IndexedDBService;
  private db: IDBDatabase | null = null;
  private readonly dbName = 'StudyPlatformDB';
  private readonly dbVersion = 1;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): IndexedDBService {
    if (!IndexedDBService.instance) {
      IndexedDBService.instance = new IndexedDBService();
    }
    return IndexedDBService.instance;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(new Error('Failed to initialize IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores for the database
   */
  private createObjectStores(db: IDBDatabase): void {
    // Pet data store
    if (!db.objectStoreNames.contains('pets')) {
      const petStore = db.createObjectStore('pets', { keyPath: 'id' });
      petStore.createIndex('userId', 'petData.userId', { unique: false });
      petStore.createIndex('lastSynced', 'lastSynced', { unique: false });
    }

    // Game data store
    if (!db.objectStoreNames.contains('games')) {
      const gameStore = db.createObjectStore('games', { keyPath: 'id' });
      gameStore.createIndex('gameId', 'gameId', { unique: false });
      gameStore.createIndex('userId', 'userId', { unique: false });
      gameStore.createIndex('lastSynced', 'lastSynced', { unique: false });
    }

    // Feeding history store
    if (!db.objectStoreNames.contains('feeding_history')) {
      const feedingStore = db.createObjectStore('feeding_history', {
        keyPath: 'id',
      });
      feedingStore.createIndex('petId', 'petId', { unique: false });
      feedingStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Evolution history store
    if (!db.objectStoreNames.contains('evolution_history')) {
      const evolutionStore = db.createObjectStore('evolution_history', {
        keyPath: 'id',
      });
      evolutionStore.createIndex('petId', 'petId', { unique: false });
      evolutionStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains('sync_queue')) {
      const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
      syncStore.createIndex('type', 'type', { unique: false });
      syncStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Game sessions store
    if (!db.objectStoreNames.contains('game_sessions')) {
      const sessionStore = db.createObjectStore('game_sessions', {
        keyPath: 'id',
      });
      sessionStore.createIndex('gameId', 'gameId', { unique: false });
      sessionStore.createIndex('userId', 'userId', { unique: false });
      sessionStore.createIndex('startTime', 'startTime', { unique: false });
    }
  }

  /**
   * Store pet data
   */
  async storePetData(
    petData: StudyPet,
    activities: PetActivity[] = []
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const storageData: PetStorageData = {
      id: petData.id,
      petData,
      activities,
      feedingHistory: [],
      evolutionHistory: [],
      lastSynced: new Date(),
      version: 1,
    };

    return this.performTransaction('pets', 'readwrite', store => {
      store.put(storageData);
    });
  }

  /**
   * Retrieve pet data
   */
  async getPetData(petId: string): Promise<PetStorageData | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('pets', 'readonly', store => {
      return store.get(petId);
    });
  }

  /**
   * Get all pets for a user
   */
  async getUserPets(userId: string): Promise<PetStorageData[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('pets', 'readonly', store => {
      const index = store.index('userId');
      return this.getAllFromIndex(index, userId);
    });
  }

  /**
   * Store feeding record
   */
  async storeFeedingRecord(record: PetFeedingRecord): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('feeding_history', 'readwrite', store => {
      store.put(record);
    });

    // Also add to sync queue for server synchronization
    await this.addToSyncQueue({
      id: this.generateId(),
      type: 'feeding',
      action: 'create',
      data: record,
      timestamp: new Date(),
      retryCount: 0,
    });
  }

  /**
   * Get feeding history for a pet
   */
  async getFeedingHistory(
    petId: string,
    limit?: number
  ): Promise<PetFeedingRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('feeding_history', 'readonly', store => {
      const index = store.index('petId');
      const request = index.getAll(petId);

      return new Promise<PetFeedingRecord[]>((resolve, reject) => {
        request.onsuccess = () => {
          let results = request.result;
          // Sort by timestamp descending
          results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          if (limit) {
            results = results.slice(0, limit);
          }

          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Store evolution record
   */
  async storeEvolutionRecord(record: PetEvolutionRecord): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('evolution_history', 'readwrite', store => {
      store.put(record);
    });

    // Add to sync queue
    await this.addToSyncQueue({
      id: this.generateId(),
      type: 'evolution',
      action: 'create',
      data: record,
      timestamp: new Date(),
      retryCount: 0,
    });
  }

  /**
   * Get evolution history for a pet
   */
  async getEvolutionHistory(petId: string): Promise<PetEvolutionRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('evolution_history', 'readonly', store => {
      const index = store.index('petId');
      const request = index.getAll(petId);

      return new Promise<PetEvolutionRecord[]>((resolve, reject) => {
        request.onsuccess = () => {
          const results = request.result;
          // Sort by timestamp ascending
          results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Store game data
   */
  async storeGameData(gameData: GameStorageData): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('games', 'readwrite', store => {
      store.put(gameData);
    });
  }

  /**
   * Get game data
   */
  async getGameData(
    gameId: string,
    userId: string
  ): Promise<GameStorageData | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const compositeId = `${gameId}-${userId}`;
    return this.performTransaction('games', 'readonly', store => {
      return store.get(compositeId);
    });
  }

  /**
   * Store game session
   */
  async storeGameSession(session: GameSession): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('game_sessions', 'readwrite', store => {
      store.put(session);
    });

    // Add to sync queue
    await this.addToSyncQueue({
      id: this.generateId(),
      type: 'game',
      action: session.completed ? 'update' : 'create',
      data: session,
      timestamp: new Date(),
      retryCount: 0,
    });
  }

  /**
   * Get game sessions for a user and game
   */
  async getGameSessions(
    gameId: string,
    userId: string,
    limit?: number
  ): Promise<GameSession[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('game_sessions', 'readonly', store => {
      const index = store.index('gameId');
      const request = index.getAll(gameId);

      return new Promise<GameSession[]>((resolve, reject) => {
        request.onsuccess = () => {
          let results = request.result.filter(
            session => session.userId === userId
          );
          // Sort by start time descending
          results.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

          if (limit) {
            results = results.slice(0, limit);
          }

          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('sync_queue', 'readwrite', store => {
      store.put(item);
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems(limit = 50): Promise<SyncQueueItem[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('sync_queue', 'readonly', store => {
      const request = store.getAll();

      return new Promise<SyncQueueItem[]>((resolve, reject) => {
        request.onsuccess = () => {
          let results = request.result;
          // Sort by timestamp ascending (oldest first)
          results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          if (limit) {
            results = results.slice(0, limit);
          }

          resolve(results);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  /**
   * Remove item from sync queue
   */
  async removeSyncItem(itemId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('sync_queue', 'readwrite', store => {
      store.delete(itemId);
    });
  }

  /**
   * Update sync item retry count
   */
  async updateSyncItemRetry(itemId: string, error: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.performTransaction('sync_queue', 'readwrite', store => {
      const getRequest = store.get(itemId);

      return new Promise<void>((resolve, reject) => {
        getRequest.onsuccess = () => {
          const item = getRequest.result;
          if (item) {
            item.retryCount += 1;
            item.lastError = error;

            const putRequest = store.put(item);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  /**
   * Clear old data based on retention policy
   */
  async clearOldData(retentionDays = 30): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Clear old feeding records
    await this.performTransaction('feeding_history', 'readwrite', store => {
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });

    // Clear old game sessions
    await this.performTransaction('game_sessions', 'readwrite', store => {
      const index = store.index('startTime');
      const range = IDBKeyRange.upperBound(cutoffDate);
      const request = index.openCursor(range);

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    });

    console.log(`Cleared data older than ${retentionDays} days`);
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    pets: number;
    feedingRecords: number;
    evolutionRecords: number;
    gameSessions: number;
    pendingSyncItems: number;
  }> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const [
      pets,
      feedingRecords,
      evolutionRecords,
      gameSessions,
      pendingSyncItems,
    ] = await Promise.all([
      this.getStoreCount('pets'),
      this.getStoreCount('feeding_history'),
      this.getStoreCount('evolution_history'),
      this.getStoreCount('game_sessions'),
      this.getStoreCount('sync_queue'),
    ]);

    return {
      pets,
      feedingRecords,
      evolutionRecords,
      gameSessions,
      pendingSyncItems,
    };
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const data = {
      pets: await this.getAllFromStore('pets'),
      feedingHistory: await this.getAllFromStore('feeding_history'),
      evolutionHistory: await this.getAllFromStore('evolution_history'),
      gameSessions: await this.getAllFromStore('game_sessions'),
      exportedAt: new Date().toISOString(),
      version: this.dbVersion,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from backup
   */
  async importData(backupData: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const data = JSON.parse(backupData);

      // Import pets
      if (data.pets && Array.isArray(data.pets)) {
        await this.performTransaction('pets', 'readwrite', store => {
          data.pets.forEach((pet: PetStorageData) => {
            store.put(pet);
          });
        });
      }

      // Import feeding history
      if (data.feedingHistory && Array.isArray(data.feedingHistory)) {
        await this.performTransaction('feeding_history', 'readwrite', store => {
          data.feedingHistory.forEach((record: PetFeedingRecord) => {
            store.put(record);
          });
        });
      }

      // Import evolution history
      if (data.evolutionHistory && Array.isArray(data.evolutionHistory)) {
        await this.performTransaction(
          'evolution_history',
          'readwrite',
          store => {
            data.evolutionHistory.forEach((record: PetEvolutionRecord) => {
              store.put(record);
            });
          }
        );
      }

      // Import game sessions
      if (data.gameSessions && Array.isArray(data.gameSessions)) {
        await this.performTransaction('game_sessions', 'readwrite', store => {
          data.gameSessions.forEach((session: GameSession) => {
            store.put(session);
          });
        });
      }

      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const storeNames = [
      'pets',
      'feeding_history',
      'evolution_history',
      'game_sessions',
      'sync_queue',
    ];

    for (const storeName of storeNames) {
      await this.performTransaction(storeName, 'readwrite', store => {
        store.clear();
      });
    }

    console.log('All IndexedDB data cleared');
  }

  // Helper methods

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest | Promise<T> | void
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));

      const result = operation(store);

      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else if (result && 'onsuccess' in result) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error);
      } else {
        transaction.oncomplete = () => resolve(result as T);
      }
    });
  }

  private async getAllFromIndex<T>(
    index: IDBIndex,
    key: IDBValidKey
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = index.getAll(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    return this.performTransaction(storeName, 'readonly', store => {
      return new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  private async getStoreCount(storeName: string): Promise<number> {
    return this.performTransaction(storeName, 'readonly', store => {
      return new Promise<number>((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const indexedDBService = IndexedDBService.getInstance();
