import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManagerService } from '../audioService';
import type { AudioSettings, MusicTrack } from '../../types';

// Mock Web Audio API
const mockGainNode = {
  connect: vi.fn(),
  gain: { value: 0 },
};

const mockAudioContext = {
  createGain: vi.fn(() => mockGainNode),
  destination: {},
  close: vi.fn(),
  state: 'running',
};

// Mock HTML Audio elements
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
};

// Mock Audio constructor
global.Audio = vi.fn(() => ({ ...mockAudioElement })) as any;

// Mock window.AudioContext
(global as any).window = {
  AudioContext: vi.fn(() => mockAudioContext),
  webkitAudioContext: vi.fn(() => mockAudioContext),
};

describe('AudioManagerService', () => {
  let audioService: AudioManagerService;
  let mockAmbientAudio: any;
  let mockMusicAudio: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Audio mock to return fresh instances
    let audioCallCount = 0;
    global.Audio = vi.fn(() => {
      audioCallCount++;
      const audio = { ...mockAudioElement };
      if (audioCallCount === 1) {
        mockAmbientAudio = audio;
      } else if (audioCallCount === 2) {
        mockMusicAudio = audio;
      }
      return audio;
    }) as any;

    audioService = new AudioManagerService();
  });

  afterEach(() => {
    audioService.dispose();
  });

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      const settings = audioService.getSettings();

      expect(settings).toMatchObject({
        masterVolume: 0.7,
        ambientVolume: 0.5,
        musicVolume: 0.6,
        soundEffectsVolume: 0.8,
        autoPlay: true,
      });
    });

    it('should initialize with custom settings', () => {
      const customSettings: Partial<AudioSettings> = {
        masterVolume: 0.8,
        musicVolume: 0.4,
        autoPlay: false,
      };

      const customAudioService = new AudioManagerService(customSettings);
      const settings = customAudioService.getSettings();

      expect(settings.masterVolume).toBe(0.8);
      expect(settings.musicVolume).toBe(0.4);
      expect(settings.autoPlay).toBe(false);
      expect(settings.ambientVolume).toBe(0.5); // Default value

      customAudioService.dispose();
    });

    it('should initialize audio context and gain nodes', () => {
      expect(global.window.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(4); // master, ambient, music, effects
      expect(mockGainNode.connect).toHaveBeenCalled();
    });

    it('should handle Web Audio API not supported', () => {
      // Mock AudioContext to throw error
      (global as any).window.AudioContext = vi.fn(() => {
        throw new Error('AudioContext not supported');
      });
      (global as any).window.webkitAudioContext = undefined;

      expect(() => {
        new AudioManagerService();
      }).not.toThrow();
    });
  });

  describe('ambient sound management', () => {
    it('should play ambient sound', () => {
      audioService.playAmbientSound('forest-ambient');

      expect(mockAmbientAudio.src).toBe('/audio/ambient/forest-ambient.mp3');
      expect(mockAmbientAudio.loop).toBe(true);
      expect(mockAmbientAudio.play).toHaveBeenCalled();
    });

    it('should set ambient sound volume', () => {
      audioService.playAmbientSound('forest-ambient', 0.3);

      expect(mockAmbientAudio.volume).toBe(0.3);
    });

    it('should use default volume when not specified', () => {
      audioService.playAmbientSound('forest-ambient');

      expect(mockAmbientAudio.volume).toBe(0.35); // ambientVolume * masterVolume = 0.5 * 0.7
    });

    it('should stop ambient sound', () => {
      audioService.playAmbientSound('forest-ambient');
      audioService.stopAmbientSound();

      expect(mockAmbientAudio.pause).toHaveBeenCalled();
      expect(mockAmbientAudio.currentTime).toBe(0);
    });

    it('should handle ambient sound play errors', () => {
      mockAmbientAudio.play.mockRejectedValue(new Error('Play failed'));

      expect(() => {
        audioService.playAmbientSound('forest-ambient');
      }).not.toThrow();
    });

    it('should check if ambient sound is playing', () => {
      mockAmbientAudio.paused = false;
      expect(audioService.isAmbientPlaying()).toBe(true);

      mockAmbientAudio.paused = true;
      expect(audioService.isAmbientPlaying()).toBe(false);
    });
  });

  describe('music management', () => {
    const mockTrack: MusicTrack = {
      id: 'lofi-track-1',
      title: 'Chill Lofi Beat',
      duration: 180,
      url: '/audio/music/lofi-track-1.mp3',
      genre: 'lofi',
      mood: 'focused',
    };

    it('should play music track', async () => {
      await audioService.playMusic('lofi-track-1');

      expect(mockMusicAudio.src).toBe('/audio/music/lofi-track-1.mp3');
      expect(mockMusicAudio.play).toHaveBeenCalled();
      expect(audioService.getCurrentTrack()).toMatchObject({
        id: 'lofi-track-1',
        title: 'Track lofi-track-1',
      });
    });

    it('should play music from playlist', async () => {
      audioService.setPlaylist([mockTrack]);
      await audioService.playMusic('lofi-track-1');

      expect(audioService.getCurrentTrack()).toEqual(mockTrack);
    });

    it('should set music volume', async () => {
      await audioService.playMusic('lofi-track-1', 0.4);

      expect(mockMusicAudio.volume).toBe(0.4);
    });

    it('should use default volume when not specified', async () => {
      await audioService.playMusic('lofi-track-1');

      expect(mockMusicAudio.volume).toBe(0.42); // musicVolume * masterVolume = 0.6 * 0.7
    });

    it('should stop music', () => {
      audioService.stopMusic();

      expect(mockMusicAudio.pause).toHaveBeenCalled();
      expect(mockMusicAudio.currentTime).toBe(0);
      expect(audioService.getCurrentTrack()).toBeNull();
    });

    it('should pause music', () => {
      mockMusicAudio.paused = false;
      audioService.pauseMusic();

      expect(mockMusicAudio.pause).toHaveBeenCalled();
    });

    it('should resume music', () => {
      mockMusicAudio.paused = true;
      audioService.resumeMusic();

      expect(mockMusicAudio.play).toHaveBeenCalled();
    });

    it('should handle music play errors', async () => {
      mockMusicAudio.play.mockRejectedValue(new Error('Play failed'));

      await expect(audioService.playMusic('lofi-track-1')).rejects.toThrow(
        'Failed to play music track: lofi-track-1'
      );
    });

    it('should check if music is playing', () => {
      mockMusicAudio.paused = false;
      expect(audioService.isPlaying()).toBe(true);

      mockMusicAudio.paused = true;
      expect(audioService.isPlaying()).toBe(false);
    });

    it('should get and set playback position', () => {
      mockMusicAudio.currentTime = 60;
      expect(audioService.getCurrentPosition()).toBe(60);

      audioService.setPosition(90);
      expect(mockMusicAudio.currentTime).toBe(90);
    });

    it('should clamp position to track duration', () => {
      const track: MusicTrack = {
        id: 'test',
        title: 'Test',
        duration: 120,
        url: '/test.mp3',
        genre: 'lofi',
        mood: 'focused',
      };

      audioService.setPlaylist([track]);
      audioService.setPosition(150); // Beyond duration

      expect(mockMusicAudio.currentTime).toBe(120);
    });
  });

  describe('volume management', () => {
    it('should set master volume', () => {
      audioService.setMasterVolume(0.8);

      const settings = audioService.getSettings();
      expect(settings.masterVolume).toBe(0.8);
      expect(mockGainNode.gain.value).toBe(0.8);
    });

    it('should set ambient volume', () => {
      audioService.setAmbientVolume(0.3);

      const settings = audioService.getSettings();
      expect(settings.ambientVolume).toBe(0.3);
    });

    it('should set music volume', () => {
      audioService.setMusicVolume(0.4);

      const settings = audioService.getSettings();
      expect(settings.musicVolume).toBe(0.4);
    });

    it('should clamp volume values to 0-1 range', () => {
      audioService.setMasterVolume(1.5);
      expect(audioService.getSettings().masterVolume).toBe(1);

      audioService.setMasterVolume(-0.5);
      expect(audioService.getSettings().masterVolume).toBe(0);
    });

    it('should update audio element volumes when master volume changes', () => {
      audioService.playAmbientSound('test');
      audioService.setMasterVolume(0.5);

      expect(mockAmbientAudio.volume).toBe(0.25); // ambientVolume * masterVolume = 0.5 * 0.5
    });
  });

  describe('playlist management', () => {
    const mockPlaylist: MusicTrack[] = [
      {
        id: 'track-1',
        title: 'Track 1',
        duration: 180,
        url: '/track1.mp3',
        genre: 'lofi',
        mood: 'focused',
      },
      {
        id: 'track-2',
        title: 'Track 2',
        duration: 200,
        url: '/track2.mp3',
        genre: 'ambient',
        mood: 'relaxing',
      },
    ];

    it('should set playlist', () => {
      audioService.setPlaylist(mockPlaylist);

      expect(audioService.getPlaylist()).toEqual(mockPlaylist);
    });

    it('should add track to playlist', () => {
      const newTrack: MusicTrack = {
        id: 'track-3',
        title: 'Track 3',
        duration: 160,
        url: '/track3.mp3',
        genre: 'classical',
        mood: 'calm',
      };

      audioService.addToPlaylist(newTrack);

      const playlist = audioService.getPlaylist();
      expect(playlist).toContain(newTrack);
    });

    it('should not add duplicate tracks to playlist', () => {
      audioService.setPlaylist(mockPlaylist);
      audioService.addToPlaylist(mockPlaylist[0]);

      const playlist = audioService.getPlaylist();
      expect(playlist.filter(t => t.id === 'track-1')).toHaveLength(1);
    });

    it('should remove track from playlist', () => {
      audioService.setPlaylist(mockPlaylist);
      audioService.removeFromPlaylist('track-1');

      const playlist = audioService.getPlaylist();
      expect(playlist.find(t => t.id === 'track-1')).toBeUndefined();
      expect(playlist).toHaveLength(1);
    });
  });

  describe('crossfading', () => {
    it('should crossfade between tracks', async () => {
      const track1: MusicTrack = {
        id: 'track-1',
        title: 'Track 1',
        duration: 180,
        url: '/track1.mp3',
        genre: 'lofi',
        mood: 'focused',
      };

      audioService.setPlaylist([track1]);
      await audioService.playMusic('track-1');

      // Mock the crossfade process
      const crossfadePromise = audioService.crossfade(
        'track-1',
        'track-2',
        100
      );

      await expect(crossfadePromise).resolves.not.toThrow();
    });

    it('should handle crossfade errors', async () => {
      mockMusicAudio.play.mockRejectedValue(new Error('Play failed'));

      await expect(
        audioService.crossfade('track-1', 'track-2', 100)
      ).rejects.toThrow('Failed to crossfade tracks');
    });
  });

  describe('sound effects', () => {
    it('should play sound effect', async () => {
      const mockEffectAudio = { ...mockAudioElement };
      global.Audio = vi.fn(() => mockEffectAudio) as any;

      await audioService.playSoundEffect('click');

      expect(mockEffectAudio.src).toBe('/audio/effects/click.mp3');
      expect(mockEffectAudio.play).toHaveBeenCalled();
    });

    it('should set sound effect volume', async () => {
      const mockEffectAudio = { ...mockAudioElement };
      global.Audio = vi.fn(() => mockEffectAudio) as any;

      await audioService.playSoundEffect('click', 0.5);

      expect(mockEffectAudio.volume).toBe(0.5);
    });

    it('should use default volume for sound effects', async () => {
      const mockEffectAudio = { ...mockAudioElement };
      global.Audio = vi.fn(() => mockEffectAudio) as any;

      await audioService.playSoundEffect('click');

      expect(mockEffectAudio.volume).toBe(0.56); // soundEffectsVolume * masterVolume = 0.8 * 0.7
    });

    it('should handle sound effect play errors', async () => {
      const mockEffectAudio = { ...mockAudioElement };
      mockEffectAudio.play.mockRejectedValue(new Error('Play failed'));
      global.Audio = vi.fn(() => mockEffectAudio) as any;

      await expect(
        audioService.playSoundEffect('click')
      ).resolves.not.toThrow();
    });
  });

  describe('settings management', () => {
    it('should update settings', () => {
      const newSettings: Partial<AudioSettings> = {
        masterVolume: 0.9,
        autoPlay: false,
      };

      audioService.updateSettings(newSettings);

      const settings = audioService.getSettings();
      expect(settings.masterVolume).toBe(0.9);
      expect(settings.autoPlay).toBe(false);
      expect(settings.ambientVolume).toBe(0.5); // Unchanged
    });

    it('should apply volume changes when settings are updated', () => {
      audioService.playAmbientSound('test');

      audioService.updateSettings({ masterVolume: 0.5 });

      expect(mockAmbientAudio.volume).toBe(0.25); // ambientVolume * masterVolume = 0.5 * 0.5
    });
  });

  describe('event handling', () => {
    it('should setup audio event listeners', () => {
      expect(mockMusicAudio.addEventListener).toHaveBeenCalledWith(
        'ended',
        expect.any(Function)
      );
      expect(mockMusicAudio.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(mockAmbientAudio.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('should handle music track ending', async () => {
      const playlist: MusicTrack[] = [
        {
          id: 'track-1',
          title: 'Track 1',
          duration: 180,
          url: '/track1.mp3',
          genre: 'lofi',
          mood: 'focused',
        },
        {
          id: 'track-2',
          title: 'Track 2',
          duration: 200,
          url: '/track2.mp3',
          genre: 'ambient',
          mood: 'relaxing',
        },
      ];

      audioService.setPlaylist(playlist);
      await audioService.playMusic('track-1');

      // Simulate track ending
      const endedHandler = mockMusicAudio.addEventListener.mock.calls.find(
        call => call[0] === 'ended'
      )?.[1];

      if (endedHandler) {
        endedHandler();
        // Should attempt to play next track
        expect(mockMusicAudio.src).toBe('/audio/music/track-2.mp3');
      }
    });

    it('should handle audio errors', () => {
      const errorHandler = mockMusicAudio.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];

      const mockError = { target: { error: new Error('Audio error') } };

      expect(() => {
        if (errorHandler) errorHandler(mockError);
      }).not.toThrow();
    });
  });

  describe('disposal', () => {
    it('should dispose of resources properly', () => {
      audioService.dispose();

      expect(mockAudioContext.close).toHaveBeenCalled();
      expect(audioService.getCurrentTrack()).toBeNull();
      expect(audioService.getPlaylist()).toEqual([]);
    });

    it('should handle disposal when audio context is already closed', () => {
      mockAudioContext.state = 'closed';

      expect(() => {
        audioService.dispose();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle gain node setup errors', () => {
      mockAudioContext.createGain.mockImplementation(() => {
        throw new Error('Gain node error');
      });

      expect(() => {
        new AudioManagerService();
      }).not.toThrow();
    });

    it('should handle volume update errors', () => {
      // Mock gain node to throw error on value assignment
      Object.defineProperty(mockGainNode.gain, 'value', {
        set: () => {
          throw new Error('Gain value error');
        },
        get: () => 0,
      });

      expect(() => {
        audioService.setMasterVolume(0.5);
      }).not.toThrow();
    });

    it('should handle missing audio elements gracefully', () => {
      // Create service without proper audio elements
      const brokenService = new AudioManagerService();
      (brokenService as any).ambientAudio = null;
      (brokenService as any).musicAudio = null;

      expect(() => {
        brokenService.playAmbientSound('test');
        brokenService.stopMusic();
        brokenService.pauseMusic();
        brokenService.resumeMusic();
      }).not.toThrow();

      brokenService.dispose();
    });
  });
});
