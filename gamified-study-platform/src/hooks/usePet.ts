import { useEffect, useState } from 'react';
import { usePetStore } from '../store/petStore';
import type { StudyPet, PetSpecies } from '../types';

/**
 * Custom hook for interacting with the pet system
 * @param userId The user ID
 */
export function usePet(userId: string) {
  const {
    pet,
    species,
    isLoading,
    error,
    isAdopting,
    isEvolving,
    isInteracting,
    needsAttention,
    attentionReason,
    fetchUserPet,
    fetchPetSpecies,
    adoptPet,
    feedPet,
    playWithPet,
    checkEvolution,
    updateFromStudyActivity,
    checkPetNeeds,
  } = usePetStore();
  
  const [showPetSelection, setShowPetSelection] = useState(false);
  
  // Initialize pet data
  useEffect(() => {
    const initializePet = async () => {
      await fetchUserPet(userId);
      await fetchPetSpecies();
      
      // Check if user needs to adopt a pet
      if (!usePetStore.getState().pet && !usePetStore.getState().isLoading) {
        setShowPetSelection(true);
      }
    };
    
    if (userId) {
      initializePet();
    }
  }, [userId, fetchUserPet, fetchPetSpecies]);
  
  // Set up interval to check pet needs
  useEffect(() => {
    if (!userId || !pet) return;
    
    // Check pet needs immediately
    checkPetNeeds(userId);
    
    // Then check every 5 minutes
    const interval = setInterval(() => {
      checkPetNeeds(userId);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId, pet, checkPetNeeds]);
  
  // Handle study activity
  const handleStudyActivity = async (
    activityType: 'study_session' | 'quest_complete' | 'todo_complete',
    durationMinutes?: number
  ) => {
    if (!userId || !pet) return;
    
    await updateFromStudyActivity(userId, activityType, durationMinutes);
  };
  
  return {
    pet,
    species,
    isLoading,
    error,
    isAdopting,
    isEvolving,
    isInteracting,
    needsAttention,
    attentionReason,
    showPetSelection,
    setShowPetSelection,
    adoptPet: (petData: { name: string; speciesId: string }) => adoptPet(userId, petData),
    feedPet: () => feedPet(userId),
    playWithPet: () => playWithPet(userId),
    checkEvolution: () => checkEvolution(userId),
    handleStudyActivity,
    checkPetNeeds: () => checkPetNeeds(userId),
  };
}