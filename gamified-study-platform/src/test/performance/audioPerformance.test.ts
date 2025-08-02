import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManagerService } from '../../services/audioService';
import { audioPreloader } from '../../services/audioPreloader';
import type { MusicTrack, AudioSettings } from '../../types';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  AMBIENT_LOAD: 100,
  MUSIC_LOAD: 200,
  CONCURRENT_LOAD: 500,
  TRACK_SWITCH: 100,
  CROSSFADE: 1200,
  VOLUME_CHANGE: 10,
  SETTINGS_UPDATE: 5,
  DISPOSAL: 50,
  INITIALIZATION: 50,
  GAIN_OPERATIONS: 50,
  ERROR_HANDLING: 100,
  CONCURRENT_OPERATIONS: 200,
  RAPID_CHANGES: 100,
  AVERAGE_LOAD: 150,
  MAX_SINGLE_LOAD: 300,
} as const;

// Mock Web Audio API and HTML Audio
const mockAudioContext = {
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  close: vi.fn(),
  state: 'running',
};

const mockAudioElement = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  volume: 1,
  currentTime: 0,
  duration: 180,
  loop: false,
  preload: 'auto',
  paused: false,
  ended: false,
  error: null,
  readyState: 4, // HAVE_ENOUGH_DATA
};

global.Audio = vi.fn(() => ({ ...mockAudioElement })) as any;
(global as any).window = {
  AudioContext: vi.fn(() => mockAudioContext),
  webkitAudioContext: vi.fn(() => mockAudioContext),
  performance: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
};

// Mock audio preloader
vi.mock('../../services/audioPreloader', () => ({
  audioPreloader: {
    preloadAmbientSound: vi.fn().mockResolvedValue(undefined),
    preloadMusic: vi.fn().mockResolvedValue(undefined),
    preloadSoundEffect: vi.fn().mockResolvedValue(undefined),
    getCacheStatus: vi.fn().mockReturnValue({ cached: true, size: 1024 }),
    clearCache: vi.fn(),
  },
}));

