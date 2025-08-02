/**
 * Asset Cache Service for managing Service Worker and progressive asset loading
 */

export interface CacheStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  caches: Record<string, { count: number; urls: string[] }>;
}

export interface PreloadProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentAsset?: string;
}

export class AssetCacheService {
  private static instance: AssetCacheService;
  private serviceWorker: ServiceWorker | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;
  private listeners: Set<(status: CacheStatus) => void> = new Set();
  private preloadListeners: Set<(progress: PreloadProgress) => void> =
    new Set();

  private constructor() {
    this.setupMessageListener();
  }

  static getInstance(): AssetCacheService {
    if (!AssetCacheService.instance) {
      AssetCacheService.instance = new AssetCacheService();
    }
    return AssetCacheService.instance;
  }

  /**
   * Initialize the service worker
   */
  async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully');

      // Wait for service worker to be active
      if (this.registration.active) {
        this.serviceWorker = this.registration.active;
      } else {
        await new Promise<void>(resolve => {
          const checkState = () => {
            if (this.registration?.active) {
              this.serviceWorker = this.registration.active;
              resolve();
            } else {
              setTimeout(checkState, 100);
            }
          };
          checkState();
        });
      }

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
        this.handleServiceWorkerUpdate();
      });

      this.notifyStatusChange();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Add cache status listener
   */
  addStatusListener(listener: (status: CacheStatus) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove cache status listener
   */
  removeStatusListener(listener: (status: CacheStatus) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Add preload progress listener
   */
  addPreloadListener(listener: (progress: PreloadProgress) => void): void {
    this.preloadListeners.add(listener);
  }

  /**
   * Remove preload progress listener
   */
  removePreloadListener(listener: (progress: PreloadProgress) => void): void {
    this.preloadListeners.delete(listener);
  }

  /**
   * Get current cache status
   */
  async getCacheStatus(): Promise<CacheStatus> {
    if (!this.isSupported || !this.serviceWorker) {
      return {
        isSupported: this.isSupported,
        isRegistered: false,
        isActive: false,
        caches: {},
      };
    }

    return new Promise(resolve => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_STATUS_RESPONSE') {
          navigator.serviceWorker.removeEventListener(
            'message',
            messageHandler
          );

          if (event.data.data.success) {
            resolve({
              isSupported: this.isSupported,
              isRegistered: true,
              isActive: true,
              caches: event.data.data.cacheStatus,
            });
          } else {
            resolve({
              isSupported: this.isSupported,
              isRegistered: true,
              isActive: false,
              caches: {},
            });
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      this.serviceWorker!.postMessage({ type: 'GET_CACHE_STATUS' });

      // Timeout after 5 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve({
          isSupported: this.isSupported,
          isRegistered: true,
          isActive: false,
          caches: {},
        });
      }, 5000);
    });
  }

  /**
   * Cache audio files
   */
  async cacheAudioFiles(urls: string[]): Promise<boolean> {
    if (!this.serviceWorker) {
      console.warn('Service Worker not available for audio caching');
      return false;
    }

    return new Promise(resolve => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_AUDIO_COMPLETE') {
          navigator.serviceWorker.removeEventListener(
            'message',
            messageHandler
          );
          resolve(event.data.data.success);
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      if (this.serviceWorker) {
        this.serviceWorker.postMessage({
          type: 'CACHE_AUDIO',
          data: { urls },
        });
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(false);
      }, 30000);
    });
  }

  /**
   * Cache environment assets
   */
  async cacheEnvironmentAssets(urls: string[]): Promise<boolean> {
    if (!this.serviceWorker) {
      console.warn('Service Worker not available for environment caching');
      return false;
    }

    return new Promise(resolve => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_ENVIRONMENT_COMPLETE') {
          navigator.serviceWorker.removeEventListener(
            'message',
            messageHandler
          );
          resolve(event.data.data.success);
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      if (this.serviceWorker) {
        this.serviceWorker.postMessage({
          type: 'CACHE_ENVIRONMENT',
          data: { urls },
        });
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(false);
      }, 30000);
    });
  }

  /**
   * Preload assets based on user preferences and usage patterns
   */
  async preloadAssets(urls: string[]): Promise<boolean> {
    if (!this.serviceWorker) {
      console.warn('Service Worker not available for asset preloading');
      return false;
    }

    // Notify preload start
    this.notifyPreloadProgress({
      total: urls.length,
      loaded: 0,
      percentage: 0,
    });

    return new Promise(resolve => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'PRELOAD_ASSETS_COMPLETE') {
          navigator.serviceWorker.removeEventListener(
            'message',
            messageHandler
          );

          // Notify preload complete
          this.notifyPreloadProgress({
            total: urls.length,
            loaded: urls.length,
            percentage: 100,
          });

          resolve(event.data.data.success);
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      if (this.serviceWorker) {
        this.serviceWorker.postMessage({
          type: 'PRELOAD_ASSETS',
          data: { urls },
        });
      }

      // Timeout after 60 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(false);
      }, 60000);
    });
  }

  /**
   * Preload assets based on environment preferences
   */
  async preloadEnvironmentAssets(environmentId: string): Promise<boolean> {
    const environmentAssets = this.getEnvironmentAssets(environmentId);

    if (environmentAssets.length === 0) {
      return true;
    }

    console.log(`Preloading assets for environment: ${environmentId}`);
    return await this.preloadAssets(environmentAssets);
  }

  /**
   * Preload assets based on user usage patterns
   */
  async preloadBasedOnUsage(usageData: {
    frequentEnvironments: string[];
    recentlyUsedThemes: string[];
    preferredAudioTracks: string[];
  }): Promise<void> {
    const assetsToPreload: string[] = [];

    // Add frequently used environment assets
    usageData.frequentEnvironments.forEach(envId => {
      assetsToPreload.push(...this.getEnvironmentAssets(envId));
    });

    // Add recently used theme assets
    usageData.recentlyUsedThemes.forEach(themeId => {
      assetsToPreload.push(...this.getThemeAssets(themeId));
    });

    // Add preferred audio tracks
    assetsToPreload.push(...usageData.preferredAudioTracks);

    // Remove duplicates
    const uniqueAssets = [...new Set(assetsToPreload)];

    if (uniqueAssets.length > 0) {
      console.log(
        `Preloading ${uniqueAssets.length} assets based on usage patterns`
      );
      await this.preloadAssets(uniqueAssets);
    }
  }

  /**
   * Clear specific cache
   */
  async clearCache(cacheName?: string): Promise<boolean> {
    if (!this.serviceWorker) {
      console.warn('Service Worker not available for cache clearing');
      return false;
    }

    return new Promise(resolve => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'CLEAR_CACHE_COMPLETE') {
          navigator.serviceWorker.removeEventListener(
            'message',
            messageHandler
          );
          resolve(event.data.data.success);
          this.notifyStatusChange();
        }
      };

      navigator.serviceWorker.addEventListener('message', messageHandler);
      if (this.serviceWorker) {
        this.serviceWorker.postMessage({
          type: 'CLEAR_CACHE',
          data: { cacheName },
        });
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
        resolve(false);
      }, 10000);
    });
  }

  /**
   * Get cache size estimation
   */
  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  /**
   * Check if asset is cached
   */
  async isAssetCached(url: string): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(url);
        if (response) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to check if asset is cached:', error);
      return false;
    }
  }

  /**
   * Progressive loading with loading indicators
   */
  async loadAssetWithProgress(
    url: string,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<Response> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // If no progress callback or no content-length, return response directly
      const contentLength = response.headers.get('content-length');
      if (!onProgress || !contentLength) {
        return response;
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body?.getReader();
      if (!reader) {
        return response;
      }

      const stream = new ReadableStream({
        start(controller) {
          function pump(): Promise<void> {
            return reader!.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }

              loaded += value.length;
              if (onProgress) {
                onProgress(loaded, total);
              }
              controller.enqueue(value);
              return pump();
            });
          }
          return pump();
        },
      });

      return new Response(stream, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error('Failed to load asset with progress:', error);
      throw error;
    }
  }

  /**
   * Get environment-specific assets
   */
  private getEnvironmentAssets(environmentId: string): string[] {
    const assetMap: Record<string, string[]> = {
      classroom: [
        '/environments/classroom-bg.jpg',
        '/sounds/page-turn.mp3',
        '/sounds/pencil-write.mp3',
      ],
      office: [
        '/environments/office-bg.jpg',
        '/sounds/keyboard-type.mp3',
        '/sounds/mouse-click.mp3',
      ],
      cafe: [
        '/environments/cafe-bg.jpg',
        '/sounds/coffee-pour.mp3',
        '/sounds/cafe-chatter.mp3',
      ],
      forest: [
        '/environments/forest-bg.jpg',
        '/sounds/birds-chirp.mp3',
        '/sounds/wind-leaves.mp3',
      ],
    };

    return assetMap[environmentId] || [];
  }

  /**
   * Get theme-specific assets
   */
  private getThemeAssets(themeId: string): string[] {
    const assetMap: Record<string, string[]> = {
      'forest-green': ['/themes/forest-green-preview.jpg'],
      'ocean-blue': ['/themes/ocean-blue-preview.jpg'],
      'sunset-gradient': ['/themes/sunset-gradient-preview.jpg'],
      'cherry-blossom': ['/themes/cherry-blossom-preview.jpg'],
    };

    return assetMap[themeId] || [];
  }

  /**
   * Setup message listener for service worker communication
   */
  private setupMessageListener(): void {
    if (!this.isSupported) return;

    navigator.serviceWorker.addEventListener('message', event => {
      const { type, data } = event.data;

      switch (type) {
        case 'CACHE_STATUS_RESPONSE':
        case 'CACHE_AUDIO_COMPLETE':
        case 'CACHE_ENVIRONMENT_COMPLETE':
        case 'CLEAR_CACHE_COMPLETE':
          // These are handled by specific promise handlers
          break;

        case 'PRELOAD_PROGRESS':
          this.notifyPreloadProgress(data);
          break;

        default:
          console.log('Unknown service worker message:', type);
      }
    });
  }

  /**
   * Handle service worker updates
   */
  private handleServiceWorkerUpdate(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller
      ) {
        // New service worker is available
        console.log('New service worker available');

        // Optionally show update notification to user
        this.notifyServiceWorkerUpdate();
      }
    });
  }

  /**
   * Notify service worker update
   */
  private notifyServiceWorkerUpdate(): void {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  /**
   * Notify status change
   */
  private async notifyStatusChange(): Promise<void> {
    const status = await this.getCacheStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in cache status listener:', error);
      }
    });
  }

  /**
   * Notify preload progress
   */
  private notifyPreloadProgress(progress: PreloadProgress): void {
    this.preloadListeners.forEach(listener => {
      try {
        listener(progress);
      } catch (error) {
        console.error('Error in preload progress listener:', error);
      }
    });
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service worker update triggered');
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.listeners.clear();
    this.preloadListeners.clear();
  }
}

// Singleton instance
export const assetCacheService = AssetCacheService.getInstance();
