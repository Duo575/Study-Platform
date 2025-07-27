/**
 * React hooks for offline storage and synchronization
 */

import { useEffect, useState, useCallback } from 'react';
import { indexedDBService } from '../services/indexedDBService';
import { syncService, type SyncStatus } from '../services/syncService';
import { usePetStore } from '../store/petStore';
import type {
  StudyPet,
  GameSession,
  PetFeedingRecord,
  PetEvolutionRecord,
  MiniGameProgress,
} from '../types';

/**
 * Hook to initialize offline storage
 */
export function useOfflineStorageInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await indexedDBService.initialize();
        await syncService.initialize();
        setIsInitialized(true);
        console.log('Offline storage initialized');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Failed to initialize offline storage:', err);
      }
    };

    initialize();
  }, []);

  return { isInitialized, error };
}

/**
 * Hook for pet data offline storage
 */
export function usePetOfflineStorage() {
  const petStore = usePetStore();

  // Load pet data from IndexedDB on mount
  useEffect(() => {
    const loadPetData = async () => {
      try {
        if (petStore.pet?.id) {
          const storedData = await indexedDBService.getPetData(petStore.pet.id);
          if (storedData && storedData.petData) {
            // Update store with offline data if it's newer
            const storedTime = storedData.lastSynced.getTime();
            const currentTime = petStore.pet.updatedAt?.getTime() || 0;

            if (storedTime > currentTime) {
              console.log('Loading newer pet data from offline storage');
              // You would update the pet store here
              // petStore.setPet(storedData.petData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load pet data from offline storage:', error);
      }
    };

    loadPetData();
  }, [petStore.pet?.id]);

  // Save pet data to IndexedDB
  const savePetData = useCallback(
    async (pet: StudyPet, activities: any[] = []) => {
      try {
        await indexedDBService.storePetData(pet, activities);
        await syncService.syncPetData(pet);
      } catch (error) {
        console.error('Failed to save pet data:', error);
        throw error;
      }
    },
    []
  );

  // Record feeding
  const recordFeeding = useCallback(
    async (
      petId: string,
      foodId: string,
      foodName: string,
      effects: { health: number; happiness: number; energy: number }
    ) => {
      try {
        const record: PetFeedingRecord = {
          id: `feeding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          petId,
          foodId,
          foodName,
          timestamp: new Date(),
          healthChange: effects.health,
          happinessChange: effects.happiness,
          energyChange: effects.energy,
        };

        await syncService.syncFeedingRecord(record);
        return record;
      } catch (error) {
        console.error('Failed to record feeding:', error);
        throw error;
      }
    },
    []
  );

  // Record evolution
  const recordEvolution = useCallback(
    async (
      petId: string,
      fromStage: string,
      toStage: string,
      requirements: string[]
    ) => {
      try {
        const record: PetEvolutionRecord = {
          id: `evolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          petId,
          fromStage,
          toStage,
          timestamp: new Date(),
          requirements,
          celebrationShown: false,
        };

        await syncService.syncEvolutionRecord(record);
        return record;
      } catch (error) {
        console.error('Failed to record evolution:', error);
        throw error;
      }
    },
    []
  );

  // Get feeding history
  const getFeedingHistory = useCallback(
    async (petId: string, limit?: number) => {
      try {
        return await indexedDBService.getFeedingHistory(petId, limit);
      } catch (error) {
        console.error('Failed to get feeding history:', error);
        return [];
      }
    },
    []
  );

  // Get evolution history
  const getEvolutionHistory = useCallback(async (petId: string) => {
    try {
      return await indexedDBService.getEvolutionHistory(petId);
    } catch (error) {
      console.error('Failed to get evolution history:', error);
      return [];
    }
  }, []);

  return {
    savePetData,
    recordFeeding,
    recordEvolution,
    getFeedingHistory,
    getEvolutionHistory,
  };
}

/**
 * Hook for game data offline storage
 */
export function useGameOfflineStorage() {
  // Save game session
  const saveGameSession = useCallback(async (session: GameSession) => {
    try {
      await syncService.syncGameSession(session);
      return session;
    } catch (error) {
      console.error('Failed to save game session:', error);
      throw error;
    }
  }, []);

  // Get game sessions
  const getGameSessions = useCallback(
    async (gameId: string, userId: string, limit?: number) => {
      try {
        return await indexedDBService.getGameSessions(gameId, userId, limit);
      } catch (error) {
        console.error('Failed to get game sessions:', error);
        return [];
      }
    },
    []
  );

  // Save game progress
  const saveGameProgress = useCallback(
    async (gameId: string, userId: string, progress: MiniGameProgress) => {
      try {
        const gameData = {
          id: `${gameId}-${userId}`,
          gameId,
          userId,
          sessions: [],
          progress,
          achievements: progress.achievements,
          lastSynced: new Date(),
          version: 1,
        };

        await indexedDBService.storeGameData(gameData);
        console.log('Game progress saved offline');
      } catch (error) {
        console.error('Failed to save game progress:', error);
        throw error;
      }
    },
    []
  );

  // Get game progress
  const getGameProgress = useCallback(
    async (gameId: string, userId: string) => {
      try {
        const gameData = await indexedDBService.getGameData(gameId, userId);
        return gameData?.progress || null;
      } catch (error) {
        console.error('Failed to get game progress:', error);
        return null;
      }
    },
    []
  );

  return {
    saveGameSession,
    getGameSessions,
    saveGameProgress,
    getGameProgress,
  };
}

/**
 * Hook for sync status monitoring
 */
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    failedItems: 0,
    syncErrors: [],
  });

  useEffect(() => {
    const updateStatus = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    syncService.addStatusListener(updateStatus);

    // Get initial status
    syncService.getSyncStatus().then(updateStatus);

    return () => {
      syncService.removeStatusListener(updateStatus);
    };
  }, []);

  const forceSync = useCallback(async () => {
    try {
      const result = await syncService.forceSync();
      console.log('Force sync result:', result);
      return result;
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }, []);

  return {
    syncStatus,
    forceSync,
  };
}

/**
 * Hook for offline data management
 */
export function useOfflineDataManagement() {
  const [stats, setStats] = useState<{
    pets: number;
    feedingRecords: number;
    evolutionRecords: number;
    gameSessions: number;
    pendingSyncItems: number;
  } | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const dbStats = await indexedDBService.getDatabaseStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = await indexedDBService.exportAllData();

      // Create downloadable file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `offline-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return data;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const success = await indexedDBService.importData(text);

        if (success) {
          await loadStats(); // Refresh stats
        }

        return success;
      } catch (error) {
        console.error('Failed to import data:', error);
        throw error;
      }
    },
    [loadStats]
  );

  const clearAllData = useCallback(async () => {
    try {
      await indexedDBService.clearAllData();
      await loadStats(); // Refresh stats
      console.log('All offline data cleared');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }, [loadStats]);

  const cleanupOldData = useCallback(
    async (retentionDays = 30) => {
      try {
        await indexedDBService.clearOldData(retentionDays);
        await syncService.cleanupOldSyncItems();
        await loadStats(); // Refresh stats
        console.log(`Cleaned up data older than ${retentionDays} days`);
      } catch (error) {
        console.error('Failed to cleanup old data:', error);
        throw error;
      }
    },
    [loadStats]
  );

  return {
    stats,
    loadStats,
    exportData,
    importData,
    clearAllData,
    cleanupOldData,
  };
}

/**
 * Hook for automatic offline data cleanup
 */
export function useOfflineDataCleanup(retentionDays = 30) {
  useEffect(() => {
    const cleanup = async () => {
      try {
        await indexedDBService.clearOldData(retentionDays);
        await syncService.cleanupOldSyncItems();
        console.log('Automatic data cleanup completed');
      } catch (error) {
        console.error('Automatic data cleanup failed:', error);
      }
    };

    // Run cleanup on mount
    cleanup();

    // Set up periodic cleanup (daily)
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [retentionDays]);
}
