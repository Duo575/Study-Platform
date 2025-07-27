import type { Environment } from '../types';

/**
 * Service for preloading and caching audio assets
 */
export class AudioPreloaderService {
  private preloadedAudio: Map<string, HTMLAudioElement> = new Map();
  private preloadPromises: Map<string, Promise<void>> = new Map();
  private maxCacheSize = 10; // Maximum number of audio files to keep in memory

  /**
   * Preload ambient sound for an environment
   */
  async preloadAmbientSound(
    environmentId: string,
    ambientTrack: string
  ): Promise<void> {
    const cacheKey = `ambient-${environmentId}`;

    if (this.preloadedAudio.has(cacheKey)) {
      return; // Already preloaded
    }

    if (this.preloadPromises.has(cacheKey)) {
      return this.preloadPromises.get(cacheKey); // Already preloading
    }

    const preloadPromise = this.loadAudioFile(
      `/audio/ambient/${ambientTrack}.mp3`,
      cacheKey,
      true // Loop for ambient sounds
    );

    this.preloadPromises.set(cacheKey, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.preloadPromises.delete(cacheKey);
    }
  }

  /**
   * Preload music tracks
   */
  async preloadMusicTracks(trackIds: string[]): Promise<void> {
    const preloadPromises = trackIds.map(trackId => {
      const cacheKey = `music-${trackId}`;

      if (
        this.preloadedAudio.has(cacheKey) ||
        this.preloadPromises.has(cacheKey)
      ) {
        return this.preloadPromises.get(cacheKey) || Promise.resolve();
      }

      const preloadPromise = this.loadAudioFile(
        `/audio/music/${trackId}.mp3`,
        cacheKey,
        false
      );

      this.preloadPromises.set(cacheKey, preloadPromise);
      return preloadPromise.finally(() => {
        this.preloadPromises.delete(cacheKey);
      });
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Preload sound effects for an environment
   */
  async preloadSoundEffects(
    soundEffects: Record<string, string>
  ): Promise<void> {
    const preloadPromises = Object.entries(soundEffects).map(
      ([effectId, url]) => {
        const cacheKey = `effect-${effectId}`;

        if (
          this.preloadedAudio.has(cacheKey) ||
          this.preloadPromises.has(cacheKey)
        ) {
          return this.preloadPromises.get(cacheKey) || Promise.resolve();
        }

        const preloadPromise = this.loadAudioFile(url, cacheKey, false);
        this.preloadPromises.set(cacheKey, preloadPromise);

        return preloadPromise.finally(() => {
          this.preloadPromises.delete(cacheKey);
        });
      }
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Preload all audio assets for an environment
   */
  async preloadEnvironmentAudio(environment: Environment): Promise<void> {
    const preloadPromises: Promise<void>[] = [];

    // Preload ambient sound
    if (environment.audio.ambientTrack) {
      preloadPromises.push(
        this.preloadAmbientSound(environment.id, environment.audio.ambientTrack)
      );
    }

    // Preload music tracks
    if (environment.audio.musicTracks.length > 0) {
      const trackIds = environment.audio.musicTracks.map(track => track.id);
      preloadPromises.push(this.preloadMusicTracks(trackIds));
    }

    // Preload sound effects
    if (Object.keys(environment.audio.soundEffects).length > 0) {
      preloadPromises.push(
        this.preloadSoundEffects(environment.audio.soundEffects)
      );
    }

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Load and cache an audio file
   */
  private async loadAudioFile(
    url: string,
    cacheKey: string,
    loop: boolean = false
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.loop = loop;

      const handleLoad = () => {
        // Manage cache size
        if (this.preloadedAudio.size >= this.maxCacheSize) {
          this.evictOldestAudio();
        }

        this.preloadedAudio.set(cacheKey, audio);
        cleanup();
        resolve();
      };

      const handleError = () => {
        cleanup();
        reject(new Error(`Failed to load audio: ${url}`));
      };

      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('canplaythrough', handleLoad);
      audio.addEventListener('error', handleError);
      audio.src = url;
    });
  }

  /**
   * Get preloaded audio element
   */
  getPreloadedAudio(cacheKey: string): HTMLAudioElement | null {
    return this.preloadedAudio.get(cacheKey) || null;
  }

  /**
   * Get preloaded ambient sound for environment
   */
  getPreloadedAmbientSound(environmentId: string): HTMLAudioElement | null {
    return this.getPreloadedAudio(`ambient-${environmentId}`);
  }

  /**
   * Get preloaded music track
   */
  getPreloadedMusicTrack(trackId: string): HTMLAudioElement | null {
    return this.getPreloadedAudio(`music-${trackId}`);
  }

  /**
   * Get preloaded sound effect
   */
  getPreloadedSoundEffect(effectId: string): HTMLAudioElement | null {
    return this.getPreloadedAudio(`effect-${effectId}`);
  }

  /**
   * Check if audio is preloaded
   */
  isPreloaded(cacheKey: string): boolean {
    return this.preloadedAudio.has(cacheKey);
  }

  /**
   * Remove audio from cache
   */
  removeFromCache(cacheKey: string): void {
    const audio = this.preloadedAudio.get(cacheKey);
    if (audio) {
      audio.pause();
      audio.src = '';
      this.preloadedAudio.delete(cacheKey);
    }
  }

  /**
   * Evict oldest audio from cache
   */
  private evictOldestAudio(): void {
    const firstKey = this.preloadedAudio.keys().next().value;
    if (firstKey) {
      this.removeFromCache(firstKey);
    }
  }

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    for (const [key] of this.preloadedAudio) {
      this.removeFromCache(key);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    keys: string[];
  } {
    return {
      size: this.preloadedAudio.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.preloadedAudio.keys()),
    };
  }

  /**
   * Set maximum cache size
   */
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = Math.max(1, size);

    // Evict excess items if needed
    while (this.preloadedAudio.size > this.maxCacheSize) {
      this.evictOldestAudio();
    }
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearCache();
    this.preloadPromises.clear();
  }
}

// Create and export singleton instance
export const audioPreloader = new AudioPreloaderService();
