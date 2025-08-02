import type {
  Environment,
  EnvironmentManager,
  AudioSettings,
  VisualSettings,
  EnvironmentCustomization,
  UnlockRequirement,
} from '../types';
import {
  isEnvironment,
  isEnvironmentArray,
  validateEnvironment,
} from '../types/guards';

/**
 * Service for managing focus environments
 */
export class EnvironmentManagerService implements EnvironmentManager {
  private environments: Environment[] = [];
  private currentEnvironment: Environment | null = null;
  private preloadedAssets: Set<string> = new Set();
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Convert BasicEnvironment to full Environment with defaults
   */
  private convertToFullEnvironment(basicEnv: any): Environment {
    return {
      id: basicEnv.id || '',
      name: basicEnv.name || '',
      category: basicEnv.category || 'free',
      theme: basicEnv.theme || {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        backgroundColor: '#F8FAFC',
        textColor: '#1F2937',
        accentColor: '#10B981',
        cssVariables: {},
      },
      audio: basicEnv.audio || {
        ambientTrack: basicEnv.audioUrl || '',
        musicTracks: [],
        soundEffects: {},
        defaultVolume: 0.5,
      },
      visuals: basicEnv.visuals || {
        backgroundImage: basicEnv.visualUrl || '',
        overlayElements: [],
        particleEffects: [],
      },
      unlockRequirements: basicEnv.unlockRequirements || [],
      createdAt: basicEnv.createdAt || new Date(),
      updatedAt: basicEnv.updatedAt || new Date(),
    };
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Load all available environments
   */
  async loadEnvironments(): Promise<Environment[]> {
    try {
      // In a real application, this would fetch from an API
      // For now, we'll use static data that matches what's in the store
      const environmentsData = await this.fetchEnvironmentsData();

      // Validate and convert each environment
      const validEnvironments: Environment[] = [];
      for (const envData of environmentsData) {
        const validation = this.validateEnvironment(envData);
        if (validation.isValid && isEnvironment(envData)) {
          const fullEnvironment = this.convertToFullEnvironment(envData);
          validEnvironments.push(fullEnvironment);
        } else {
          console.warn('Invalid environment data:', envData, validation.errors);
        }
      }

      this.environments = validEnvironments;
      return validEnvironments;
    } catch (error) {
      console.error('Error loading environments:', error);
      throw new Error('Failed to load environments');
    }
  }

  /**
   * Load a specific environment by ID
   */
  async loadEnvironment(environmentId: string): Promise<Environment> {
    try {
      const environment = this.environments.find(
        env => env.id === environmentId
      );

      if (!environment) {
        // Try to fetch from data source
        const environmentData = await this.fetchEnvironmentById(environmentId);
        const validation = this.validateEnvironment(environmentData);

        if (!validation.isValid || !isEnvironment(environmentData)) {
          throw new Error(
            `Invalid environment data: ${validation.errors.join(', ')}`
          );
        }

        // Convert and add to local cache
        const fullEnvironment = this.convertToFullEnvironment(environmentData);
        this.environments.push(fullEnvironment);
        return fullEnvironment;
      }

      return environment;
    } catch (error) {
      console.error(`Error loading environment ${environmentId}:`, error);
      throw new Error(`Failed to load environment: ${environmentId}`);
    }
  }

  /**
   * Switch to a different environment
   */
  async switchEnvironment(environmentId: string): Promise<void> {
    try {
      const environment = this.environments.find(
        env => env.id === environmentId
      );

      if (!environment) {
        throw new Error(`Environment not found: ${environmentId}`);
      }

      // Apply theme CSS variables
      this.applyEnvironmentTheme(environment);

      // Update current environment
      this.currentEnvironment = environment;

      console.log(`Switched to environment: ${environment.name}`);
    } catch (error) {
      console.error('Error switching environment:', error);
      throw error;
    }
  }

  /**
   * Preload assets for multiple environments
   */
  async preloadEnvironments(environmentIds: string[]): Promise<void> {
    try {
      const preloadPromises = environmentIds.map(id =>
        this.preloadEnvironmentAssets(id)
      );
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.error('Error preloading environments:', error);
      throw new Error('Failed to preload environment assets');
    }
  }

  /**
   * Get the currently active environment
   */
  getCurrentEnvironment(): Environment | null {
    return this.currentEnvironment;
  }

  /**
   * Get all available environments
   */
  getAvailableEnvironments(): Environment[] {
    return [...this.environments];
  }

  /**
   * Unlock an environment for the user
   */
  async unlockEnvironment(environmentId: string): Promise<boolean> {
    try {
      const environment = await this.loadEnvironment(environmentId);

      if (!environment.unlockRequirements) {
        return true; // Already unlocked or no requirements
      }

      // Check unlock requirements
      const canUnlock = await this.checkUnlockRequirements(
        environment.unlockRequirements
      );

      if (canUnlock) {
        // In a real app, this would update the backend
        console.log(`Environment unlocked: ${environmentId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error unlocking environment ${environmentId}:`, error);
      throw new Error(`Failed to unlock environment: ${environmentId}`);
    }
  }

  /**
   * Apply environment theme to the document
   */
  private applyEnvironmentTheme(environment: Environment): void {
    try {
      const root = document.documentElement;

      // Apply CSS variables
      Object.entries(environment.theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Apply background image if available
      if (environment.visuals.backgroundImage) {
        root.style.setProperty(
          '--env-background-image',
          `url(${environment.visuals.backgroundImage})`
        );
      }
    } catch (error) {
      console.error('Error applying environment theme:', error);
    }
  }

  /**
   * Preload assets for a specific environment
   */
  async preloadEnvironmentAssets(environmentId: string): Promise<void> {
    try {
      if (this.preloadedAssets.has(environmentId)) {
        return; // Already preloaded
      }

      const environment = await this.loadEnvironment(environmentId);
      const preloadPromises: Promise<void>[] = [];

      // Preload background image
      if (environment.visuals.backgroundImage) {
        preloadPromises.push(
          this.preloadImage(environment.visuals.backgroundImage)
        );
      }

      // Note: backgroundVideo is not part of the Environment interface
      // If needed, it should be added to the visuals interface

      // Preload overlay element images
      environment.visuals.overlayElements?.forEach(element => {
        if (element.type === 'image') {
          preloadPromises.push(this.preloadImage(element.src));
        }
      });

      // Preload audio files
      if (environment.audio.ambientTrack) {
        preloadPromises.push(
          this.preloadAudio(
            `/audio/ambient/${environment.audio.ambientTrack}.mp3`
          )
        );
      }

      // Preload sound effects
      Object.values(environment.audio.soundEffects).forEach(soundUrl => {
        preloadPromises.push(this.preloadAudio(soundUrl));
      });

      await Promise.allSettled(preloadPromises);
      this.preloadedAssets.add(environmentId);

      console.log(`Preloaded assets for environment: ${environmentId}`);
    } catch (error) {
      console.error(`Error preloading assets for ${environmentId}:`, error);
    }
  }

  /**
   * Preload an image
   */
  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  /**
   * Preload a video
   */
  private preloadVideo(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
      video.src = src;
      video.preload = 'metadata';
    });
  }

  /**
   * Preload an audio file
   */
  private preloadAudio(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
      audio.src = src;
      audio.preload = 'auto';
    });
  }

  /**
   * Check if unlock requirements are met
   */
  private async checkUnlockRequirements(
    requirements: UnlockRequirement[]
  ): Promise<boolean> {
    try {
      // In a real app, this would check against user data from the backend
      // For now, we'll simulate the check
      for (const requirement of requirements) {
        switch (requirement.type) {
          case 'coins':
            // Check user's coin balance
            console.log(`Checking coins requirement: ${requirement.target}`);
            break;
          case 'level':
            // Check user's level
            console.log(`Checking level requirement: ${requirement.target}`);
            break;
          case 'study_hours':
            // Check user's total study hours
            console.log(
              `Checking study hours requirement: ${requirement.target}`
            );
            break;
          case 'streak_days':
            // Check user's streak days
            console.log(`Checking streak requirement: ${requirement.target}`);
            break;
          case 'achievement':
            // Check if user has specific achievement
            console.log(
              `Checking achievement requirement: ${requirement.target}`
            );
            break;
          default:
            console.warn(`Unknown requirement type: ${requirement.type}`);
        }
      }

      // For demo purposes, return true
      return true;
    } catch (error) {
      console.error('Error checking unlock requirements:', error);
      return false;
    }
  }

  /**
   * Fetch environments data (simulated API call)
   */
  private async fetchEnvironmentsData(): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return [
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
      {
        id: 'mountain',
        name: 'Mountain Peak',
        category: 'premium',
        theme: {
          primaryColor: '#7C3AED',
          secondaryColor: '#5B21B6',
          backgroundColor: '#F3F4F6',
          textColor: '#374151',
          accentColor: '#EF4444',
          cssVariables: {
            '--env-primary': '#7C3AED',
            '--env-secondary': '#5B21B6',
            '--env-bg': '#F3F4F6',
            '--env-text': '#374151',
            '--env-accent': '#EF4444',
          },
        },
        audio: {
          ambientTrack: 'mountain-ambient',
          musicTracks: [],
          soundEffects: {
            'wind-howl': '/sounds/wind-howl.mp3',
            'eagle-cry': '/sounds/eagle-cry.mp3',
          },
          defaultVolume: 0.4,
        },
        visuals: {
          backgroundImage: '/environments/mountain-bg.jpg',
          overlayElements: [],
          particleEffects: [
            {
              type: 'snow',
              count: 50,
              speed: 0.5,
              size: { min: 2, max: 6 },
              color: '#FFFFFF',
            },
          ],
        },
        unlockRequirements: [
          {
            type: 'level',
            target: 10,
            current: 0,
            description: 'Reach level 10 to unlock',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'beach',
        name: 'Tropical Beach',
        category: 'premium',
        theme: {
          primaryColor: '#0EA5E9',
          secondaryColor: '#0284C7',
          backgroundColor: '#F0F9FF',
          textColor: '#0C4A6E',
          accentColor: '#F59E0B',
          cssVariables: {
            '--env-primary': '#0EA5E9',
            '--env-secondary': '#0284C7',
            '--env-bg': '#F0F9FF',
            '--env-text': '#0C4A6E',
            '--env-accent': '#F59E0B',
          },
        },
        audio: {
          ambientTrack: 'beach-ambient',
          musicTracks: [],
          soundEffects: {
            'waves-crash': '/sounds/waves-crash.mp3',
            seagulls: '/sounds/seagulls.mp3',
          },
          defaultVolume: 0.6,
        },
        visuals: {
          backgroundImage: '/environments/beach-bg.jpg',
          overlayElements: [],
          particleEffects: [],
        },
        unlockRequirements: [
          {
            type: 'streak',
            target: 7,
            current: 0,
            description: 'Maintain a 7-day study streak to unlock',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Fetch a specific environment by ID (simulated API call)
   */
  private async fetchEnvironmentById(environmentId: string): Promise<any> {
    const environments = await this.fetchEnvironmentsData();
    const environment = environments.find(env => env.id === environmentId);

    if (!environment) {
      throw new Error(`Environment not found: ${environmentId}`);
    }

    return environment;
  }

  /**
   * Customize environment settings
   */
  async customizeEnvironment(
    environmentId: string,
    customizations: EnvironmentCustomization
  ): Promise<void> {
    const environment = await this.loadEnvironment(environmentId);

    // Apply customizations to the environment
    if (customizations.customAudio) {
      environment.audio = {
        ...environment.audio,
        ...customizations.customAudio,
      };
    }

    if (customizations.customVisuals) {
      environment.visuals = {
        ...environment.visuals,
        ...customizations.customVisuals,
      };
    }

    // Update the current environment if it's the one being customized
    if (this.currentEnvironment?.id === environmentId) {
      this.currentEnvironment = environment;
    }

    // Update the environment in the environments array
    const index = this.environments.findIndex(env => env.id === environmentId);
    if (index !== -1) {
      this.environments[index] = environment;
    }
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment(environment: any): {
    isValid: boolean;
    errors: string[];
  } {
    try {
      // Use the isEnvironment guard function instead
      const isValid = isEnvironment(environment);
      const errors: string[] = [];

      if (!isValid) {
        if (!environment?.id) errors.push('Missing id');
        if (!environment?.name) errors.push('Missing name');
        if (!environment?.type) errors.push('Missing type');
        if (typeof environment?.isUnlocked !== 'boolean')
          errors.push('Missing or invalid isUnlocked');
      }

      return { isValid, errors };
    } catch (error) {
      return { isValid: false, errors: ['Validation error: ' + String(error)] };
    }
  }

  /**
   * Get preloaded asset status
   */
  isEnvironmentPreloaded(environmentId: string): boolean {
    return this.preloadedAssets.has(environmentId);
  }

  /**
   * Clear preloaded assets cache
   */
  clearPreloadedAssets(): void {
    this.preloadedAssets.clear();
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.clearPreloadedAssets();
  }
}

// Create and export a singleton instance
export const environmentService = new EnvironmentManagerService();
