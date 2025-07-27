import type { AudioManager, MusicTrack, AudioSettings } from '../types';

/**
 * Service for managing audio playback in focus environments
 */
export class AudioManagerService implements AudioManager {
  private audioContext: AudioContext | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  private musicAudio: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private playlist: MusicTrack[] = [];
  private settings: AudioSettings;
  private gainNodes: {
    master: GainNode | null;
    ambient: GainNode | null;
    music: GainNode | null;
    effects: GainNode | null;
  } = {
    master: null,
    ambient: null,
    music: null,
    effects: null,
  };

  constructor(initialSettings?: Partial<AudioSettings>) {
    this.settings = {
      masterVolume: 0.7,
      ambientVolume: 0.5,
      musicVolume: 0.6,
      soundEffectsVolume: 0.8,
      autoPlay: true,
      ...initialSettings,
    };

    this.initializeAudioContext();
    this.setupAudioElements();
  }

  /**
   * Initialize Web Audio API context and gain nodes
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.setupGainNodes();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Setup gain nodes for volume control
   */
  private setupGainNodes(): void {
    if (!this.audioContext) return;

    try {
      this.gainNodes.master = this.audioContext.createGain();
      this.gainNodes.ambient = this.audioContext.createGain();
      this.gainNodes.music = this.audioContext.createGain();
      this.gainNodes.effects = this.audioContext.createGain();

      // Connect gain nodes
      this.gainNodes.ambient.connect(this.gainNodes.master);
      this.gainNodes.music.connect(this.gainNodes.master);
      this.gainNodes.effects.connect(this.gainNodes.master);
      this.gainNodes.master.connect(this.audioContext.destination);

      // Set initial volumes
      this.updateGainNodeVolumes();
    } catch (error) {
      console.error('Error setting up gain nodes:', error);
    }
  }

  /**
   * Setup HTML audio elements
   */
  private setupAudioElements(): void {
    // Ambient audio element
    this.ambientAudio = new Audio();
    this.ambientAudio.loop = true;
    this.ambientAudio.preload = 'auto';

    // Music audio element
    this.musicAudio = new Audio();
    this.musicAudio.preload = 'auto';

    // Setup event listeners
    this.setupAudioEventListeners();
  }

  /**
   * Setup event listeners for audio elements
   */
  private setupAudioEventListeners(): void {
    if (this.musicAudio) {
      this.musicAudio.addEventListener(
        'ended',
        this.handleMusicEnded.bind(this)
      );
      this.musicAudio.addEventListener(
        'error',
        this.handleAudioError.bind(this)
      );
    }

    if (this.ambientAudio) {
      this.ambientAudio.addEventListener(
        'error',
        this.handleAudioError.bind(this)
      );
    }
  }

  /**
   * Handle music track ending
   */
  private handleMusicEnded(): void {
    // Auto-play next track if available
    const currentIndex = this.playlist.findIndex(
      track => track.id === this.currentTrack?.id
    );
    if (currentIndex !== -1 && currentIndex < this.playlist.length - 1) {
      const nextTrack = this.playlist[currentIndex + 1];
      this.playMusic(nextTrack.id);
    }
  }

  /**
   * Handle audio errors
   */
  private handleAudioError(event: Event): void {
    const target = event.target as HTMLAudioElement;
    console.error('Audio error:', target.error);
  }

  /**
   * Update gain node volumes based on settings
   */
  private updateGainNodeVolumes(): void {
    if (!this.gainNodes.master) return;

    try {
      this.gainNodes.master.gain.value = this.settings.masterVolume;
      this.gainNodes.ambient.gain.value = this.settings.ambientVolume;
      this.gainNodes.music.gain.value = this.settings.musicVolume;
      this.gainNodes.effects.gain.value = this.settings.soundEffectsVolume;
    } catch (error) {
      console.error('Error updating gain node volumes:', error);
    }
  }

  /**
   * Play ambient sound
   */
  playAmbientSound(trackId: string, volume?: number): void {
    try {
      if (!this.ambientAudio) return;

      const ambientUrl = `/audio/ambient/${trackId}.mp3`;

      if (this.ambientAudio.src !== ambientUrl) {
        this.ambientAudio.src = ambientUrl;
      }

      if (volume !== undefined) {
        this.ambientAudio.volume = Math.max(0, Math.min(1, volume));
      } else {
        this.ambientAudio.volume =
          this.settings.ambientVolume * this.settings.masterVolume;
      }

      this.ambientAudio.play().catch(error => {
        console.error('Error playing ambient sound:', error);
      });
    } catch (error) {
      console.error('Error setting up ambient sound:', error);
    }
  }

  /**
   * Play music track
   */
  async playMusic(trackId: string, volume?: number): Promise<void> {
    try {
      if (!this.musicAudio) return;

      // Find track in playlist or create a mock track
      let track = this.playlist.find(t => t.id === trackId);
      if (!track) {
        track = {
          id: trackId,
          title: `Track ${trackId}`,
          duration: 180,
          url: `/audio/music/${trackId}.mp3`,
          genre: 'lofi',
          mood: 'focused',
        };
      }

      this.currentTrack = track;
      this.musicAudio.src = track.url;

      if (volume !== undefined) {
        this.musicAudio.volume = Math.max(0, Math.min(1, volume));
      } else {
        this.musicAudio.volume =
          this.settings.musicVolume * this.settings.masterVolume;
      }

      await this.musicAudio.play();
    } catch (error) {
      console.error('Error playing music:', error);
      throw new Error(`Failed to play music track: ${trackId}`);
    }
  }

