/**
 * Persistence Service for managing user preferences and settings
 * Integrates with Zustand stores to provide automatic persistence
 */

import { storageManager, STORAGE_KEYS } from '../utils/storage';
import type {
  Environment,
  Theme,
  AudioSettings,
  VisualSettings,
  UserPreferences,
  ThemeHistoryEntry,
  ThemeCustomization,
} from '../types';

export interface EnvironmentPersistenceData {
  currentEnvironment: Environment | null;
  unlockedEnvironments: string[];
  preloadedAssets: string[];
}

export interface ThemePersistenceData {
  currentTheme: Theme | null;
  unlockedThemes: string[];
  purchasedThemes: string[];
  themeHistory: ThemeHistoryEntry[];
}

export interface CustomizationPersistenceData {
  [themeId: string]: ThemeCustomization;
}

export class PersistenceService {
  private static instance: PersistenceService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  /**
   * Initialize the persistence service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Perform any initialization tasks
      console.log('Persistence service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize persistence service:', error);
      throw error;
    }
  }

  // Environment Settings Persistence
  saveEnvironmentSettings(data: EnvironmentPersistenceData): boolean {
    return storageManager.setItem(STORAGE_KEYS.ENVIRONMENT_SETTINGS, data);
  }

  loadEnvironmentSettings(): EnvironmentPersistenceData | null {
    return storageManager.getItem<EnvironmentPersistenceData>(
      STORAGE_KEYS.ENVIRONMENT_SETTINGS
    );
  }

  // Theme Settings Persistence
  saveThemeSettings(data: ThemePersistenceData): boolean {
    return storageManager.setItem(STORAGE_KEYS.THEME_SETTINGS, data);
  }

  loadThemeSettings(): ThemePersistenceData | null {
    return storageManager.getItem<ThemePersistenceData>(
      STORAGE_KEYS.THEME_SETTINGS
    );
  }

  // Audio Settings Persistence
  saveAudioSettings(settings: AudioSettings): boolean {
    return storageManager.setItem(STORAGE_KEYS.AUDIO_SETTINGS, settings);
  }

  loadAudioSettings(): AudioSettings | null {
    return storageManager.getItem<AudioSettings>(STORAGE_KEYS.AUDIO_SETTINGS);
  }

  // Visual Settings Persistence
  saveVisualSettings(settings: VisualSettings): boolean {
    return storageManager.setItem(STORAGE_KEYS.VISUAL_SETTINGS, settings);
  }

  loadVisualSettings(): VisualSettings | null {
    return storageManager.getItem<VisualSettings>(STORAGE_KEYS.VISUAL_SETTINGS);
  }

  // User Preferences Persistence
  saveUserPreferences(preferences: UserPreferences): boolean {
    return storageManager.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  loadUserPreferences(): UserPreferences | null {
    return storageManager.getItem<UserPreferences>(
      STORAGE_KEYS.USER_PREFERENCES
    );
  }

  // Customizations Persistence
  saveCustomizations(customizations: CustomizationPersistenceData): boolean {
    return storageManager.setItem(STORAGE_KEYS.CUSTOMIZATIONS, customizations);
  }

  loadCustomizations(): CustomizationPersistenceData | null {
    return storageManager.getItem<CustomizationPersistenceData>(
      STORAGE_KEYS.CUSTOMIZATIONS
    );
  }

  // Backup and Restore
  createBackup(): string {
    return storageManager.createBackup();
  }

  restoreFromBackup(backupData: string): boolean {
    return storageManager.restoreFromBackup(backupData);
  }

  // Storage Management
  clearAllData(): boolean {
    return storageManager.clearAll();
  }

  getStorageStats() {
    return storageManager.getStorageStats();
  }

  // Migration utilities
  async migrateFromLegacyStorage(): Promise<void> {
    try {
      // Check for legacy Zustand persist storage and migrate if needed
      const legacyEnvironmentStore = localStorage.getItem('environment-store');
      const legacyThemeStore = localStorage.getItem('theme-store');

      if (legacyEnvironmentStore) {
        try {
          const parsed = JSON.parse(legacyEnvironmentStore);
          if (parsed.state) {
            const environmentData: EnvironmentPersistenceData = {
              currentEnvironment: parsed.state.currentEnvironment,
              unlockedEnvironments: parsed.state.unlockedEnvironments || [],
              preloadedAssets: parsed.state.preloadedAssets || [],
            };

            this.saveEnvironmentSettings(environmentData);

            if (parsed.state.audioSettings) {
              this.saveAudioSettings(parsed.state.audioSettings);
            }

            if (parsed.state.visualSettings) {
              this.saveVisualSettings(parsed.state.visualSettings);
            }

            console.log('Migrated legacy environment store');
          }
        } catch (error) {
          console.error('Failed to migrate legacy environment store:', error);
        }
      }

      if (legacyThemeStore) {
        try {
          const parsed = JSON.parse(legacyThemeStore);
          if (parsed.state) {
            const themeData: ThemePersistenceData = {
              currentTheme: parsed.state.currentTheme,
              unlockedThemes: parsed.state.unlockedThemes || [],
              purchasedThemes: parsed.state.purchasedThemes || [],
              themeHistory: parsed.state.themeHistory || [],
            };

            this.saveThemeSettings(themeData);

            if (parsed.state.customizations) {
              this.saveCustomizations(parsed.state.customizations);
            }

            console.log('Migrated legacy theme store');
          }
        } catch (error) {
          console.error('Failed to migrate legacy theme store:', error);
        }
      }
    } catch (error) {
      console.error('Migration from legacy storage failed:', error);
    }
  }

  // Validation utilities
  validateEnvironmentData(data: any): data is EnvironmentPersistenceData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.unlockedEnvironments) &&
      Array.isArray(data.preloadedAssets)
    );
  }

  validateThemeData(data: any): data is ThemePersistenceData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.unlockedThemes) &&
      Array.isArray(data.purchasedThemes) &&
      Array.isArray(data.themeHistory)
    );
  }

  validateAudioSettings(data: any): data is AudioSettings {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.masterVolume === 'number' &&
      typeof data.ambientVolume === 'number' &&
      typeof data.musicVolume === 'number' &&
      typeof data.soundEffectsVolume === 'number' &&
      typeof data.autoPlay === 'boolean'
    );
  }

  validateVisualSettings(data: any): data is VisualSettings {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.particlesEnabled === 'boolean' &&
      typeof data.animationsEnabled === 'boolean' &&
      typeof data.reducedMotion === 'boolean'
    );
  }

  validateUserPreferences(data: any): data is UserPreferences {
    return (
      data &&
      typeof data === 'object' &&
      data.notifications &&
      typeof data.notifications === 'object' &&
      data.pomodoroSettings &&
      typeof data.pomodoroSettings === 'object'
    );
  }

  // Sync utilities for cross-tab synchronization
  setupStorageSync(): void {
    window.addEventListener('storage', event => {
      if (!event.key || !event.newValue) {
        return;
      }

      // Handle storage changes from other tabs
      switch (event.key) {
        case STORAGE_KEYS.ENVIRONMENT_SETTINGS:
          this.handleEnvironmentSettingsSync(event.newValue);
          break;
        case STORAGE_KEYS.THEME_SETTINGS:
          this.handleThemeSettingsSync(event.newValue);
          break;
        case STORAGE_KEYS.AUDIO_SETTINGS:
          this.handleAudioSettingsSync(event.newValue);
          break;
        case STORAGE_KEYS.VISUAL_SETTINGS:
          this.handleVisualSettingsSync(event.newValue);
          break;
        case STORAGE_KEYS.USER_PREFERENCES:
          this.handleUserPreferencesSync(event.newValue);
          break;
      }
    });
  }

  private handleEnvironmentSettingsSync(newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      if (this.validateEnvironmentData(data.data)) {
        // Emit custom event for stores to listen to
        window.dispatchEvent(
          new CustomEvent('environment-settings-sync', {
            detail: data.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync environment settings:', error);
    }
  }

  private handleThemeSettingsSync(newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      if (this.validateThemeData(data.data)) {
        window.dispatchEvent(
          new CustomEvent('theme-settings-sync', {
            detail: data.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync theme settings:', error);
    }
  }

  private handleAudioSettingsSync(newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      if (this.validateAudioSettings(data.data)) {
        window.dispatchEvent(
          new CustomEvent('audio-settings-sync', {
            detail: data.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync audio settings:', error);
    }
  }

  private handleVisualSettingsSync(newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      if (this.validateVisualSettings(data.data)) {
        window.dispatchEvent(
          new CustomEvent('visual-settings-sync', {
            detail: data.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync visual settings:', error);
    }
  }

  private handleUserPreferencesSync(newValue: string): void {
    try {
      const data = JSON.parse(newValue);
      if (this.validateUserPreferences(data.data)) {
        window.dispatchEvent(
          new CustomEvent('user-preferences-sync', {
            detail: data.data,
          })
        );
      }
    } catch (error) {
      console.error('Failed to sync user preferences:', error);
    }
  }
}

// Singleton instance
export const persistenceService = PersistenceService.getInstance();
