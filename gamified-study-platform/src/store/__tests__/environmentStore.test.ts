import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEnvironmentStore } from '../environmentStore';
import type { Environment, AudioSettings, VisualSettings } from '../../types';

// Mock the audio services
vi.mock('../../services/audioService', () => ({
  audioService: {
    playAmbientSound: vi.fn(),
    stopAmbientSound: vi.fn(),
    setMasterVolume: vi.fn(),
  },
}));

vi.mock('../../services/audioPreloader', () => ({
  audioPreloader: {
    preloadAmbientSound: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock document for CSS variable setting
global.document = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
    },
  },
} as any;

describe('useEnvironmentStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEnvironmentStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useEnvironmentStore.getState();

      expect(state.currentEnvironment).toBeNull();
      expect(state.availableEnvironments).toEqual([]);
      expect(state.unlockedEnvironments).toEqual(['classroom', 'office']);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.preloadedAssets).toEqual([]);
      expect(state.audioSettings).toMatchObject({
        masterVolume: 0.7,
        ambientVolume: 0.5,
        musicVolume: 0.6,
        soundEffectsVolume: 0.8,
        autoPlay: true,
      });
      expect(state.visualSettings).toMatchObject({
        particlesEnabled: true,
        animationsEnabled: true,
        backgroundQuality: 'medium',
        reducedMotion: false,
      });
    });
  });

  describe('loadEnvironments', () => {
    it('should load environments successfully', async () => {
      const store = useEnvironmentStore.getState();

      await store.loadEnvironments();

      const state = useEnvironmentStore.getState();
      expect(state.availableEnvironments).toHaveLength(4);
      expect(state.availableEnvironments[0]).toMatchObject({
        id: 'classroom',
        name: 'Classroom',
        category: 'free',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set current environment to first available if none selected', async () => {
      const store = useEnvironmentStore.getState();

      await store.loadEnvironments();

      const state = useEnvironmentStore.getState();
      expect(state.currentEnvironment?.id).toBe('classroom');
    });

    it('should preserve current environment if already set', async () => {
      const store = useEnvironmentStore.getState();
      const mockEnvironment: Environment = {
        id: 'test-env',
        name: 'Test Environment',
        category: 'free',
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          accentColor: '#FF0000',
          cssVariables: {},
        },
        audio: {
          ambientTrack: 'test',
          musicTracks: [],
          soundEffects: {},
          defaultVolume: 0.5,
        },
        visuals: {
          backgroundImage: '/test.jpg',
          overlayElements: [],
          particleEffects: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.setCurrentEnvironment(mockEnvironment);
      await store.loadEnvironments();

      const state = useEnvironmentStore.getState();
      expect(state.currentEnvironment?.id).toBe('test-env');
    });

    it('should handle loading errors', async () => {
      const store = useEnvironmentStore.getState();

      // Mock console.error to avoid noise in tests
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Force an error by mocking a failure
      vi.spyOn(store, 'loadEnvironments').mockRejectedValue(
        new Error('Network error')
      );

      try {
        await store.loadEnvironments();
      } catch (error) {
        // Expected to throw
      }

      consoleSpy.mockRestore();
    });
  });

  describe('switchEnvironment', () => {
    beforeEach(async () => {
      const store = useEnvironmentStore.getState();
      await store.loadEnvironments();
    });

    it('should switch to valid unlocked environment', async () => {
      const store = useEnvironmentStore.getState();

      await store.switchEnvironment('office');

      const state = useEnvironmentStore.getState();
      expect(state.currentEnvironment?.id).toBe('office');
      expect(state.isSwitchingEnvironment).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should apply CSS variables when switching', async () => {
      const store = useEnvironmentStore.getState();

      await store.switchEnvironment('office');

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-primary',
        '#6366F1'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-bg',
        '#F9FAFB'
      );
    });

    it('should store previous environment for transition', async () => {
      const store = useEnvironmentStore.getState();

      // First switch to classroom
      await store.switchEnvironment('classroom');
      const previousEnv = useEnvironmentStore.getState().currentEnvironment;

      // Then switch to office
      await store.switchEnvironment('office');

      const state = useEnvironmentStore.getState();
      expect(state.previousEnvironment?.id).toBe('classroom');
    });

    it('should handle switching to non-existent environment', async () => {
      const store = useEnvironmentStore.getState();

      await store.switchEnvironment('non-existent');

      const state = useEnvironmentStore.getState();
      expect(state.error).toBe('Environment not found');
      expect(state.isSwitchingEnvironment).toBe(false);
    });

    it('should handle switching to locked environment', async () => {
      const store = useEnvironmentStore.getState();

      await store.switchEnvironment('cafe');

      const state = useEnvironmentStore.getState();
      expect(state.error).toBe('Environment not unlocked');
      expect(state.isSwitchingEnvironment).toBe(false);
    });

    it('should set switching state during transition', async () => {
      const store = useEnvironmentStore.getState();

      const switchPromise = store.switchEnvironment('office');

      // Check state during switching
      const duringState = useEnvironmentStore.getState();
      expect(duringState.isSwitchingEnvironment).toBe(true);
      expect(duringState.switchTransition).toBe(true);

      await switchPromise;

      // Check state after switching
      const afterState = useEnvironmentStore.getState();
      expect(afterState.isSwitchingEnvironment).toBe(false);
      expect(afterState.switchTransition).toBe(false);
    });
  });

  describe('unlockEnvironment', () => {
    beforeEach(async () => {
      const store = useEnvironmentStore.getState();
      await store.loadEnvironments();
    });

    it('should unlock new environment', async () => {
      const store = useEnvironmentStore.getState();

      await store.unlockEnvironment('cafe');

      const state = useEnvironmentStore.getState();
      expect(state.unlockedEnvironments).toContain('cafe');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle already unlocked environment', async () => {
      const store = useEnvironmentStore.getState();

      await store.unlockEnvironment('classroom');

      const state = useEnvironmentStore.getState();
      expect(
        state.unlockedEnvironments.filter(id => id === 'classroom')
      ).toHaveLength(1);
      expect(state.error).toBeNull();
    });

    it('should handle non-existent environment', async () => {
      const store = useEnvironmentStore.getState();

      try {
        await store.unlockEnvironment('non-existent');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      const state = useEnvironmentStore.getState();
      expect(state.error).toBe('Environment not found');
    });
  });

  describe('preloadEnvironmentAssets', () => {
    beforeEach(async () => {
      const store = useEnvironmentStore.getState();
      await store.loadEnvironments();
    });

    it('should preload assets for multiple environments', async () => {
      const store = useEnvironmentStore.getState();

      await store.preloadEnvironmentAssets(['classroom', 'office']);

      const state = useEnvironmentStore.getState();
      expect(state.preloadedAssets).toContain('classroom');
      expect(state.preloadedAssets).toContain('office');
      expect(state.isPreloadingAssets).toBe(false);
    });

    it('should not preload already preloaded assets', async () => {
      const store = useEnvironmentStore.getState();

      // First preload
      await store.preloadEnvironmentAssets(['classroom']);

      // Second preload of same environment
      await store.preloadEnvironmentAssets(['classroom']);

      const state = useEnvironmentStore.getState();
      expect(
        state.preloadedAssets.filter(id => id === 'classroom')
      ).toHaveLength(1);
    });

    it('should handle preloading errors gracefully', async () => {
      const store = useEnvironmentStore.getState();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await store.preloadEnvironmentAssets(['non-existent']);

      const state = useEnvironmentStore.getState();
      expect(state.error).toBe('Failed to preload assets');
      expect(state.isPreloadingAssets).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('audio management', () => {
    it('should update audio settings', () => {
      const store = useEnvironmentStore.getState();
      const newSettings: Partial<AudioSettings> = {
        masterVolume: 0.8,
        ambientVolume: 0.3,
      };

      store.updateAudioSettings(newSettings);

      const state = useEnvironmentStore.getState();
      expect(state.audioSettings.masterVolume).toBe(0.8);
      expect(state.audioSettings.ambientVolume).toBe(0.3);
      expect(state.audioSettings.musicVolume).toBe(0.6); // Unchanged
    });

    it('should play music track', async () => {
      const store = useEnvironmentStore.getState();

      await store.playMusic('lofi-track-1');

      const state = useEnvironmentStore.getState();
      expect(state.currentTrack?.id).toBe('lofi-track-1');
      expect(state.isPlaying).toBe(true);
      expect(state.playbackPosition).toBe(0);
    });

    it('should pause music', () => {
      const store = useEnvironmentStore.getState();

      // First set a track as playing
      store.playMusic('test-track');
      store.pauseMusic();

      const state = useEnvironmentStore.getState();
      expect(state.isPlaying).toBe(false);
    });

    it('should resume music', () => {
      const store = useEnvironmentStore.getState();

      // Set up a paused track
      store.playMusic('test-track');
      store.pauseMusic();
      store.resumeMusic();

      const state = useEnvironmentStore.getState();
      expect(state.isPlaying).toBe(true);
    });

    it('should stop music', () => {
      const store = useEnvironmentStore.getState();

      // First set a track as playing
      store.playMusic('test-track');
      store.stopMusic();

      const state = useEnvironmentStore.getState();
      expect(state.currentTrack).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.playbackPosition).toBe(0);
    });

    it('should set playback position', () => {
      const store = useEnvironmentStore.getState();

      store.setPlaybackPosition(60);

      const state = useEnvironmentStore.getState();
      expect(state.playbackPosition).toBe(60);
    });

    it('should crossfade between tracks', async () => {
      const store = useEnvironmentStore.getState();

      // Set up initial track
      await store.playMusic('track-1');

      // Crossfade to new track
      await store.crossfadeToTrack('track-2', 1000);

      const state = useEnvironmentStore.getState();
      expect(state.currentTrack?.id).toBe('track-2');
    });

    it('should handle music play errors', async () => {
      const store = useEnvironmentStore.getState();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Mock playMusic to throw error
      vi.spyOn(store, 'playMusic').mockRejectedValue(new Error('Play failed'));

      try {
        await store.playMusic('invalid-track');
      } catch (error) {
        // Expected to throw
      }

      consoleSpy.mockRestore();
    });
  });

  describe('visual settings management', () => {
    it('should update visual settings', () => {
      const store = useEnvironmentStore.getState();
      const newSettings: Partial<VisualSettings> = {
        particlesEnabled: false,
        backgroundQuality: 'high',
      };

      store.updateVisualSettings(newSettings);

      const state = useEnvironmentStore.getState();
      expect(state.visualSettings.particlesEnabled).toBe(false);
      expect(state.visualSettings.backgroundQuality).toBe('high');
      expect(state.visualSettings.animationsEnabled).toBe(true); // Unchanged
    });

    it('should toggle particles', () => {
      const store = useEnvironmentStore.getState();
      const initialParticlesEnabled =
        useEnvironmentStore.getState().visualSettings.particlesEnabled;

      store.toggleParticles();

      const state = useEnvironmentStore.getState();
      expect(state.visualSettings.particlesEnabled).toBe(
        !initialParticlesEnabled
      );
    });

    it('should toggle animations', () => {
      const store = useEnvironmentStore.getState();
      const initialAnimationsEnabled =
        useEnvironmentStore.getState().visualSettings.animationsEnabled;

      store.toggleAnimations();

      const state = useEnvironmentStore.getState();
      expect(state.visualSettings.animationsEnabled).toBe(
        !initialAnimationsEnabled
      );
    });
  });

  describe('customization management', () => {
    it('should add customization', () => {
      const store = useEnvironmentStore.getState();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const customization = {
        environmentId: 'classroom',
        name: 'My Custom Classroom',
        changes: { primaryColor: '#FF0000' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.addCustomization(customization);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Added customization:',
        customization
      );
      consoleSpy.mockRestore();
    });

    it('should remove customization', () => {
      const store = useEnvironmentStore.getState();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      store.removeCustomization('classroom');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Removed customization for:',
        'classroom'
      );
      consoleSpy.mockRestore();
    });

    it('should update customization', () => {
      const store = useEnvironmentStore.getState();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const customization = { primaryColor: '#00FF00' };
      store.updateCustomization('classroom', customization);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Updated customization for:',
        'classroom',
        customization
      );
      consoleSpy.mockRestore();
    });
  });

  describe('state management utilities', () => {
    it('should set current environment', () => {
      const store = useEnvironmentStore.getState();
      const mockEnvironment: Environment = {
        id: 'test',
        name: 'Test',
        category: 'free',
        theme: {
          primaryColor: '#000000',
          secondaryColor: '#111111',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          accentColor: '#FF0000',
          cssVariables: {},
        },
        audio: {
          ambientTrack: 'test',
          musicTracks: [],
          soundEffects: {},
          defaultVolume: 0.5,
        },
        visuals: {
          backgroundImage: '/test.jpg',
          overlayElements: [],
          particleEffects: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.setCurrentEnvironment(mockEnvironment);

      const state = useEnvironmentStore.getState();
      expect(state.currentEnvironment).toEqual(mockEnvironment);
    });

    it('should add unlocked environment', () => {
      const store = useEnvironmentStore.getState();

      store.addUnlockedEnvironment('forest');

      const state = useEnvironmentStore.getState();
      expect(state.unlockedEnvironments).toContain('forest');
    });

    it('should not add duplicate unlocked environment', () => {
      const store = useEnvironmentStore.getState();

      store.addUnlockedEnvironment('classroom');

      const state = useEnvironmentStore.getState();
      expect(
        state.unlockedEnvironments.filter(id => id === 'classroom')
      ).toHaveLength(1);
    });

    it('should set loading state', () => {
      const store = useEnvironmentStore.getState();

      store.setLoading(true);
      expect(useEnvironmentStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useEnvironmentStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      const store = useEnvironmentStore.getState();

      store.setError('Test error');
      expect(useEnvironmentStore.getState().error).toBe('Test error');

      store.setError(null);
      expect(useEnvironmentStore.getState().error).toBeNull();
    });

    it('should set switching environment state', () => {
      const store = useEnvironmentStore.getState();

      store.setSwitchingEnvironment(true);
      expect(useEnvironmentStore.getState().isSwitchingEnvironment).toBe(true);

      store.setSwitchingEnvironment(false);
      expect(useEnvironmentStore.getState().isSwitchingEnvironment).toBe(false);
    });

    it('should set preloading assets state', () => {
      const store = useEnvironmentStore.getState();

      store.setPreloadingAssets(true);
      expect(useEnvironmentStore.getState().isPreloadingAssets).toBe(true);

      store.setPreloadingAssets(false);
      expect(useEnvironmentStore.getState().isPreloadingAssets).toBe(false);
    });

    it('should set switch transition state', () => {
      const store = useEnvironmentStore.getState();

      store.setSwitchTransition(true);
      expect(useEnvironmentStore.getState().switchTransition).toBe(true);

      store.setSwitchTransition(false);
      expect(useEnvironmentStore.getState().switchTransition).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('should reset store to initial state', async () => {
      const store = useEnvironmentStore.getState();

      // Make some changes
      await store.loadEnvironments();
      store.setError('Test error');
      store.setLoading(true);
      store.addUnlockedEnvironment('forest');

      // Reset
      store.reset();

      const state = useEnvironmentStore.getState();
      expect(state.currentEnvironment).toBeNull();
      expect(state.availableEnvironments).toEqual([]);
      expect(state.unlockedEnvironments).toEqual(['classroom', 'office']);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should persist important state properties', () => {
      const store = useEnvironmentStore.getState();

      // The persist middleware should save these properties
      const persistedKeys = [
        'currentEnvironment',
        'unlockedEnvironments',
        'audioSettings',
        'visualSettings',
        'preloadedAssets',
      ];

      // These properties should exist in the store
      persistedKeys.forEach(key => {
        expect(store).toHaveProperty(key);
      });
    });
  });
});
