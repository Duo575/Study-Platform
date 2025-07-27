import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { useEnvironmentStore } from '../../store/environmentStore';
import { audioService } from '../../services/audioService';
import type { MusicTrack } from '../../types';

interface MusicPlayerProps {
  className?: string;
  compact?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  className = '',
  compact = false,
}) => {
  const {
    currentTrack,
    isPlaying,
    playbackPosition,
    audioSettings,
    playMusic,
    pauseMusic,
    resumeMusic,
    stopMusic,
    setPlaybackPosition,
    updateAudioSettings,
  } = useEnvironmentStore();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(audioSettings.musicVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Mock playlist for demo
  const [playlist] = useState<MusicTrack[]>([
    {
      id: 'lofi-1',
      title: 'Peaceful Study',
      artist: 'Lo-Fi Collective',
      duration: 180,
      url: '/audio/music/lofi-1.mp3',
      genre: 'lofi',
      mood: 'calm',
    },
    {
      id: 'lofi-2',
      title: 'Focus Flow',
      artist: 'Study Beats',
      duration: 210,
      url: '/audio/music/lofi-2.mp3',
      genre: 'lofi',
      mood: 'focused',
    },
    {
      id: 'ambient-1',
      title: 'Forest Whispers',
      artist: 'Nature Sounds',
      duration: 240,
      url: '/audio/music/ambient-1.mp3',
      genre: 'ambient',
      mood: 'relaxing',
    },
  ]);

  // Update current time periodically when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        const position = audioService.getCurrentPosition();
        setCurrentTime(position);
        setPlaybackPosition(position);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentTrack, setPlaybackPosition]);

  // Update duration when track changes
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration);
    }
  }, [currentTrack]);

  // Update volume when settings change
  useEffect(() => {
    setVolume(audioSettings.musicVolume);
  }, [audioSettings.musicVolume]);

  const handlePlayPause = async () => {
    try {
      if (!currentTrack) {
        // Start playing first track in playlist
        if (playlist.length > 0) {
          await playMusic(playlist[0].id);
        }
      } else if (isPlaying) {
        pauseMusic();
      } else {
        resumeMusic();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleStop = () => {
    stopMusic();
    setCurrentTime(0);
  };

  const handlePrevious = async () => {
    if (!currentTrack) return;

    const currentIndex = playlist.findIndex(
      track => track.id === currentTrack.id
    );
    if (currentIndex > 0) {
      await playMusic(playlist[currentIndex - 1].id);
    }
  };

  const handleNext = async () => {
    if (!currentTrack) return;

    const currentIndex = playlist.findIndex(
      track => track.id === currentTrack.id
    );
    if (currentIndex < playlist.length - 1) {
      await playMusic(playlist[currentIndex + 1].id);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    audioService.setPosition(newTime);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    updateAudioSettings({ musicVolume: newVolume });
    audioService.setMusicVolume(newVolume);

    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      updateAudioSettings({ musicVolume: volume });
      audioService.setMusicVolume(volume);
      setIsMuted(false);
    } else {
      updateAudioSettings({ musicVolume: 0 });
      audioService.setMusicVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div
        className={`music-player-compact flex items-center space-x-2 ${className}`}
      >
        <button
          onClick={handlePlayPause}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="w-4 h-4" />
          ) : (
            <PlayIcon className="w-4 h-4" />
          )}
        </button>

        {currentTrack && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {currentTrack.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {currentTrack.artist}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`music-player bg-white rounded-lg shadow-lg p-4 ${className}`}
    >
      {/* Track Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <MusicalNoteIcon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {currentTrack?.title || 'No track selected'}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {currentTrack?.artist || 'Select a track to play'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {currentTrack && (
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={handlePrevious}
          disabled={!currentTrack}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <BackwardIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={handlePlayPause}
          className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={!currentTrack}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ForwardIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleMuteToggle}
          onMouseEnter={() => setShowVolumeSlider(true)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
        >
          {isMuted || volume === 0 ? (
            <SpeakerXMarkIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <SpeakerWaveIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div
          className={`flex-1 transition-opacity duration-200 ${
            showVolumeSlider ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <span className="text-xs text-gray-500 w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {/* Playlist Preview */}
      {playlist.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Playlist</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {playlist.map(track => (
              <button
                key={track.id}
                onClick={() => playMusic(track.id)}
                className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-100 transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <div className="truncate">{track.title}</div>
                <div className="text-xs text-gray-400 truncate">
                  {track.artist}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
