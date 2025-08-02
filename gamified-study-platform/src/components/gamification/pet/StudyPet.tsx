import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePetStore } from '../../../store/petStore';
import { PetSelection } from './PetSelection';
import { PetDisplay } from './PetDisplay';
import { PetAccessories } from './PetAccessories';
import { PetEvolutionModal } from './PetEvolutionModal';

interface StudyPetProps {
  userId: string;
  className?: string;
}

export function StudyPet({ userId, className = '' }: StudyPetProps) {
  const {
    pet,
    isLoading,
    error,
    interactionType,
    fetchUserPet,
    fetchPetSpecies,
  } = usePetStore();
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [previousStage, setPreviousStage] = useState('');
  const [newStage, setNewStage] = useState('');

  // Check if user has a pet and fetch species data
  useEffect(() => {
    const initializePetData = async () => {
      // Fetch pet species first (needed for pet selection)
      await fetchPetSpecies();

      // Then fetch user's pet
      await fetchUserPet(userId);
      const currentPet = usePetStore.getState().pet;

      if (!currentPet && !isLoading) {
        setShowPetSelection(true);
      }
    };

    if (userId) {
      initializePetData();
    }
  }, [userId, fetchUserPet, fetchPetSpecies, isLoading]);

  // Watch for evolution events
  useEffect(() => {
    if (interactionType === 'evolve' && pet) {
      // Store the current evolution stage
      setPreviousStage(pet.evolution.stage.name);
      setNewStage(pet.evolution.stage.name);
      setShowEvolutionModal(true);
    }
  }, [interactionType, pet]);

  // Handle pet adoption completion
  const handlePetAdoptionComplete = () => {
    setShowPetSelection(false);
  };

  // Handle accessory modal
  const handleOpenAccessories = () => {
    setShowAccessories(true);
  };

  const handleCloseAccessories = () => {
    setShowAccessories(false);
  };

  // Handle evolution modal
  const handleCloseEvolutionModal = () => {
    setShowEvolutionModal(false);
  };

  if (showPetSelection) {
    return (
      <PetSelection
        onSelect={handlePetAdoptionComplete}
        onClose={() => setShowPetSelection(false)}
      />
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Study Pet</h2>
        <button
          onClick={handleOpenAccessories}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Accessories
        </button>
      </div>

      <PetDisplay
        userId={userId}
        size="lg"
        showStats={true}
        showActions={true}
      />

      {/* Pet accessories modal */}
      {showAccessories && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PetAccessories userId={userId} onClose={handleCloseAccessories} />
        </div>
      )}

      {/* Pet evolution modal */}
      <PetEvolutionModal
        pet={pet!}
        previousStage={previousStage}
        newStage={newStage}
        isOpen={showEvolutionModal}
        onClose={handleCloseEvolutionModal}
      />
    </div>
  );
}
