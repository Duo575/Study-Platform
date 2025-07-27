/**
 * Local Storage utilities for user preferences and settings
 * Provides versioned storage with migration support and backup/restore functionality
 */

export interface StorageConfig {
  version: number;
  key: string;
  defaultValue: any;
  migrations?: Record<number, (data: any) => any>;
}

export interface StorageMetadata {
  version: number;
  timestamp: number;
  checksum?: string;
}

export interface StorageEntry<T = any> {
  data: T;
  metadata: StorageMetadata;
}

export class LocalStorageManager {
  private static instance: LocalStorageManager;
  private storageConfigs: Map<string, StorageConfig> = new Map();

  private constructor() {}

  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  /**
   * Register a storage configuration for a specific key
   */
  registerConfig(config: StorageConfig): void {
    this.storageConfigs.set(config.key, config);
  }

  /**
   * Store data with versioning and metadata
   */
  setItem<T>(key: string, data: T): boolean {
    try {
      const config = this.storageConfigs.get(key);
      const version = config?.version || 1;

      const entry: StorageEntry<T> = {
        data,
        metadata: {
          version,
          timestamp: Date.now(),
          checksum: this.generateChecksum(data),
        },
      };

      localStorage.setItem(key, JSON.stringify(entry));
      return true;
    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data with automatic migration if needed
   */
  getItem<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        const config = this.storageConfigs.get(key);
        return config?.defaultValue || null;
      }

      const entry: StorageEntry<T> = JSON.parse(stored);
      const config = this.storageConfigs.get(key);

      if (!config) {
        return entry.data;
      }

      // Check if migration is needed
      const currentVersion = config.version;
      const storedVersion = entry.metadata.version;

      if (storedVersion < currentVersion) {
        const migratedData = this.migrateData(
          entry.data,
          storedVersion,
          currentVersion,
          config.migrations || {}
        );

        // Store the migrated data
        this.setItem(key, migratedData);
        return migratedData;
      }

      // Verify data integrity if checksum exists
      if (entry.metadata.checksum) {
        const currentChecksum = this.generateChecksum(entry.data);
        if (currentChecksum !== entry.metadata.checksum) {
          console.warn(`Data integrity check failed for key ${key}`);
          // Return default value if data is corrupted
          return config.defaultValue || null;
        }
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      const config = this.storageConfigs.get(key);
      return config?.defaultValue || null;
    }
  }

  /**
   * Remove an item from storage
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if an item exists in storage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get storage metadata for a key
   */
  getMetadata(key: string): StorageMetadata | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const entry: StorageEntry = JSON.parse(stored);
      return entry.metadata;
    } catch (error) {
      console.error(`Failed to get metadata for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Create a backup of all registered storage items
   */
  createBackup(): string {
    const backup: Record<string, any> = {};
    const timestamp = new Date().toISOString();

    for (const [key] of this.storageConfigs) {
      const data = this.getItem(key);
      if (data !== null) {
        backup[key] = {
          data,
          config: this.storageConfigs.get(key),
          timestamp,
        };
      }
    }

    return JSON.stringify({
      version: 1,
      timestamp,
      data: backup,
    });
  }

  /**
   * Restore data from a backup
   */
  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);

      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Invalid backup format');
      }

      let restoredCount = 0;

      for (const [key, backupEntry] of Object.entries(backup.data)) {
        if (this.storageConfigs.has(key)) {
          const success = this.setItem(key, (backupEntry as any).data);
          if (success) {
            restoredCount++;
          }
        }
      }

      console.log(`Restored ${restoredCount} items from backup`);
      return restoredCount > 0;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Clear all registered storage items
   */
  clearAll(): boolean {
    try {
      for (const [key] of this.storageConfigs) {
        localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Failed to clear all storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): {
    totalKeys: number;
    totalSize: number;
    keyStats: Array<{ key: string; size: number; lastModified: number }>;
  } {
    const keyStats: Array<{ key: string; size: number; lastModified: number }> =
      [];
    let totalSize = 0;

    for (const [key] of this.storageConfigs) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const size = new Blob([stored]).size;
        const metadata = this.getMetadata(key);

        keyStats.push({
          key,
          size,
          lastModified: metadata?.timestamp || 0,
        });

        totalSize += size;
      }
    }

    return {
      totalKeys: keyStats.length,
      totalSize,
      keyStats: keyStats.sort((a, b) => b.size - a.size),
    };
  }

  /**
   * Migrate data from one version to another
   */
  private migrateData(
    data: any,
    fromVersion: number,
    toVersion: number,
    migrations: Record<number, (data: any) => any>
  ): any {
    let migratedData = data;

    for (let version = fromVersion + 1; version <= toVersion; version++) {
      const migration = migrations[version];
      if (migration) {
        try {
          migratedData = migration(migratedData);
          console.log(
            `Migrated data from version ${version - 1} to ${version}`
          );
        } catch (error) {
          console.error(`Migration failed for version ${version}:`, error);
          throw error;
        }
      }
    }

    return migratedData;
  }

  /**
   * Generate a simple checksum for data integrity
   */
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }
}

// Singleton instance
export const storageManager = LocalStorageManager.getInstance();

// Storage keys constants
export const STORAGE_KEYS = {
  ENVIRONMENT_SETTINGS: 'environment-settings',
  THEME_SETTINGS: 'theme-settings',
  AUDIO_SETTINGS: 'audio-settings',
  VISUAL_SETTINGS: 'visual-settings',
  USER_PREFERENCES: 'user-preferences',
  CUSTOMIZATIONS: 'customizations',
} as const;

// Default configurations
export const STORAGE_CONFIGS: StorageConfig[] = [
  {
    key: STORAGE_KEYS.ENVIRONMENT_SETTINGS,
    version: 1,
    defaultValue: {
      currentEnvironment: null,
      unlockedEnvironments: ['classroom', 'office'],
      preloadedAssets: [],
    },
  },
  {
    key: STORAGE_KEYS.THEME_SETTINGS,
    version: 1,
    defaultValue: {
      currentTheme: null,
      unlockedThemes: ['default-light', 'default-dark'],
      purchasedThemes: ['default-light', 'default-dark'],
      themeHistory: [],
    },
  },
  {
    key: STORAGE_KEYS.AUDIO_SETTINGS,
    version: 1,
    defaultValue: {
      masterVolume: 0.7,
      ambientVolume: 0.5,
      musicVolume: 0.6,
      soundEffectsVolume: 0.8,
      currentPlaylist: undefined,
      autoPlay: true,
    },
  },
  {
    key: STORAGE_KEYS.VISUAL_SETTINGS,
    version: 1,
    defaultValue: {
      particlesEnabled: true,
      animationsEnabled: true,
      backgroundQuality: 'medium',
      reducedMotion: false,
    },
  },
  {
    key: STORAGE_KEYS.USER_PREFERENCES,
    version: 1,
    defaultValue: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        studyReminders: true,
        achievementUnlocks: true,
        petReminders: true,
      },
      studyReminders: true,
      pomodoroSettings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        soundEnabled: true,
      },
    },
  },
  {
    key: STORAGE_KEYS.CUSTOMIZATIONS,
    version: 1,
    defaultValue: {},
  },
];

// Initialize storage configurations
STORAGE_CONFIGS.forEach(config => {
  storageManager.registerConfig(config);
});
