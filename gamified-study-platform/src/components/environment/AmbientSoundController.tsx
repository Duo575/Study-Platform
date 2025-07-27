import React, { useEffect, useState } from 'react';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useEnvironment } from './EnvironmentProvider';
import { useEnvironmentStore } from '../../store/environmentStore';
import { audioService } from '../../services/audioService';

interface AmbientSoundControllerProps {
  className?: string;
  showVolumeControls?: boolean;
}

export const AmbientSoundController: React.FC<AmbientSoundControllerProps> = ({
  className = '',
  showVolumeControls = true,
}) => {
  const { currentEnvironment } = useEnvironment();
  const { audioSettings, updateAudioSettings } = useEnvironmentStore();

  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(
    audioSettings.ambientVolume
  );
  const [musicVolume, setMusicVolume] = useState(audioSettings.musicVolume);
  const [showMixer, setShowMixer] = useState(false);

  // Update local state when audio settings change
  useEffect(() => {
    setAmbientVolume(audioSettings.ambientVolume);
    setMusicVolume(audioSettings.musicVolume);
  }, [audioSettings]);

  // Handle environment changes
  useEffect(() => {
    if (currentEnvironment?.audio.ambientTrack && audioSettings.autoPlay) {
      handlePlayAmbient();
    } else {
      handleStopAmbient();
    }
  }, [currentEnvironment, audioSettings.autoPlay]);

  const handlePlayAmbient = async () => {
    if (!currentEnvironment?.audio.ambientTrack) return;

    try {
      audioService.playAmbientSound(
        currentEnvironment.audio.ambientTrack,
        currentEnvironment.audio.defaultVolume
      );
      setIsAmbientPlaying(true);
    } catch (error) {
      console.error('Error playing ambient sound:', error);
    }
  };

  const handleStopAmbient = () => {
    audioService.stopAmbientSound();
    setIsAmbientPlaying(false);
  };

  const handleToggleAmbient = () => {
    if (isAmbientPlaying) {
      handleStopAmbient();
    } else {
      handlePlayAmbient();
    }
  };

  const handleAmbientVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(event.target.value);
    setAmbientVolume(newVolume);
    updateAudioSettings({ ambientVolume: newVolume });
    audioService.setAmbientVolume(newVolume);
  };

  const handleMusicVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(event.target.value);
    setMusicVolume(newVolume);
    updateAudioSettings({ musicVolume: newVolume });
    audioService.setMusicVolume(newVolume);
  };

  const handleMasterVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(event.target.value);
    updateAudioSettings({ masterVolume: newVolume });
    audioService.setMasterVolume(newVolume);
  };

  if (!currentEnvironment?.audio.ambientTrack) {
    return null;
  }

  return (
    <div className={`ambient-sound-controller ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Ambient Sound Toggle */}
        <button
          onClick={handleToggleAmbient}
          className={`p-2 rounded-lg transition-colors ${
            isAmbientPlaying
              ? 'bg-green-100 text-green-600 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isAmbientPlaying ? 'Stop ambient sound' : 'Play ambient sound'}
        >
          {isAmbientPlaying ? (
            <SpeakerWaveIcon className="w-5 h-5" />
          ) : (
            <SpeakerXMarkIcon className="w-5 h-5" />
          )}
        </button>

        {/* Environment Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {currentEnvironment.name} Ambience
          </div>
          <div className="text-xs text-gray-500">
            {isAmbientPlaying ? 'Playing' : 'Stopped'}
          </div>
        </div>

        {/* Volume Mixer Toggle */}
        {showVolumeControls && (
          <button
            onClick={() => setShowMixer(!showMixer)}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Audio mixer"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Volume Mixer */}
      {showMixer && showVolumeControls && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Audio Mixer
          </div>

          {/* Master Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Master Volume</span>
              <span>{Math.round(audioSettings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioSettings.masterVolume}
              onChange={handleMasterVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Ambient Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Ambient Sounds</span>
              <span>{Math.round(ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ambientVolume}
              onChange={handleAmbientVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Music</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Auto-play Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-600">
              Auto-play ambient sounds
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioSettings.autoPlay}
                onChange={e =>
                  updateAudioSettings({ autoPlay: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
