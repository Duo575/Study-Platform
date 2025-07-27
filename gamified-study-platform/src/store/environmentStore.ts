import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Environment,
  EnvironmentState,
  AudioSettings,
  VisualSettings,
  EnvironmentCustomization,
  MusicTrack,
} from '../types';

interface EnvironmentStoreState extends EnvironmentState {
  // Additional UI states
  isLoadingEnvironment: boolean;
  isSwitchingEnvironment: boolean;
  isPreloadingAssets: boolean;

  // Audio states
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  playbackPosition: number;

  // Environment switching
  previousEnvironment: Environment | null;
  switchTransition: boolean;
}

interface EnvironmentActions {
  // Environment management
  loadEnvironments: () => Promise<void>;
  switchEnvironment: (environmentId: string) => Promise<void>;
  unlockEnvironment: (environmentId: string) => Promise<void>;
  preloadEnvironmentAssets: (environmentIds: string[]) => Promise<void>;

  // Audio management
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  playMusic: (trackId: string) => Promise<void>;
  pauseMusic: () => void;
  resumeMusic: () => void;
  stopMusic: () => void;
  setPlaybackPosition: (position: number) => void;
  crossfadeToTrack: (trackId: string, duration?: number) => Promise<void>;

  // Visual management
  updateVisualSettings: (settings: Partial<VisualSettings>) => void;
  toggleParticles: () => void;
  toggleAnimations: () => void;

  // Customization
  addCustomization: (customization: EnvironmentCustomization) => void;
  removeCustomization: (environmentId: string) => void;
  updateCustomization: (
    environmentId: string,
    customization: Partial<EnvironmentCustomization>
  ) => void;

  // Environment state
  setCurrentEnvironment: (environment: Environment | null) => void;
  addUnlockedEnvironment: (environmentId: string) => void;

  // UI state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSwitchingEnvironment: (switching: boolean) => void;
  setPreloadingAssets: (preloading: boolean) => void;
  setSwitchTransition: (transition: boolean) => void;

  // Reset
  reset: () => void;
}

const defaultAudioSettings: AudioSettings = {
  masterVolume: 0.7,
  ambientVolume: 0.5,
  musicVolume: 0.6,
  soundEffectsVolume: 0.8,
  currentPlaylist: undefined,
  autoPlay: true,
};

const defaultVisualSettings: VisualSettings = {
  particlesEnabled: true,
  animationsEnabled: true,
  backgroundQuality: 'medium',
  reducedMotion: false,
};

const initialState: EnvironmentStoreState = {
  currentEnvironment: null,
  availableEnvironments: [],
  unlockedEnvironments: ['classroom', 'office'], // Default free environments
  audioSettings: defaultAudioSettings,
  visualSettings: defaultVisualSettings,
  isLoading: false,
  error: null,
  preloadedAssets: [],

  // Additional states
  isLoadingEnvironment: false,
  isSwitchingEnvironment: false,
  isPreloadingAssets: false,
  currentTrack: null,
  isPlaying: false,
  playbackPosition: 0,
  previousEnvironment: null,
  switchTransition: false,
};

export const useEnvironmentStore = create<
  EnvironmentStoreState & EnvironmentActions
