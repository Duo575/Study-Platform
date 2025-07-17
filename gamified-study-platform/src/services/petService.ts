import { supabase } from '../lib/supabase';
import { studyPetService, petSpeciesService } from './database';
import type { StudyPet, PetForm, PetSpecies, PetEvolution, PetAccessory } from '../types';
import { mapDatabasePetToStudyPet } from '../utils/mappers';

/**
 * Service for managing the virtual study pet system
 */
export const petService = {
  /**
   * Adopts a new pet for the user
   * @param userId The user ID
   * @param petData The pet data (name and species)
   * @returns The newly created pet
   */
  async adoptPet(userId: string, petData: PetForm): Promise<StudyPet> {
    try {
      // Get the species data to set initial stats
      const speciesData = await petSpeciesService.getById(petData.speciesId);
      
      if (!speciesData) {
        throw new Error('Invalid pet species selected');
      }
      
      // Create the pet with initial stats based on species
      const now = new Date().toISOString();
      const newPet = await studyPetService.create({
        user_id: userId,
        name: petData.name,
        species_id: petData.speciesId,
        level: 1,
        happiness: speciesData.base_happiness,
        health: speciesData.base_health,
        evolution_stage: 'baby', // Start at baby stage
        accessories: [], // No accessories initially
        last_fed: now,
        last_played: now,
        last_interaction: now,
      });
      
      // Map the database pet to our frontend model
      return mapDatabasePetToStudyPet(newPet);
    } catch (error) {
      console.error('Error adopting pet:', error);
      throw new Error('Failed to adopt pet. Please try again.');
    }
  },
  
  /**
   * Gets the user's pet
   * @param userId The user ID
   * @returns The user's pet or null if they don't have one
   */
  async getUserPet(userId: string): Promise<StudyPet | null> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      return pet ? mapDatabasePetToStudyPet(pet) : null;
    } catch (error) {
      console.error('Error getting user pet:', error);
      return null;
    }
  },
  
  /**
   * Gets all available pet species
   * @returns List of pet species
   */
  async getPetSpecies(): Promise<PetSpecies[]> {
    try {
      const species = await petSpeciesService.getAll();
      return species.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        baseStats: {
          happiness: s.base_happiness,
          health: s.base_health,
          intelligence: 50, // Default value
        },
        evolutionStages: s.evolution_stages as any[] || [],
      }));
    } catch (error) {
      console.error('Error getting pet species:', error);
      throw new Error('Failed to load pet species. Please try again.');
    }
  },
  
  /**
   * Feeds the pet to increase happiness and health
   * @param userId The user ID
   * @returns The updated pet
   */
  async feedPet(userId: string): Promise<StudyPet> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      // Calculate new happiness and health values
      const newHappiness = Math.min(100, pet.happiness + 15);
      const newHealth = Math.min(100, pet.health + 10);
      
      // Update the pet
      const updatedPet = await studyPetService.update(userId, {
        happiness: newHappiness,
        health: newHealth,
        last_fed: new Date().toISOString(),
        last_interaction: new Date().toISOString(),
      });
      
      return mapDatabasePetToStudyPet(updatedPet);
    } catch (error) {
      console.error('Error feeding pet:', error);
      throw new Error('Failed to feed pet. Please try again.');
    }
  },
  
  /**
   * Plays with the pet to increase happiness
   * @param userId The user ID
   * @returns The updated pet
   */
  async playWithPet(userId: string): Promise<StudyPet> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      // Calculate new happiness value
      const newHappiness = Math.min(100, pet.happiness + 20);
      
      // Update the pet
      const updatedPet = await studyPetService.update(userId, {
        happiness: newHappiness,
        last_played: new Date().toISOString(),
        last_interaction: new Date().toISOString(),
      });
      
      return mapDatabasePetToStudyPet(updatedPet);
    } catch (error) {
      console.error('Error playing with pet:', error);
      throw new Error('Failed to play with pet. Please try again.');
    }
  },
  
  /**
   * Checks if the pet can evolve and evolves it if possible
   * @param userId The user ID
   * @returns The updated pet with evolution data
   */
  async checkAndEvolvePet(userId: string): Promise<{ pet: StudyPet, evolved: boolean, newStage: string | null }> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      const species = await petSpeciesService.getById(pet.species_id);
      const evolutionStages = species.evolution_stages as any[] || [];
      
      // Find the next evolution stage
      const currentStageIndex = evolutionStages.findIndex(stage => stage.name === pet.evolution_stage);
      
      if (currentStageIndex === -1 || currentStageIndex >= evolutionStages.length - 1) {
        // No evolution available
        return { 
          pet: mapDatabasePetToStudyPet(pet), 
          evolved: false, 
          newStage: null 
        };
      }
      
      const nextStage = evolutionStages[currentStageIndex + 1];
      
      // Check if requirements are met
      const canEvolve = pet.level >= nextStage.requirements.level;
      
      if (!canEvolve) {
        return { 
          pet: mapDatabasePetToStudyPet(pet), 
          evolved: false, 
          newStage: null 
        };
      }
      
      // Evolve the pet
      const updatedPet = await studyPetService.update(userId, {
        evolution_stage: nextStage.name,
        happiness: Math.min(100, pet.happiness + 25), // Bonus happiness for evolving
        last_interaction: new Date().toISOString(),
      });
      
      return {
        pet: mapDatabasePetToStudyPet(updatedPet),
        evolved: true,
        newStage: nextStage.name
      };
    } catch (error) {
      console.error('Error checking pet evolution:', error);
      throw new Error('Failed to check pet evolution. Please try again.');
    }
  },
  
  /**
   * Updates pet stats based on study activity
   * @param userId The user ID
   * @param activityType The type of study activity
   * @param durationMinutes The duration of the activity in minutes
   * @returns The updated pet
   */
  async updatePetFromStudyActivity(
    userId: string, 
    activityType: 'study_session' | 'quest_complete' | 'todo_complete',
    durationMinutes?: number
  ): Promise<StudyPet> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      // Calculate stat increases based on activity
      let happinessIncrease = 0;
      let xpGain = 0;
      
      switch (activityType) {
        case 'study_session':
          happinessIncrease = Math.min(15, Math.floor(durationMinutes! / 10));
          xpGain = Math.floor(durationMinutes! / 15);
          break;
        case 'quest_complete':
          happinessIncrease = 10;
          xpGain = 5;
          break;
        case 'todo_complete':
          happinessIncrease = 5;
          xpGain = 2;
          break;
      }
      
      // Calculate new values
      const newHappiness = Math.min(100, pet.happiness + happinessIncrease);
      
      // Check if pet should level up
      const xpForNextLevel = 100 * pet.level; // Simple formula: 100 * current level
      const newLevel = pet.level + (xpGain >= xpForNextLevel ? 1 : 0);
      
      // Update the pet
      const updatedPet = await studyPetService.update(userId, {
        happiness: newHappiness,
        level: newLevel,
        last_interaction: new Date().toISOString(),
      });
      
      return mapDatabasePetToStudyPet(updatedPet);
    } catch (error) {
      console.error('Error updating pet from study activity:', error);
      throw new Error('Failed to update pet stats. Please try again.');
    }
  },
  
  /**
   * Gets all accessories available for the pet
   * @param userId The user ID
   * @returns List of accessories
   */
  async getPetAccessories(userId: string): Promise<PetAccessory[]> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      return (pet.accessories as any[] || []).map(acc => ({
        id: acc.id,
        name: acc.name,
        description: acc.description || '',
        imageUrl: acc.image_url,
        rarity: acc.rarity || 'common',
        unlockedAt: new Date(acc.unlocked_at),
      }));
    } catch (error) {
      console.error('Error getting pet accessories:', error);
      throw new Error('Failed to load pet accessories. Please try again.');
    }
  },
  
  /**
   * Adds a new accessory to the pet
   * @param userId The user ID
   * @param accessoryId The accessory ID
   * @returns The updated pet
   */
  async addPetAccessory(userId: string, accessory: Omit<PetAccessory, 'id' | 'unlockedAt'>): Promise<StudyPet> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        throw new Error('Pet not found');
      }
      
      // Create new accessory
      const newAccessory = {
        id: `acc_${Date.now()}`,
        ...accessory,
        unlocked_at: new Date().toISOString(),
      };
      
      // Add to existing accessories
      const currentAccessories = pet.accessories as any[] || [];
      const updatedAccessories = [...currentAccessories, newAccessory];
      
      // Update the pet
      const updatedPet = await studyPetService.update(userId, {
        accessories: updatedAccessories,
        last_interaction: new Date().toISOString(),
      });
      
      return mapDatabasePetToStudyPet(updatedPet);
    } catch (error) {
      console.error('Error adding pet accessory:', error);
      throw new Error('Failed to add pet accessory. Please try again.');
    }
  },
  
  /**
   * Checks if the pet needs attention (hasn't been interacted with in a while)
   * @param userId The user ID
   * @returns Object with needsAttention flag and reason
   */
  async checkPetNeeds(userId: string): Promise<{ needsAttention: boolean, reason: string | null }> {
    try {
      const pet = await studyPetService.getByUserId(userId);
      
      if (!pet) {
        return { needsAttention: false, reason: null };
      }
      
      const now = new Date();
      const lastInteraction = new Date(pet.last_interaction);
      const hoursSinceInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
      
      const lastFed = new Date(pet.last_fed);
      const hoursSinceFed = (now.getTime() - lastFed.getTime()) / (1000 * 60 * 60);
      
      const lastPlayed = new Date(pet.last_played);
      const hoursSincePlayed = (now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60);
      
      // Check if pet needs attention
      if (hoursSinceFed > 24) {
        return { needsAttention: true, reason: 'hungry' };
      }
      
      if (hoursSincePlayed > 48) {
        return { needsAttention: true, reason: 'bored' };
      }
      
      if (hoursSinceInteraction > 72) {
        return { needsAttention: true, reason: 'lonely' };
      }
      
      // Check if happiness or health is low
      if (pet.happiness < 30) {
        return { needsAttention: true, reason: 'unhappy' };
      }
      
      if (pet.health < 30) {
        return { needsAttention: true, reason: 'unwell' };
      }
      
      return { needsAttention: false, reason: null };
    } catch (error) {
      console.error('Error checking pet needs:', error);
      return { needsAttention: false, reason: null };
    }
  }
};