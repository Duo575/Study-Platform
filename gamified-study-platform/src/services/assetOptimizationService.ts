// Asset optimization service for lazy loading and caching
export class AssetOptimizationService {
  private static instance: AssetOptimizationService;
  private imageCache = new Map<string, HTMLImageElement>();
  private audioCache = new Map<string, HTMLAudioElement>();
  private loadingPromises = new Map<string, Promise<any>>();
  private preloadQueue: string[] = [];
  private isPreloading = false;

  static getInstance(): AssetOptimizationService {
    if (!AssetOptimizationService.instance) {
      AssetOptimizationService.instance = new AssetOptimizationService();
    }
    return AssetOptimizationService.instance;
  }

  // Lazy load images with caching
  async loadImage(
    src: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // Create new loading promise
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.imageCache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Set loading priority
      if (priority === 'high') {
        img.loading = 'eager';
      } else {
        img.loading = 'lazy';
      }

      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Lazy load audio with caching
  async loadAudio(
    src: string,
    preload: 'auto' | 'metadata' | 'none' = 'metadata'
  ): Promise<HTMLAudioElement> {
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(src, audio);
        this.loadingPromises.delete(src);
        resolve(audio);
      });

      audio.addEventListener('error', () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load audio: ${src}`));
      });

      audio.preload = preload;
      audio.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Preload assets in background
  preloadAssets(
    assets: Array<{
      src: string;
      type: 'image' | 'audio';
      priority?: 'high' | 'medium' | 'low';
    }>
  ) {
    assets.forEach(asset => {
      if (!this.preloadQueue.includes(asset.src)) {
        this.preloadQueue.push(asset.src);
      }
    });

    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  private async processPreloadQueue() {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }

    this.isPreloading = true;
    const batchSize = 3; // Process 3 assets at a time to avoid overwhelming the browser

    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, batchSize);

      await Promise.allSettled(
        batch.map(async src => {
          try {
            if (src.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
              await this.loadImage(src, 'low');
            } else if (src.match(/\.(mp3|wav|ogg|m4a)$/i)) {
              await this.loadAudio(src, 'metadata');
            }
          } catch (error) {
            console.warn(`Failed to preload asset: ${src}`, error);
          }
        })
      );

      // Small delay between batches to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isPreloading = false;
  }

  // Get optimized image URL with format conversion
  getOptimizedImageUrl(
    src: string,
    options: {
      width?: number;
      height?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      quality?: number;
    } = {}
  ): string {
    // In a real implementation, this would integrate with an image optimization service
    // For now, we'll return the original URL with query parameters for future optimization
    const params = new URLSearchParams();

    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.format) params.set('f', options.format);
    if (options.quality) params.set('q', options.quality.toString());

    const queryString = params.toString();
    return queryString ? `${src}?${queryString}` : src;
  }

  // Progressive image loading with placeholder
  async loadProgressiveImage(
    src: string,
    placeholderSrc?: string
  ): Promise<{
    placeholder?: HTMLImageElement;
    fullImage: HTMLImageElement;
  }> {
    const result: {
      placeholder?: HTMLImageElement;
      fullImage: HTMLImageElement;
    } = {
      fullImage: null as any,
    };

    // Load placeholder first if provided
    if (placeholderSrc) {
      try {
        result.placeholder = await this.loadImage(placeholderSrc, 'high');
      } catch (error) {
        console.warn('Failed to load placeholder image:', error);
      }
    }

    // Load full image
    result.fullImage = await this.loadImage(src, 'medium');

    return result;
  }

  // Audio streaming for longer tracks
  createAudioStream(src: string): HTMLAudioElement {
    const audio = new Audio();
    audio.preload = 'none'; // Don't preload for streaming
    audio.src = src;

    // Enable streaming optimizations
    if ('mediaSession' in navigator) {
      audio.addEventListener('loadstart', () => {
        // Set media session metadata for better UX
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Study Music',
          artist: 'Focus Environment',
          artwork: [
            { src: '/icons/music-96.png', sizes: '96x96', type: 'image/png' },
            {
              src: '/icons/music-128.png',
              sizes: '128x128',
              type: 'image/png',
            },
          ],
        });
      });
    }

    return audio;
  }

  // Clear cache to free memory
  clearCache(type?: 'image' | 'audio') {
    if (!type || type === 'image') {
      this.imageCache.clear();
    }
    if (!type || type === 'audio') {
      this.audioCache.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      this.audioCache.clear();
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      images: {
        count: this.imageCache.size,
        urls: Array.from(this.imageCache.keys()),
      },
      audio: {
        count: this.audioCache.size,
        urls: Array.from(this.audioCache.keys()),
      },
      loading: {
        count: this.loadingPromises.size,
        urls: Array.from(this.loadingPromises.keys()),
      },
      preloadQueue: {
        count: this.preloadQueue.length,
        isProcessing: this.isPreloading,
      },
    };
  }

  // Intelligent preloading based on user behavior
  intelligentPreload(userPreferences: {
    favoriteEnvironments: string[];
    recentlyUsedThemes: string[];
    preferredMusicGenres: string[];
  }) {
    const assetsToPreload: Array<{
      src: string;
      type: 'image' | 'audio';
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Preload favorite environment assets
    userPreferences.favoriteEnvironments.forEach(envId => {
      assetsToPreload.push({
        src: `/environments/${envId}/background.jpg`,
        type: 'image',
        priority: 'high',
      });
      assetsToPreload.push({
        src: `/environments/${envId}/ambient.mp3`,
        type: 'audio',
        priority: 'medium',
      });
    });

    // Preload recent theme assets
    userPreferences.recentlyUsedThemes.forEach(themeId => {
      assetsToPreload.push({
        src: `/themes/${themeId}/preview.jpg`,
        type: 'image',
        priority: 'medium',
      });
    });

    // Preload preferred music
    userPreferences.preferredMusicGenres.forEach(genre => {
      assetsToPreload.push({
        src: `/music/${genre}/track1.mp3`,
        type: 'audio',
        priority: 'low',
      });
    });

    this.preloadAssets(assetsToPreload);
  }

  // Memory usage monitoring
  estimateMemoryUsage(): { images: number; audio: number; total: number } {
    let imageMemory = 0;
    let audioMemory = 0;

    // Estimate image memory usage (rough calculation)
    this.imageCache.forEach(img => {
      imageMemory += (img.width * img.height * 4) / 1024 / 1024; // 4 bytes per pixel, convert to MB
    });

    // Estimate audio memory usage (rough calculation)
    this.audioCache.forEach(audio => {
      if (audio.duration) {
        audioMemory += (audio.duration * 44100 * 2 * 2) / 1024 / 1024; // 44.1kHz, stereo, 16-bit, convert to MB
      }
    });

    return {
      images: Math.round(imageMemory * 100) / 100,
      audio: Math.round(audioMemory * 100) / 100,
      total: Math.round((imageMemory + audioMemory) * 100) / 100,
    };
  }
}

// Export singleton instance
export const assetOptimizer = AssetOptimizationService.getInstance();