  /**
   * Stop ambient sound
   */
  stopAmbientSound(): void {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
      this.ambientAudio.currentTime = 0;
    }
  }

  /**
   * Stop music
   */
  stopMusic(): void {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
    this.currentTrack = null;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateGainNodeVolumes();
    this.updateAudioElementVolumes();
  }

  /**
   * Set ambient volume
   */
  setAmbientVolume(volume: number): void {
    this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateGainNodeVolumes();
    if (this.ambientAudio) {
      this.ambientAudio.volume =
        this.settings.ambientVolume * this.settings.masterVolume;
    }
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateGainNodeVolumes();
    if (this.musicAudio) {
      this.musicAudio.volume =
        this.settings.musicVolume * this.settings.masterVolume;
    }
  }

  /**
   * Update audio element volumes
   */
  private updateAudioElementVolumes(): void {
    if (this.ambientAudio) {
      this.ambientAudio.volume =
        this.settings.ambientVolume * this.settings.masterVolume;
    }
    if (this.musicAudio) {
      this.musicAudio.volume =
        this.settings.musicVolume * this.settings.masterVolume;
    }
  }

  /**
   * Crossfade between tracks
   */
  async crossfade(
    fromTrack: string,
    toTrack: string,
    duration: number = 2000
  ): Promise<void> {
    try {
      if (!this.musicAudio) return;

      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = this.settings.musicVolume / steps;

      // Fade out current track
      for (let i = steps; i >= 0; i--) {
        if (this.musicAudio) {
          this.musicAudio.volume = volumeStep * i * this.settings.masterVolume;
        }
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      // Switch to new track
      await this.playMusic(toTrack);

      // Fade in new track
      if (this.musicAudio) {
        this.musicAudio.volume = 0;
        for (let i = 0; i <= steps; i++) {
          if (this.musicAudio) {
            this.musicAudio.volume =
              volumeStep * i * this.settings.masterVolume;
          }
          await new Promise(resolve => setTimeout(resolve, stepDuration));
        }
      }
    } catch (error) {
      console.error('Error during crossfade:', error);
      throw new Error('Failed to crossfade tracks');
    }
  }

  /**
   * Get current track
   */
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Get current playlist
   */
  getPlaylist(): MusicTrack[] {
    return [...this.playlist];
  }

  /**
   * Set playlist
   */
  setPlaylist(tracks: MusicTrack[]): void {
    this.playlist = [...tracks];
  }

  /**
   * Add track to playlist
   */
  addToPlaylist(track: MusicTrack): void {
    const existingIndex = this.playlist.findIndex(t => t.id === track.id);
    if (existingIndex === -1) {
      this.playlist.push(track);
    }
  }

  /**
   * Remove track from playlist
   */
  removeFromPlaylist(trackId: string): void {
    this.playlist = this.playlist.filter(track => track.id !== trackId);
  }

  /**
   * Play sound effect
   */
  async playSoundEffect(soundId: string, volume?: number): Promise<void> {
    try {
      const audio = new Audio(`/audio/effects/${soundId}.mp3`);
      audio.volume =
        volume !== undefined
          ? Math.max(0, Math.min(1, volume))
          : this.settings.soundEffectsVolume * this.settings.masterVolume;

      await audio.play();
    } catch (error) {
      console.error('Error playing sound effect:', error);
    }
  }

  /**
   * Pause music
   */
  pauseMusic(): void {
    if (this.musicAudio && !this.musicAudio.paused) {
      this.musicAudio.pause();
    }
  }

  /**
   * Resume music
   */
  resumeMusic(): void {
    if (this.musicAudio && this.musicAudio.paused) {
      this.musicAudio.play().catch(error => {
        console.error('Error resuming music:', error);
      });
    }
  }

  /**
   * Get current playback position
   */
  getCurrentPosition(): number {
    return this.musicAudio?.currentTime || 0;
  }

  /**
   * Set playback position
   */
  setPosition(position: number): void {
    if (this.musicAudio && this.currentTrack) {
      this.musicAudio.currentTime = Math.max(
        0,
        Math.min(position, this.currentTrack.duration)
      );
    }
  }

  /**
   * Get audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateGainNodeVolumes();
    this.updateAudioElementVolumes();
  }

  /**
   * Check if music is playing
   */
  isPlaying(): boolean {
    return this.musicAudio ? !this.musicAudio.paused : false;
  }

  /**
   * Check if ambient sound is playing
   */
  isAmbientPlaying(): boolean {
    return this.ambientAudio ? !this.ambientAudio.paused : false;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopMusic();
    this.stopAmbientSound();

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    this.currentTrack = null;
    this.playlist = [];
  }
}

// Create and export a singleton instance
export const audioService = new AudioManagerService();
