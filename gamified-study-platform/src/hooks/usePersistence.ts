/**
 * React hooks for integrating persistence with Zustand stores
 */

import { useEffect, useCallback } from 'react';
import { persistenceService } from '../services/persistenceService';
import { useEnvironmentStore } from '../store/environmentStore';
import { useThemeStore } from '../store/themeStore';
import type { AudioSettings, VisualSettings, UserPreferences } from '../types';

/**
 * Hook to initialize persistence and handle cross-tab synchronization
 */
export function usePersistenceInit() {
  useEffect(() => {
    const initializePersistence = async () => {
      try {
        await persistenceService.initialize();
        await persistenceService.migrateFromLegacyStorage();
        persistenceService.setupStorageSync();
        console.log('Persistence initialized successfully');
      } catch (error) {
        console.error('Failed to initialize persistence:', error);
      }
    };

    initializePersistence();
  }, []);
}

/**
 * Hook for environment settings persistence
 */
export function useEnvironmentPersistence() {
  const environmentStore = useEnvironmentStore();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const environmentData = persistenceService.loadEnvironmentSettings();
      const audioSettings = persistenceService.loadAudioSettings();
      const visualSettings = persistenceService.loadVisualSettings();

      if (environmentData) {
        if (environmentData.currentEnvironment) {
          environmentStore.setCurrentEnvironment(
            environmentData.currentEnvironment
          );
        }

        // Update unlocked environments
        environmentData.unlockedEnvironments.forEach(envId => {
          environmentStore.addUnlockedEnvironment(envId);
        });
      }

      if (audioSettings) {
        environmentStore.updateAudioSettings(audioSettings);
      }

      if (visualSettings) {
        environmentStore.updateVisualSettings(visualSettings);
      }
    };

    loadSettings();
  }, [environmentStore]);

  // Save settings when they change
  const saveEnvironmentSettings = useCallback(() => {
    const state = environmentStore;
    const environmentData = {
      currentEnvironment: state.currentEnvironment,
      unlockedEnvironments: state.unlockedEnvironments,
      preloadedAssets: state.preloadedAssets,
    };

    persistenceService.saveEnvironmentSettings(environmentData);
    persistenceService.saveAudioSettings(state.audioSettings);
    persistenceService.saveVisualSettings(state.visualSettings);
  }, [environmentStore]);

  // Listen for cross-tab synchronization
  useEffect(() => {
    const handleEnvironmentSync = (event: CustomEvent) => {
      const data = event.detail;
      if (data.currentEnvironment) {
        environmentStore.setCurrentEnvironment(data.currentEnvironment);
      }
    };

    const handleAudioSync = (event: CustomEvent) => {
      const settings: AudioSettings = event.detail;
      environmentStore.updateAudioSettings(settings);
    };

    const handleVisualSync = (event: CustomEvent) => {
      const settings: VisualSettings = event.detail;
      environmentStore.updateVisualSettings(settings);
    };

    window.addEventListener(
      'environment-settings-sync',
      handleEnvironmentSync as EventListener
    );
    window.addEventListener(
      'audio-settings-sync',
      handleAudioSync as EventListener
    );
    window.addEventListener(
      'visual-settings-sync',
      handleVisualSync as EventListener
    );

    return () => {
      window.removeEventListener(
        'environment-settings-sync',
        handleEnvironmentSync as EventListener
      );
      window.removeEventListener(
        'audio-settings-sync',
        handleAudioSync as EventListener
      );
      window.removeEventListener(
        'visual-settings-sync',
        handleVisualSync as EventListener
      );
    };
  }, [environmentStore]);

  return {
    saveEnvironmentSettings,
  };
}

/**
 * Hook for theme settings persistence
 */
