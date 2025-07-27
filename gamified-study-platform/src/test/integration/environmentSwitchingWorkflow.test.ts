import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useThemeStore } from '../../store/themeStore';
import { audioService } from '../../services/audioService';
import { audioPreloader } from '../../services/audioPreloader';
import type { Environment, AudioSettings, VisualSettings } from '../../types';

// Mock services
vi.mock('../../services/audioService', () => ({
  audioService: {
    playAmbientSound: vi.fn(),
    stopAmbientSound: vi.fn(),
    setMasterVolume: vi.fn(),
    setAmbientVolume: vi.fn(),
    setMusicVolume: vi.fn(),
    playMusic: vi.fn(),
    stopMusic: vi.fn(),
    pauseMusic: vi.fn(),
    resumeMusic: vi.fn(),
    crossfade: vi.fn(),
    getCurrentTrack: vi.fn(),
    isPlaying: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

vi.mock('../../services/audioPreloader', () => ({
  audioPreloader: {
    preloadAmbientSound: vi.fn().mockResolvedValue(undefined),
    preloadMusic: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock document for CSS variable setting
global.document = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      getPropertyValue: vi.fn(),
    },
  },
} as any;

describe('Environment Switching Workflow Integration Tests', () => {
  const mockEnvironments: Environment[] = [
    {
      id: 'classroom',
      name: 'Classroom',
      category: 'free',
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#F8FAFC',
        textColor: '#1F2937',
        accentColor: '#10B981',
        cssVariables: {
          '--env-primary': '#3B82F6',
          '--env-secondary': '#1E40AF',
          '--env-bg': '#F8FAFC',
          '--env-text': '#1F2937',
          '--env-accent': '#10B981',
        },
      },
      audio: {
        ambientTrack: 'classroom-ambient',
        musicTracks: [],
        soundEffects: {
          'page-turn': '/sounds/page-turn.mp3',
        },
        defaultVolume: 0.3,
      },
      visuals: {
        backgroundImage: '/environments/classroom-bg.jpg',
        overlayElements: [],
        particleEffects: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'forest',
      name: 'Peaceful Forest',
      category: 'premium',
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        backgroundColor: '#ECFDF5',
        textColor: '#064E3B',
        accentColor: '#DC2626',
        cssVariables: {
          '--env-primary': '#059669',
          '--env-secondary': '#047857',
          '--env-bg': '#ECFDF5',
          '--env-text': '#064E3B',
          '--env-accent': '#DC2626',
        },
      },
      audio: {
        ambientTrack: 'forest-ambient',
        musicTracks: [
          {
            id: 'forest-music-1',
            title: 'Forest Sounds',
            duration: 300,
            url: '/music/forest-sounds.mp3',
            genre: 'ambient',
            mood: 'relaxing',
          },
        ],
        soundEffects: {
          'birds-chirp': '/sounds/birds-chirp.mp3',
        },
        defaultVolume: 0.5,
      },
      visuals: {
        backgroundImage: '/environments/forest-bg.jpg',
        overlayElements: [],
        particleEffects: [
          {
            type: 'leaves',
            count: 20,
            speed: 1,
            size: { min: 8, max: 16 },
            color: '#10B981',
          },
        ],
      },
      unlockRequirements: [
        {
          type: 'study_hours',
          target: 10,
          current: 0,
          description: 'Study for 10 hours to unlock',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cafe',
      name: 'Cozy Cafe',
      category: 'premium',
      theme: {
        primaryColor: '#D97706',
        secondaryColor: '#92400E',
        backgroundColor: '#FEF3C7',
        textColor: '#78350F',
        accentColor: '#DC2626',
        cssVariables: {
          '--env-primary': '#D97706',
          '--env-secondary': '#92400E',
          '--env-bg': '#FEF3C7',
          '--env-text': '#78350F',
          '--env-accent': '#DC2626',
        },
      },
      audio: {
        ambientTrack: 'cafe-ambient',
        musicTracks: [],
        soundEffects: {
          'coffee-pour': '/sounds/coffee-pour.mp3',
        },
        defaultVolume: 0.4,
      },
      visuals: {
        backgroundImage: '/environments/cafe-bg.jpg',
        overlayElements: [],
        particleEffects: [],
      },
      unlockRequirements: [
        {
          type: 'coins',
          target: 500,
          current: 0,
          description: 'Spend 500 coins to unlock',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    useEnvironmentStore.getState().reset();
    useThemeStore.getState().reset();

    // Setup default mock responses
    (audioService.getSettings as any).mockReturnValue({
      masterVolume: 0.7,
      ambientVolume: 0.5,
      musicVolume: 0.6,
      soundEffectsVolume: 0.8,
      autoPlay: true,
    });
    (audioService.getCurrentTrack as any).mockReturnValue(null);
    (audioService.isPlaying as any).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Environment Loading and Switching Flow', () => {
    it('should complete full environment loading and switching workflow', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Step 1: Load available environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Verify environments loaded
      expect(result.current.availableEnvironments).toHaveLength(4);
      expect(result.current.currentEnvironment?.id).toBe('classroom');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Step 2: Switch to different environment
      await act(async () => {
        await result.current.switchEnvironment('office');
      });

      // Verify environment switch
      expect(result.current.currentEnvironment?.id).toBe('office');
      expect(result.current.previousEnvironment?.id).toBe('classroom');
      expect(result.current.isSwitchingEnvironment).toBe(false);
      expect(result.current.switchTransition).toBe(false);

      // Verify CSS variables were applied
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-primary',
        '#6366F1'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-bg',
        '#F9FAFB'
      );
    });

    it('should handle environment switching with audio integration', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Enable auto-play
      act(() => {
        result.current.updateAudioSettings({ autoPlay: true });
      });

      // Switch to forest environment (has ambient track)
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify audio preloading and playback were attempted
      expect(audioPreloader.preloadAmbientSound).toHaveBeenCalledWith(
        'forest',
        'forest-ambient'
      );
      expect(audioService.playAmbientSound).toHaveBeenCalledWith(
        'forest-ambient',
        0.5
      );
    });

    it('should handle environment switching without auto-play', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments and disable auto-play
      await act(async () => {
        await result.current.loadEnvironments();
        result.current.updateAudioSettings({ autoPlay: false });
      });

      // Switch environment
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify audio was not auto-played
      expect(audioService.playAmbientSound).not.toHaveBeenCalled();
    });
  });

  describe('Environment Unlocking Workflow', () => {
    it('should complete environment unlock workflow', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Verify forest is not initially unlocked
      expect(result.current.unlockedEnvironments).not.toContain('forest');

      // Unlock forest environment
      await act(async () => {
        await result.current.unlockEnvironment('forest');
      });

      // Verify environment was unlocked
      expect(result.current.unlockedEnvironments).toContain('forest');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Now should be able to switch to forest
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      expect(result.current.currentEnvironment?.id).toBe('forest');
    });

    it('should prevent switching to locked environments', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Attempt to switch to locked environment
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify switch was prevented
      expect(result.current.error).toBe('Environment not unlocked');
      expect(result.current.currentEnvironment?.id).not.toBe('forest');
      expect(result.current.isSwitchingEnvironment).toBe(false);
    });
  });

  describe('Asset Preloading Workflow', () => {
    it('should complete asset preloading workflow', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Preload assets for multiple environments
      await act(async () => {
        await result.current.preloadEnvironmentAssets(['classroom', 'office']);
      });

      // Verify assets were preloaded
      expect(result.current.preloadedAssets).toContain('classroom');
      expect(result.current.preloadedAssets).toContain('office');
      expect(result.current.isPreloadingAssets).toBe(false);
      expect(result.current.error).toBeNull();

      // Verify switching to preloaded environment is faster (no additional loading)
      await act(async () => {
        await result.current.switchEnvironment('office');
      });

      expect(result.current.currentEnvironment?.id).toBe('office');
    });

    it('should handle preloading errors gracefully', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Mock console.error to avoid noise
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Attempt to preload non-existent environment
      await act(async () => {
        await result.current.preloadEnvironmentAssets(['non-existent']);
      });

      // Verify error handling
      expect(result.current.error).toBe('Failed to preload assets');
      expect(result.current.isPreloadingAssets).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Audio Settings Integration Workflow', () => {
    it('should integrate audio settings with environment switching', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Update audio settings
      const newAudioSettings: Partial<AudioSettings> = {
        masterVolume: 0.8,
        ambientVolume: 0.6,
        musicVolume: 0.4,
        autoPlay: true,
      };

      act(() => {
        result.current.updateAudioSettings(newAudioSettings);
      });

      // Verify settings were updated
      expect(result.current.audioSettings).toMatchObject(newAudioSettings);

      // Switch environment with new settings
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify audio was played with updated settings
      expect(audioService.playAmbientSound).toHaveBeenCalledWith(
        'forest-ambient',
        0.5 // Environment default volume
      );
    });

    it('should handle music playback workflow', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Play music
      await act(async () => {
        await result.current.playMusic('lofi-track-1');
      });

      // Verify music state
      expect(result.current.currentTrack?.id).toBe('lofi-track-1');
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.playbackPosition).toBe(0);

      // Pause music
      act(() => {
        result.current.pauseMusic();
      });

      expect(result.current.isPlaying).toBe(false);

      // Resume music
      act(() => {
        result.current.resumeMusic();
      });

      expect(result.current.isPlaying).toBe(true);

      // Stop music
      act(() => {
        result.current.stopMusic();
      });

      expect(result.current.currentTrack).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.playbackPosition).toBe(0);
    });

    it('should handle crossfading between tracks', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Start with first track
      await act(async () => {
        await result.current.playMusic('track-1');
      });

      expect(result.current.currentTrack?.id).toBe('track-1');

      // Crossfade to second track
      await act(async () => {
        await result.current.crossfadeToTrack('track-2', 1000);
      });

      // Verify crossfade completed
      expect(result.current.currentTrack?.id).toBe('track-2');
      expect(audioService.crossfade).toHaveBeenCalledWith(
        'track-1',
        'track-2',
        1000
      );
    });
  });

  describe('Visual Settings Integration Workflow', () => {
    it('should integrate visual settings with environment switching', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Update visual settings
      const newVisualSettings: Partial<VisualSettings> = {
        particlesEnabled: false,
        animationsEnabled: true,
        backgroundQuality: 'high',
        reducedMotion: true,
      };

      act(() => {
        result.current.updateVisualSettings(newVisualSettings);
      });

      // Verify settings were updated
      expect(result.current.visualSettings).toMatchObject(newVisualSettings);

      // Switch to environment with particles
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify environment switched despite particles being disabled
      expect(result.current.currentEnvironment?.id).toBe('forest');
      expect(result.current.visualSettings.particlesEnabled).toBe(false);
    });

    it('should handle visual settings toggles', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      const initialParticlesEnabled =
        result.current.visualSettings.particlesEnabled;
      const initialAnimationsEnabled =
        result.current.visualSettings.animationsEnabled;

      // Toggle particles
      act(() => {
        result.current.toggleParticles();
      });

      expect(result.current.visualSettings.particlesEnabled).toBe(
        !initialParticlesEnabled
      );

      // Toggle animations
      act(() => {
        result.current.toggleAnimations();
      });

      expect(result.current.visualSettings.animationsEnabled).toBe(
        !initialAnimationsEnabled
      );
    });
  });

  describe('Theme Integration Workflow', () => {
    it('should integrate with theme system for consistent styling', async () => {
      const { result: envResult } = renderHook(() => useEnvironmentStore());
      const { result: themeResult } = renderHook(() => useThemeStore());

      // Load environments
      await act(async () => {
        await envResult.current.loadEnvironments();
      });

      // Load themes
      await act(async () => {
        await themeResult.current.loadThemes();
      });

      // Switch environment (applies environment theme)
      await act(async () => {
        await envResult.current.switchEnvironment('forest');
      });

      // Verify environment theme was applied
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-primary',
        '#059669'
      );

      // Apply global theme (should work alongside environment theme)
      await act(async () => {
        await themeResult.current.applyTheme('default-dark');
      });

      // Both theme systems should coexist
      expect(envResult.current.currentEnvironment?.id).toBe('forest');
      expect(themeResult.current.currentTheme?.id).toBe('default-dark');
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from environment switching failures', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Attempt to switch to non-existent environment
      await act(async () => {
        await result.current.switchEnvironment('non-existent');
      });

      // Verify error state
      expect(result.current.error).toBe('Environment not found');
      expect(result.current.isSwitchingEnvironment).toBe(false);

      // Clear error and switch to valid environment
      act(() => {
        result.current.setError(null);
      });

      await act(async () => {
        await result.current.switchEnvironment('office');
      });

      // Verify recovery
      expect(result.current.currentEnvironment?.id).toBe('office');
      expect(result.current.error).toBeNull();
    });

    it('should handle audio service failures gracefully', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Mock audio service failure
      (audioService.playAmbientSound as any).mockImplementation(() => {
        throw new Error('Audio service failed');
      });

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Switch environment (should not fail despite audio error)
      await act(async () => {
        await result.current.switchEnvironment('forest');
      });

      // Verify environment switch succeeded despite audio failure
      expect(result.current.currentEnvironment?.id).toBe('forest');
      expect(result.current.error).toBeNull();
    });
  });

  describe('Performance Optimization Workflows', () => {
    it('should optimize environment switching performance', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Preload assets for environments we plan to switch to
      await act(async () => {
        await result.current.preloadEnvironmentAssets(['office', 'forest']);
      });

      // Measure switching performance (should be faster for preloaded)
      const startTime = Date.now();

      await act(async () => {
        await result.current.switchEnvironment('office');
      });

      const switchTime = Date.now() - startTime;

      // Verify switch completed quickly (less than 1 second)
      expect(switchTime).toBeLessThan(1000);
      expect(result.current.currentEnvironment?.id).toBe('office');
    });

    it('should handle concurrent operations efficiently', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Perform multiple operations concurrently
      await act(async () => {
        await Promise.all([
          result.current.preloadEnvironmentAssets(['office']),
          result.current.updateAudioSettings({ masterVolume: 0.8 }),
          result.current.updateVisualSettings({ particlesEnabled: false }),
        ]);
      });

      // Verify all operations completed successfully
      expect(result.current.preloadedAssets).toContain('office');
      expect(result.current.audioSettings.masterVolume).toBe(0.8);
      expect(result.current.visualSettings.particlesEnabled).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('State Persistence Workflow', () => {
    it('should maintain state consistency across operations', async () => {
      const { result } = renderHook(() => useEnvironmentStore());

      // Load environments
      await act(async () => {
        await result.current.loadEnvironments();
      });

      // Perform series of operations
      await act(async () => {
        await result.current.switchEnvironment('office');
      });

      act(() => {
        result.current.updateAudioSettings({ masterVolume: 0.9 });
        result.current.updateVisualSettings({ backgroundQuality: 'high' });
      });

      await act(async () => {
        await result.current.unlockEnvironment('forest');
        await result.current.switchEnvironment('forest');
      });

      // Verify final state is consistent
      expect(result.current.currentEnvironment?.id).toBe('forest');
      expect(result.current.unlockedEnvironments).toContain('forest');
      expect(result.current.audioSettings.masterVolume).toBe(0.9);
      expect(result.current.visualSettings.backgroundQuality).toBe('high');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