describe('Audio Performance Tests', () => {
  let audioService: AudioManagerService;
  let performanceEntries: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    performanceEntries = [];

    // Mock performance API
    (global.window.performance.mark as any).mockImplementation(
      (name: string) => {
        performanceEntries.push({
          name,
          entryType: 'mark',
          startTime: Date.now(),
        });
      }
    );

    (global.window.performance.measure as any).mockImplementation(
      (name: string, start: string, end: string) => {
        const startEntry = performanceEntries.find(e => e.name === start);
        const endEntry = performanceEntries.find(e => e.name === end);
        const duration = endEntry
          ? endEntry.startTime - (startEntry?.startTime || 0)
          : 0;
        performanceEntries.push({ name, entryType: 'measure', duration });
      }
    );

    audioService = new AudioManagerService();
  });

  afterEach(() => {
    audioService.dispose();
    vi.clearAllMocks();
  });

  describe('Audio Loading Performance', () => {
    it('should load ambient sounds within performance threshold', async () => {
      const startTime = performance.now();

      audioService.playAmbientSound('forest-ambient');

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load ambient sound quickly
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.AMBIENT_LOAD);
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should load music tracks within performance threshold', async () => {
      const startTime = performance.now();

      await audioService.playMusic('lofi-track-1');

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load music track quickly
      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MUSIC_LOAD);
      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should handle multiple concurrent audio loads efficiently', async () => {
      const startTime = performance.now();

      // Load multiple audio sources concurrently
      const promises = [
        audioService.playMusic('track-1'),
        audioService.playSoundEffect('click'),
        audioService.playSoundEffect('notification'),
      ];

      audioService.playAmbientSound('cafe-ambient');

      await Promise.all(promises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle concurrent loads efficiently
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CONCURRENT_LOAD);
    });

    it('should preload audio assets efficiently', async () => {
      const tracks: MusicTrack[] = Array.from({ length: 10 }, (_, i) => ({
        id: `track-${i}`,
        title: `Track ${i}`,
        artist: `Artist ${i}`,
        duration: 180,
        url: `/music/track-${i}.mp3`,
        genre: 'lofi',
        mood: 'focused',
      }));

      const startTime = performance.now();

      // Simulate preloading multiple tracks
      for (const track of tracks) {
        audioService.addToPlaylist(track);
      }

      const endTime = performance.now();
      const preloadTime = endTime - startTime;

      // Should preload playlist efficiently (< 50ms for metadata)
      expect(preloadTime).toBeLessThan(50);
      expect(audioService.getPlaylist()).toHaveLength(10);
    });
  });

  describe('Audio Playback Performance', () => {
    it('should switch between tracks quickly', async () => {
      // Setup initial track
      await audioService.playMusic('track-1');

      const startTime = performance.now();

      // Switch to new track
      await audioService.playMusic('track-2');

      const endTime = performance.now();
      const switchTime = endTime - startTime;

      // Should switch tracks quickly (< 100ms)
      expect(switchTime).toBeLessThan(100);
      expect(audioService.getCurrentTrack()?.id).toBe('track-2');
    });

    it('should perform crossfade efficiently', async () => {
      // Setup initial track
      await audioService.playMusic('track-1');

      const startTime = performance.now();

      // Perform crossfade
      await audioService.crossfade('track-1', 'track-2', 1000);

      const endTime = performance.now();
      const crossfadeTime = endTime - startTime;

      // Crossfade should complete within expected time (< 1200ms including overhead)
      expect(crossfadeTime).toBeLessThan(1200);
      expect(audioService.getCurrentTrack()?.id).toBe('track-2');
    });

    it('should handle volume changes without audio glitches', () => {
      audioService.playAmbientSound('forest-ambient');

      const startTime = performance.now();

      // Perform rapid volume changes
      for (let i = 0; i <= 10; i++) {
        audioService.setMasterVolume(i / 10);
      }

      const endTime = performance.now();
      const volumeChangeTime = endTime - startTime;

      // Volume changes should be instantaneous (< 10ms)
      expect(volumeChangeTime).toBeLessThan(10);
      expect(audioService.getSettings().masterVolume).toBe(1.0);
    });

    it('should maintain stable playback during settings updates', () => {
      audioService.playAmbientSound('forest-ambient');

      const startTime = performance.now();

      // Update multiple settings rapidly
      const newSettings: Partial<AudioSettings> = {
        masterVolume: 0.8,
        ambientVolume: 0.4,
        musicVolume: 0.7,
        soundEffectsVolume: 0.9,
      };

      audioService.updateSettings(newSettings);

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Settings update should be fast (< 5ms)
      expect(updateTime).toBeLessThan(5);
      expect(audioService.getSettings()).toMatchObject(newSettings);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should manage audio element lifecycle efficiently', () => {
      const initialAudioCount = (global.Audio as any).mock.calls.length;

      // Play multiple sound effects
      for (let i = 0; i < 10; i++) {
        audioService.playSoundEffect(`effect-${i}`);
      }

      const finalAudioCount = (global.Audio as any).mock.calls.length;

      // Should create audio elements for sound effects but not accumulate indefinitely
      expect(finalAudioCount - initialAudioCount).toBe(10);
    });

    it('should dispose of resources properly', () => {
      audioService.playAmbientSound('forest-ambient');
      audioService.playMusic('track-1');

      const startTime = performance.now();

      audioService.dispose();

      const endTime = performance.now();
      const disposeTime = endTime - startTime;

      // Disposal should be quick (< 50ms)
      expect(disposeTime).toBeLessThan(50);
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('should handle playlist management efficiently with large playlists', () => {
      const largePlaylist: MusicTrack[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `track-${i}`,
          title: `Track ${i}`,
          artist: `Artist ${i}`,
          duration: 180 + (i % 120), // Vary duration
          url: `/music/track-${i}.mp3`,
          genre: i % 2 === 0 ? 'lofi' : 'ambient',
          mood: i % 3 === 0 ? 'focused' : 'relaxing',
        })
      );

      const startTime = performance.now();

      audioService.setPlaylist(largePlaylist);

      const endTime = performance.now();
      const setPlaylistTime = endTime - startTime;

      // Should handle large playlist efficiently (< 100ms)
      expect(setPlaylistTime).toBeLessThan(100);
      expect(audioService.getPlaylist()).toHaveLength(1000);

      // Test playlist operations
      const operationStartTime = performance.now();

      audioService.addToPlaylist({
        id: 'new-track',
        title: 'New Track',
        artist: 'New Artist',
        duration: 200,
        url: '/music/new-track.mp3',
        genre: 'classical',
        mood: 'calm',
      });

      audioService.removeFromPlaylist('track-500');

      const operationEndTime = performance.now();
      const operationTime = operationEndTime - operationStartTime;

      // Playlist operations should be fast even with large playlists (< 10ms)
      expect(operationTime).toBeLessThan(10);
      expect(audioService.getPlaylist()).toHaveLength(1000); // 1001 - 1
    });
  });

  describe('Audio Context Performance', () => {
    it('should initialize audio context efficiently', () => {
      const startTime = performance.now();

      const newAudioService = new AudioManagerService();

      const endTime = performance.now();
      const initTime = endTime - startTime;

      // Audio service initialization should be fast (< 50ms)
      expect(initTime).toBeLessThan(50);
      expect(global.window.AudioContext).toHaveBeenCalled();

      newAudioService.dispose();
    });

    it('should handle gain node operations efficiently', () => {
      const startTime = performance.now();

      // Perform multiple gain operations
      for (let i = 0; i < 100; i++) {
        audioService.setMasterVolume(Math.random());
        audioService.setAmbientVolume(Math.random());
        audioService.setMusicVolume(Math.random());
      }

      const endTime = performance.now();
      const gainOperationTime = endTime - startTime;

      // Gain operations should be efficient (< 50ms for 300 operations)
      expect(gainOperationTime).toBeLessThan(50);
    });

    it('should handle audio context state changes efficiently', () => {
      const startTime = performance.now();

      // Simulate audio context state changes
      mockAudioContext.state = 'suspended';
      audioService.playAmbientSound('test');

      mockAudioContext.state = 'running';
      audioService.playMusic('test-track');

      const endTime = performance.now();
      const stateChangeTime = endTime - startTime;

      // State changes should be handled quickly (< 20ms)
      expect(stateChangeTime).toBeLessThan(20);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle audio loading errors efficiently', async () => {
      // Mock audio loading error
      mockAudioElement.play.mockRejectedValue(new Error('Audio load failed'));

      const startTime = performance.now();

      try {
        await audioService.playMusic('invalid-track');
      } catch (error) {
        // Expected to throw
      }

      const endTime = performance.now();
      const errorHandlingTime = endTime - startTime;

      // Error handling should be fast (< 100ms)
      expect(errorHandlingTime).toBeLessThan(100);
    });

    it('should recover from audio context errors efficiently', () => {
      // Mock audio context error
      mockAudioContext.createGain.mockImplementation(() => {
        throw new Error('Gain node creation failed');
      });

      const startTime = performance.now();

      // Should handle error gracefully
      audioService.setMasterVolume(0.5);

      const endTime = performance.now();
      const recoveryTime = endTime - startTime;

      // Error recovery should be fast (< 10ms)
      expect(recoveryTime).toBeLessThan(10);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle multiple simultaneous audio operations', async () => {
      const startTime = performance.now();

      // Perform multiple operations concurrently
      const operations = [
        audioService.playAmbientSound('forest-ambient'),
        audioService.playMusic('track-1'),
        audioService.playSoundEffect('click'),
        audioService.setMasterVolume(0.8),
        audioService.setAmbientVolume(0.6),
        audioService.updateSettings({ musicVolume: 0.7 }),
      ];

      // Wait for async operations
      await Promise.allSettled([
        operations[1], // playMusic is async
        operations[2], // playSoundEffect is async
      ]);

      const endTime = performance.now();
      const concurrentTime = endTime - startTime;

      // Concurrent operations should complete quickly (< 200ms)
      expect(concurrentTime).toBeLessThan(200);
    });

    it('should maintain performance under rapid state changes', () => {
      const startTime = performance.now();

      // Rapid state changes
      for (let i = 0; i < 50; i++) {
        audioService.playAmbientSound(`ambient-${i % 5}`);
        audioService.setMasterVolume(Math.random());
        audioService.pauseMusic();
        audioService.resumeMusic();
      }

      const endTime = performance.now();
      const rapidChangeTime = endTime - startTime;

      // Should handle rapid changes efficiently (< 100ms)
      expect(rapidChangeTime).toBeLessThan(100);
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should provide performance metrics for audio operations', async () => {
      // Mark start of operation
      performance.mark('audio-operation-start');

      await audioService.playMusic('performance-test-track');
      audioService.playAmbientSound('performance-test-ambient');

      // Mark end of operation
      performance.mark('audio-operation-end');

      // Measure performance
      performance.measure(
        'audio-operation',
        'audio-operation-start',
        'audio-operation-end'
      );

      // Verify performance marks were created
      expect(global.window.performance.mark).toHaveBeenCalledWith(
        'audio-operation-start'
      );
      expect(global.window.performance.mark).toHaveBeenCalledWith(
        'audio-operation-end'
      );
      expect(global.window.performance.measure).toHaveBeenCalledWith(
        'audio-operation',
        'audio-operation-start',
        'audio-operation-end'
      );
    });

    it('should track audio loading performance metrics', async () => {
      const tracks = ['track-1', 'track-2', 'track-3'];
      const loadTimes: number[] = [];

      for (const trackId of tracks) {
        const startTime = performance.now();
        await audioService.playMusic(trackId);
        const endTime = performance.now();
        loadTimes.push(endTime - startTime);
      }

      // Calculate average load time
      const averageLoadTime =
        loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;

      // Average load time should be reasonable (< 150ms)
      expect(averageLoadTime).toBeLessThan(150);

      // No single load should take too long (< 300ms)
      expect(Math.max(...loadTimes)).toBeLessThan(300);
    });
  });
});
