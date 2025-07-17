// Custom hook for offline functionality
import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '@/services/offlineService';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  syncStatus: {
    pendingActions: number;
    unsyncedSessions: number;
    unsyncedNotes: number;
    lastSync: number;
  };
  isSyncing: boolean;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    pendingActions: 0,
    unsyncedSessions: 0,
    unsyncedNotes: 0,
    lastSync: 0,
  });

  // Update online status
  const updateOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await offlineService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  }, []);

  // Handle sync completion
  const handleSyncComplete = useCallback(() => {
    setIsSyncing(false);
    updateSyncStatus();
  }, [updateSyncStatus]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.warn('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      await offlineService.syncOfflineData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
      updateSyncStatus();
    }
  }, [isOnline, updateSyncStatus]);

  // Save data with offline support
  const saveWithOfflineSupport = useCallback(async (
    data: any,
    saveFunction: (data: any) => Promise<any>,
    offlineSaveFunction: (data: any) => Promise<void>,
    syncEndpoint?: string
  ) => {
    try {
      if (isOnline) {
        // Try to save online first
        return await saveFunction(data);
      } else {
        // Save offline
        await offlineSaveFunction(data);
        
        // Queue for sync if endpoint provided
        if (syncEndpoint) {
          await offlineService.queueOfflineAction('save', data, syncEndpoint);
        }
        
        updateSyncStatus();
        return data;
      }
    } catch (error) {
      // If online save fails, fall back to offline
      if (isOnline) {
        console.warn('Online save failed, falling back to offline:', error);
        await offlineSaveFunction(data);
        
        if (syncEndpoint) {
          await offlineService.queueOfflineAction('save', data, syncEndpoint);
        }
        
        updateSyncStatus();
        return data;
      }
      throw error;
    }
  }, [isOnline, updateSyncStatus]);

  // Load data with offline support
  const loadWithOfflineSupport = useCallback(async <T>(
    loadFunction: () => Promise<T>,
    offlineLoadFunction: () => Promise<T>,
    cacheKey?: string
  ): Promise<T> => {
    try {
      if (isOnline) {
        // Try to load online first
        const data = await loadFunction();
        
        // Cache the data for offline use
        if (cacheKey) {
          await offlineService.cacheData(cacheKey, data);
        }
        
        return data;
      } else {
        // Load from offline storage
        return await offlineLoadFunction();
      }
    } catch (error) {
      // If online load fails, try offline
      if (isOnline && cacheKey) {
        console.warn('Online load failed, trying cached data:', error);
        const cachedData = await offlineService.getCachedData(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Try offline load as last resort
      try {
        return await offlineLoadFunction();
      } catch (offlineError) {
        console.error('Both online and offline load failed:', { error, offlineError });
        throw error;
      }
    }
  }, [isOnline]);

  useEffect(() => {
    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('offlineSyncComplete', handleSyncComplete);

    // Initial sync status update
    updateSyncStatus();

    // Auto-sync when coming online
    if (isOnline) {
      const timer = setTimeout(() => {
        triggerSync();
      }, 1000);

      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('offlineSyncComplete', handleSyncComplete);
    };
  }, [updateOnlineStatus, handleSyncComplete, updateSyncStatus, triggerSync, isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    syncStatus,
    isSyncing,
    triggerSync,
    saveWithOfflineSupport,
    loadWithOfflineSupport,
  };
}

// Hook for PWA installation
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    installPWA,
  };
}

// Hook for service worker management
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      setIsRegistered(true);

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const updateServiceWorker = useCallback(async () => {
    if (!registration) return;

    try {
      const newWorker = registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        setUpdateAvailable(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }, [registration]);

  const unregisterServiceWorker = useCallback(async () => {
    if (!registration) return;

    try {
      await registration.unregister();
      setIsRegistered(false);
      setRegistration(null);
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }, [registration]);

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
  };
}