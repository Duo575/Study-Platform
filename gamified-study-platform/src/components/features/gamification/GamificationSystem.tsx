import React, { useEffect } from 'react';
import { XPBar } from './XPBar';
import { XPAnimation } from './XPAnimation';
import { LevelUpModal } from './LevelUpModal';
import { StreakTracker } from './StreakTracker';
import { useGamificationStore } from '../../../store/gamificationStore';

interface GamificationSystemProps {
  showXPBar?: boolean;
  showXPAnimations?: boolean;
  showStreakTracker?: boolean;
}

export function GamificationSystem({
  showXPBar = true,
  showXPAnimations = true,
  showStreakTracker = true,
}: GamificationSystemProps) {
  const { gameStats, updateStreak, checkStreakStatus } = useGamificationStore();

  // Check streak status on component mount
  useEffect(() => {
    // Check if streak is still active
    const isActive = checkStreakStatus();
    
    // If user has activity today, update streak
    if (isActive) {
      updateStreak();
    }
    
    // Check streak status daily
    const intervalId = setInterval(() => {
      checkStreakStatus();
    }, 3600000); // Check every hour
    
    return () => clearInterval(intervalId);
  }, [checkStreakStatus, updateStreak]);

  if (!gameStats) {
    return null;
  }

  return (
    <>
      {/* XP Bar */}
      {showXPBar && <XPBar />}
      
      {/* XP Animations */}
      {showXPAnimations && <XPAnimation />}
      
      {/* Level Up Modal */}
      <LevelUpModal />
      
      {/* Streak Tracker */}
      {showStreakTracker && <StreakTracker />}
    </>
  );
}