export function useThemePersistence() {
  const themeStore = useThemeStore();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const themeData = persistenceService.loadThemeSettings();
      const customizations = persistenceService.loadCustomizations();

      if (themeData) {
        if (themeData.currentTheme) {
          themeStore.setCurrentTheme(themeData.currentTheme);
        }

        // Update unlocked and purchased themes
        themeData.unlockedThemes.forEach(themeId => {
          themeStore.addUnlockedTheme(themeId);
        });

        themeData.purchasedThemes.forEach(themeId => {
          themeStore.addPurchasedTheme(themeId);
        });
      }

      if (customizations) {
        // Apply customizations to the store
        Object.entries(customizations).forEach(([themeId, customization]) => {
          themeStore.customizeTheme(themeId, customization.customizations);
        });
      }
    };

    loadSettings();
  }, [themeStore]);

  // Save settings when they change
  const saveThemeSettings = useCallback(() => {
    const state = themeStore;
    const themeData = {
      currentTheme: state.currentTheme,
      unlockedThemes: state.unlockedThemes,
      purchasedThemes: state.purchasedThemes,
      themeHistory: state.themeHistory,
    };

    persistenceService.saveThemeSettings(themeData);
    persistenceService.saveCustomizations(state.customizations);
  }, [themeStore]);

  // Listen for cross-tab synchronization
  useEffect(() => {
    const handleThemeSync = (event: CustomEvent) => {
      const data = event.detail;
      if (data.currentTheme) {
        themeStore.setCurrentTheme(data.currentTheme);
      }
    };

    window.addEventListener(
      'theme-settings-sync',
      handleThemeSync as EventListener
    );

    return () => {
      window.removeEventListener(
        'theme-settings-sync',
        handleThemeSync as EventListener
      );
    };
  }, [themeStore]);

  return {
    saveThemeSettings,
  };
}

/**
 * Hook for user preferences persistence
 */
export function useUserPreferencesPersistence() {
  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      const preferences = persistenceService.loadUserPreferences();
      if (preferences) {
        // Apply preferences to relevant stores or contexts
        console.log('Loaded user preferences:', preferences);

        // You can dispatch these to relevant stores or contexts
        // For example, if you have a user preferences store:
        // userPreferencesStore.setPreferences(preferences);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences
  const saveUserPreferences = useCallback((preferences: UserPreferences) => {
    persistenceService.saveUserPreferences(preferences);
  }, []);

  // Listen for cross-tab synchronization
  useEffect(() => {
    const handlePreferencesSync = (event: CustomEvent) => {
      const preferences: UserPreferences = event.detail;
      console.log('Synced user preferences from another tab:', preferences);
      // Apply synced preferences
    };

    window.addEventListener(
      'user-preferences-sync',
      handlePreferencesSync as EventListener
    );

    return () => {
      window.removeEventListener(
        'user-preferences-sync',
        handlePreferencesSync as EventListener
      );
    };
  }, []);

  return {
    saveUserPreferences,
  };
}

/**
 * Hook for backup and restore functionality
 */
export function useBackupRestore() {
  const createBackup = useCallback(() => {
    try {
      const backupData = persistenceService.createBackup();

      // Create downloadable backup file
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-platform-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return backupData;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }, []);

  const restoreFromBackup = useCallback((backupData: string) => {
    try {
      const success = persistenceService.restoreFromBackup(backupData);
      if (success) {
        // Reload the page to apply restored settings
        window.location.reload();
      }
      return success;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }, []);

  const restoreFromFile = useCallback(
    (file: File) => {
      return new Promise<boolean>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const backupData = event.target?.result as string;
            const success = restoreFromBackup(backupData);
            resolve(success);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read backup file'));
        reader.readAsText(file);
      });
    },
    [restoreFromBackup]
  );

  const clearAllData = useCallback(() => {
    try {
      const success = persistenceService.clearAllData();
      if (success) {
        // Reload the page to reset to defaults
        window.location.reload();
      }
      return success;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }, []);

  const getStorageStats = useCallback(() => {
    return persistenceService.getStorageStats();
  }, []);

  return {
    createBackup,
    restoreFromBackup,
    restoreFromFile,
    clearAllData,
    getStorageStats,
  };
}

/**
 * Hook to automatically save settings when stores change
 */
export function useAutoSave() {
  const { saveEnvironmentSettings } = useEnvironmentPersistence();
  const { saveThemeSettings } = useThemePersistence();

  const environmentStore = useEnvironmentStore();
  const themeStore = useThemeStore();

  // Auto-save environment settings
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveEnvironmentSettings();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [
    environmentStore.currentEnvironment,
    environmentStore.unlockedEnvironments,
    environmentStore.audioSettings,
    environmentStore.visualSettings,
    saveEnvironmentSettings,
  ]);

  // Auto-save theme settings
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveThemeSettings();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [
    themeStore.currentTheme,
    themeStore.unlockedThemes,
    themeStore.purchasedThemes,
    themeStore.customizations,
    saveThemeSettings,
  ]);
}