>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        loadEnvironments: async () => {
          try {
            set({ isLoading: true, error: null });

            // For now, we'll use static data. In a real app, this would be an API call
            const environments: Environment[] = [
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
                    'pencil-write': '/sounds/pencil-write.mp3',
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
                id: 'office',
                name: 'Modern Office',
                category: 'free',
                theme: {
                  primaryColor: '#6366F1',
                  secondaryColor: '#4F46E5',
                  backgroundColor: '#F9FAFB',
                  textColor: '#111827',
                  accentColor: '#059669',
                  cssVariables: {
                    '--env-primary': '#6366F1',
                    '--env-secondary': '#4F46E5',
                    '--env-bg': '#F9FAFB',
                    '--env-text': '#111827',
                    '--env-accent': '#059669',
                  },
                },
                audio: {
                  ambientTrack: 'office-ambient',
                  musicTracks: [],
                  soundEffects: {
                    'keyboard-type': '/sounds/keyboard-type.mp3',
                    'mouse-click': '/sounds/mouse-click.mp3',
                  },
                  defaultVolume: 0.2,
                },
                visuals: {
                  backgroundImage: '/environments/office-bg.jpg',
                  overlayElements: [],
                  particleEffects: [],
                },
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
                    'cafe-chatter': '/sounds/cafe-chatter.mp3',
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
                  musicTracks: [],
                  soundEffects: {
                    'birds-chirp': '/sounds/birds-chirp.mp3',
                    'wind-leaves': '/sounds/wind-leaves.mp3',
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
                    target: 50,
                    current: 0,
                    description: 'Study for 50 hours to unlock',
                  },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];

            set({
              availableEnvironments: environments,
              isLoading: false,
              // Set default environment if none is selected
              currentEnvironment: get().currentEnvironment || environments[0],
            });
          } catch (error) {
            console.error('Error loading environments:', error);
            set({ error: 'Failed to load environments', isLoading: false });
          }
        },

        switchEnvironment: async (environmentId: string) => {
          try {
            set({
              isSwitchingEnvironment: true,
              error: null,
              switchTransition: true,
            });

            const {
              availableEnvironments,
              unlockedEnvironments,
              currentEnvironment,
            } = get();
            const targetEnvironment = availableEnvironments.find(
              env => env.id === environmentId
            );

            if (!targetEnvironment) {
              throw new Error('Environment not found');
            }

            if (!unlockedEnvironments.includes(environmentId)) {
              throw new Error('Environment not unlocked');
            }

            // Store previous environment for transition
            set({ previousEnvironment: currentEnvironment });

            // Simulate loading time for smooth transition
            await new Promise(resolve => setTimeout(resolve, 500));

            // Apply environment theme to CSS variables
            const root = document.documentElement;
            Object.entries(targetEnvironment.theme.cssVariables).forEach(
              ([key, value]) => {
                root.style.setProperty(key, value);
              }
            );

            set({
              currentEnvironment: targetEnvironment,
              isSwitchingEnvironment: false,
              switchTransition: false,
            });

            // Auto-play ambient sound if enabled
            if (
              get().audioSettings.autoPlay &&
              targetEnvironment.audio.ambientTrack
            ) {
              // Import and use audio service for ambient sound playback
              Promise.all([
                import('../../services/audioService'),
                import('../../services/audioPreloader'),
              ])
                .then(([{ audioService }, { audioPreloader }]) => {
                  // Preload ambient sound if not already cached
                  audioPreloader
                    .preloadAmbientSound(
                      targetEnvironment.id,
                      targetEnvironment.audio.ambientTrack!
                    )
                    .then(() => {
                      // Play ambient sound
                      audioService.playAmbientSound(
                        targetEnvironment.audio.ambientTrack!,
                        targetEnvironment.audio.defaultVolume
                      );
                    })
                    .catch(error => {
                      console.error('Error preloading ambient sound:', error);
                      // Fallback to direct playback
                      audioService.playAmbientSound(
                        targetEnvironment.audio.ambientTrack!,
                        targetEnvironment.audio.defaultVolume
                      );
                    });
                })
                .catch(error => {
                  console.error('Error playing ambient sound:', error);
                });
            }
          } catch (error) {
            console.error('Error switching environment:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to switch environment',
              isSwitchingEnvironment: false,
              switchTransition: false,
            });
          }
        },

        unlockEnvironment: async (environmentId: string) => {
          try {
            set({ isLoading: true, error: null });

            const { availableEnvironments, unlockedEnvironments } = get();
            const environment = availableEnvironments.find(
              env => env.id === environmentId
            );

            if (!environment) {
              throw new Error('Environment not found');
            }

            if (unlockedEnvironments.includes(environmentId)) {
              // Already unlocked, just return success
              set({ isLoading: false });
              return;
            }

            // Add to unlocked environments
            set({
              unlockedEnvironments: [...unlockedEnvironments, environmentId],
              isLoading: false,
            });

            console.log('Environment unlocked:', environmentId);
          } catch (error) {
            console.error('Error unlocking environment:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to unlock environment',
              isLoading: false,
            });
            throw error; // Re-throw for unlock manager to handle
          }
        },

        preloadEnvironmentAssets: async (environmentIds: string[]) => {
          try {
            set({ isPreloadingAssets: true, error: null });

            const { availableEnvironments, preloadedAssets } = get();
            const newPreloadedAssets = [...preloadedAssets];

            for (const environmentId of environmentIds) {
              const environment = availableEnvironments.find(
                env => env.id === environmentId
              );
              if (environment && !preloadedAssets.includes(environmentId)) {
                // Simulate asset preloading
                await new Promise(resolve => setTimeout(resolve, 200));
                newPreloadedAssets.push(environmentId);
                console.log('Preloaded assets for:', environmentId);
              }
            }

            set({
              preloadedAssets: newPreloadedAssets,
              isPreloadingAssets: false,
            });
          } catch (error) {
            console.error('Error preloading assets:', error);
            set({
              error: 'Failed to preload assets',
              isPreloadingAssets: false,
            });
          }
        },

        updateAudioSettings: (settings: Partial<AudioSettings>) => {
          const currentSettings = get().audioSettings;
          const newSettings = { ...currentSettings, ...settings };
          set({ audioSettings: newSettings });

          // Apply volume changes immediately if music is playing
          if (get().isPlaying) {
            console.log('Applying audio settings:', newSettings);
          }
        },

        playMusic: async (trackId: string) => {
          try {
            set({ error: null });

            // Find the track (this would typically be from the current environment or a playlist)
            const mockTrack: MusicTrack = {
              id: trackId,
              title: 'Lo-fi Study Track',
              duration: 180,
              url: `/music/${trackId}.mp3`,
              genre: 'lofi',
              mood: 'focused',
            };

            set({
              currentTrack: mockTrack,
              isPlaying: true,
              playbackPosition: 0,
            });

            console.log('Playing track:', trackId);
          } catch (error) {
            console.error('Error playing music:', error);
            set({ error: 'Failed to play music' });
          }
        },

        pauseMusic: () => {
          set({ isPlaying: false });
          console.log('Music paused');
        },

        resumeMusic: () => {
          if (get().currentTrack) {
            set({ isPlaying: true });
            console.log('Music resumed');
          }
        },

        stopMusic: () => {
          set({
            currentTrack: null,
            isPlaying: false,
            playbackPosition: 0,
          });
          console.log('Music stopped');
        },

        setPlaybackPosition: (position: number) => {
          set({ playbackPosition: position });
        },

        crossfadeToTrack: async (trackId: string, duration = 2000) => {
          try {
            const currentTrack = get().currentTrack;

            if (currentTrack) {
              // Simulate crossfade
              console.log(
                `Crossfading from ${currentTrack.id} to ${trackId} over ${duration}ms`
              );
              await new Promise(resolve => setTimeout(resolve, duration));
            }

            await get().playMusic(trackId);
          } catch (error) {
            console.error('Error crossfading tracks:', error);
            set({ error: 'Failed to crossfade tracks' });
          }
        },

        updateVisualSettings: (settings: Partial<VisualSettings>) => {
          const currentSettings = get().visualSettings;
          const newSettings = { ...currentSettings, ...settings };
          set({ visualSettings: newSettings });

          // Apply visual changes immediately
          console.log('Applied visual settings:', newSettings);
        },

        toggleParticles: () => {
          const { visualSettings } = get();
          get().updateVisualSettings({
            particlesEnabled: !visualSettings.particlesEnabled,
          });
        },

        toggleAnimations: () => {
          const { visualSettings } = get();
          get().updateVisualSettings({
            animationsEnabled: !visualSettings.animationsEnabled,
          });
        },

        addCustomization: (customization: EnvironmentCustomization) => {
          // This would typically save to a backend
          console.log('Added customization:', customization);
        },

        removeCustomization: (environmentId: string) => {
          // This would typically remove from a backend
          console.log('Removed customization for:', environmentId);
        },

        updateCustomization: (
          environmentId: string,
          customization: Partial<EnvironmentCustomization>
        ) => {
          // This would typically update in a backend
          console.log(
            'Updated customization for:',
            environmentId,
            customization
          );
        },

        setCurrentEnvironment: (environment: Environment | null) => {
          set({ currentEnvironment: environment });
        },

        addUnlockedEnvironment: (environmentId: string) => {
          const { unlockedEnvironments } = get();
          if (!unlockedEnvironments.includes(environmentId)) {
            set({
              unlockedEnvironments: [...unlockedEnvironments, environmentId],
            });
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setSwitchingEnvironment: (switching: boolean) => {
          set({ isSwitchingEnvironment: switching });
        },

        setPreloadingAssets: (preloading: boolean) => {
          set({ isPreloadingAssets: preloading });
        },

        setSwitchTransition: (transition: boolean) => {
          set({ switchTransition: transition });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'environment-store',
        partialize: state => ({
          currentEnvironment: state.currentEnvironment,
          unlockedEnvironments: state.unlockedEnvironments,
          audioSettings: state.audioSettings,
          visualSettings: state.visualSettings,
          preloadedAssets: state.preloadedAssets,
        }),
      }
    ),
    { name: 'EnvironmentStore' }
  )
);
