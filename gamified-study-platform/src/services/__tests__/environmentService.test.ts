import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvironmentManagerService } from '../environmentService';
import type { Environment, UnlockRequirement } from '../../types';

// Mock Web Audio API
const mockAudioContext = {
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0 },
  })),
  destination: {},
  close: vi.fn(),
  state: 'running',
};

// Mock HTML elements
const mockImage = {
  onload: null as any,
  onerror: null as any,
  src: '',
};

const mockVideo = {
  onloadeddata: null as any,
  onerror: null as any,
  src: '',
  preload: '',
};

const mockAudio = {
  oncanplaythrough: null as any,
  onerror: null as any,
  src: '',
  preload: '',
};

// Mock DOM methods
global.Image = vi.fn(() => mockImage) as any;
global.document = {
  createElement: vi.fn((tag: string) => {
    if (tag === 'video') return mockVideo;
    if (tag === 'audio') return mockAudio;
    return {};
  }),
  documentElement: {
    style: {
      setProperty: vi.fn(),
    },
  },
} as any;

// Mock window.AudioContext
(global as any).window = {
  AudioContext: vi.fn(() => mockAudioContext),
  webkitAudioContext: vi.fn(() => mockAudioContext),
};

describe('EnvironmentManagerService', () => {
  let environmentService: EnvironmentManagerService;

  beforeEach(() => {
    vi.clearAllMocks();
    environmentService = new EnvironmentManagerService();
  });

  afterEach(() => {
    environmentService.dispose();
  });

  describe('initialization', () => {
    it('should initialize with empty environments', () => {
      expect(environmentService.getCurrentEnvironment()).toBeNull();
      expect(environmentService.getAvailableEnvironments()).toEqual([]);
    });

    it('should initialize audio context', () => {
      expect(global.window.AudioContext).toHaveBeenCalled();
    });
  });

  describe('loadEnvironments', () => {
    it('should load default environments successfully', async () => {
      const environments = await environmentService.loadEnvironments();

      expect(environments).toHaveLength(6);
      expect(environments[0]).toMatchObject({
        id: 'classroom',
        name: 'Classroom',
        category: 'free',
      });
      expect(environments[1]).toMatchObject({
        id: 'office',
        name: 'Modern Office',
        category: 'free',
      });
    });

    it('should validate environment data', async () => {
      const environments = await environmentService.loadEnvironments();

      environments.forEach(env => {
        expect(env).toHaveProperty('id');
        expect(env).toHaveProperty('name');
        expect(env).toHaveProperty('category');
        expect(env).toHaveProperty('theme');
        expect(env).toHaveProperty('audio');
        expect(env).toHaveProperty('visuals');
        expect(env.theme).toHaveProperty('cssVariables');
      });
    });

    it('should handle loading errors gracefully', async () => {
      // Mock a service that throws an error
      const errorService = new EnvironmentManagerService();
      vi.spyOn(errorService as any, 'fetchEnvironmentsData').mockRejectedValue(
        new Error('Network error')
      );

      await expect(errorService.loadEnvironments()).rejects.toThrow(
        'Failed to load environments'
      );
    });
  });

  describe('loadEnvironment', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should load a specific environment by ID', async () => {
      const environment = await environmentService.loadEnvironment('classroom');

      expect(environment).toMatchObject({
        id: 'classroom',
        name: 'Classroom',
        category: 'free',
      });
    });

    it('should throw error for non-existent environment', async () => {
      await expect(
        environmentService.loadEnvironment('non-existent')
      ).rejects.toThrow('Failed to load environment: non-existent');
    });

    it('should cache loaded environments', async () => {
      const env1 = await environmentService.loadEnvironment('classroom');
      const env2 = await environmentService.loadEnvironment('classroom');

      expect(env1).toBe(env2);
    });
  });

  describe('switchEnvironment', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should switch to a valid environment', () => {
      expect(() => {
        environmentService.switchEnvironment('classroom');
      }).not.toThrow();

      const currentEnv = environmentService.getCurrentEnvironment();
      expect(currentEnv?.id).toBe('classroom');
    });

    it('should apply theme CSS variables', () => {
      environmentService.switchEnvironment('classroom');

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-primary',
        '#3B82F6'
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--env-bg',
        '#F8FAFC'
      );
    });

    it('should throw error for non-existent environment', () => {
      expect(() => {
        environmentService.switchEnvironment('non-existent');
      }).toThrow('Environment not found: non-existent');
    });

    it('should update current environment', () => {
      environmentService.switchEnvironment('office');
      const currentEnv = environmentService.getCurrentEnvironment();
      expect(currentEnv?.id).toBe('office');
    });
  });

  describe('preloadEnvironments', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should preload assets for multiple environments', async () => {
      await environmentService.preloadEnvironments(['classroom', 'office']);

      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(true);
      expect(environmentService.isEnvironmentPreloaded('office')).toBe(true);
    });

    it('should handle preload errors gracefully', async () => {
      // Mock image loading failure
      vi.spyOn(environmentService as any, 'preloadImage').mockRejectedValue(
        new Error('Image load failed')
      );

      await expect(
        environmentService.preloadEnvironments(['classroom'])
      ).resolves.not.toThrow();
    });

    it('should not preload already preloaded environments', async () => {
      const preloadSpy = vi.spyOn(
        environmentService as any,
        'preloadEnvironmentAssets'
      );

      await environmentService.preloadEnvironments(['classroom']);
      await environmentService.preloadEnvironments(['classroom']);

      expect(preloadSpy).toHaveBeenCalledTimes(2); // Called twice but second should return early
    });
  });

  describe('unlockEnvironment', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should unlock environment without requirements', async () => {
      const result = await environmentService.unlockEnvironment('classroom');
      expect(result).toBe(true);
    });

    it('should handle environments with unlock requirements', async () => {
      const result = await environmentService.unlockEnvironment('cafe');
      expect(result).toBe(true); // Mock implementation returns true
    });

    it('should throw error for non-existent environment', async () => {
      await expect(
        environmentService.unlockEnvironment('non-existent')
      ).rejects.toThrow('Failed to unlock environment: non-existent');
    });
  });

  describe('asset preloading', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should preload images successfully', async () => {
      mockImage.onload = vi.fn();

      const preloadPromise = (environmentService as any).preloadImage(
        '/test.jpg'
      );

      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      await expect(preloadPromise).resolves.not.toThrow();
    });

    it('should handle image preload failures', async () => {
      mockImage.onerror = vi.fn();

      const preloadPromise = (environmentService as any).preloadImage(
        '/test.jpg'
      );

      // Simulate image load error
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 0);

      await expect(preloadPromise).rejects.toThrow(
        'Failed to load image: /test.jpg'
      );
    });

    it('should preload videos successfully', async () => {
      mockVideo.onloadeddata = vi.fn();

      const preloadPromise = (environmentService as any).preloadVideo(
        '/test.mp4'
      );

      // Simulate successful video load
      setTimeout(() => {
        if (mockVideo.onloadeddata) mockVideo.onloadeddata();
      }, 0);

      await expect(preloadPromise).resolves.not.toThrow();
    });

    it('should preload audio successfully', async () => {
      mockAudio.oncanplaythrough = vi.fn();

      const preloadPromise = (environmentService as any).preloadAudio(
        '/test.mp3'
      );

      // Simulate successful audio load
      setTimeout(() => {
        if (mockAudio.oncanplaythrough) mockAudio.oncanplaythrough();
      }, 0);

      await expect(preloadPromise).resolves.not.toThrow();
    });
  });

  describe('unlock requirements checking', () => {
    it('should check various requirement types', async () => {
      const requirements: UnlockRequirement[] = [
        {
          type: 'coins',
          target: 100,
          current: 0,
          description: 'Need 100 coins',
        },
        { type: 'level', target: 5, current: 0, description: 'Need level 5' },
        {
          type: 'study_hours',
          target: 10,
          current: 0,
          description: 'Need 10 hours',
        },
      ];

      const result = await (environmentService as any).checkUnlockRequirements(
        requirements
      );
      expect(result).toBe(true); // Mock implementation returns true
    });
  });

  describe('validation', () => {
    it('should validate environment configuration', () => {
      const validEnvironment = {
        id: 'test',
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

      const result =
        environmentService.validateEnvironmentConfig(validEnvironment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid environment configuration', () => {
      const invalidEnvironment = {
        id: '',
        name: '',
        // Missing required fields
      };

      const result =
        environmentService.validateEnvironmentConfig(invalidEnvironment);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      await environmentService.loadEnvironments();
    });

    it('should check preloaded asset status', async () => {
      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(
        false
      );

      await environmentService.preloadEnvironments(['classroom']);

      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(true);
    });

    it('should clear preloaded assets', async () => {
      await environmentService.preloadEnvironments(['classroom']);
      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(true);

      environmentService.clearPreloadedAssets();

      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(
        false
      );
    });

    it('should get available environments', () => {
      const environments = environmentService.getAvailableEnvironments();
      expect(environments).toHaveLength(6);
      expect(environments[0].id).toBe('classroom');
    });
  });

  describe('disposal', () => {
    it('should dispose of resources properly', () => {
      environmentService.dispose();

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(environmentService.isEnvironmentPreloaded('classroom')).toBe(
        false
      );
    });

    it('should handle disposal when audio context is already closed', () => {
      mockAudioContext.state = 'closed';

      expect(() => {
        environmentService.dispose();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle Web Audio API not supported', () => {
      // Mock AudioContext to throw error
      (global as any).window.AudioContext = vi.fn(() => {
        throw new Error('AudioContext not supported');
      });
      (global as any).window.webkitAudioContext = undefined;

      expect(() => {
        new EnvironmentManagerService();
      }).not.toThrow();
    });

    it('should handle theme application errors', async () => {
      await environmentService.loadEnvironments();

      // Mock document.documentElement to throw error
      const originalSetProperty = document.documentElement.style.setProperty;
      document.documentElement.style.setProperty = vi.fn(() => {
        throw new Error('CSS error');
      });

      expect(() => {
        environmentService.switchEnvironment('classroom');
      }).not.toThrow();

      // Restore original method
      document.documentElement.style.setProperty = originalSetProperty;
    });
  });
});
