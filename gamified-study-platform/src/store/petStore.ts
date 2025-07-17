import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StudyPet, PetSpecies, PetForm, PetAccessory } from '../types';
import { petService } from '../services/petService';

interface PetState {
  // Pet data
  pet: StudyPet | null;
  species: PetSpecies[];
  
  // UI states
  isLoading: boolean;
  error: string | null;
  isAdopting: boolean;
  isEvolving: boolean;
  isInteracting: boolean;
  
  // Interaction states
  lastInteraction: Date | null;
  interactionType: 'feed' | 'play' | 'evolve' | null;
  
  // Notification states
  needsAttention: boolean;
  attentionReason: string | null;
}

interface PetActions {
  // Data fetching
  fetchUserPet: (userId: string) => Promise<void>;
  fetchPetSpecies: () => Promise<void>;
  
  // Pet interactions
  adoptPet: (userId: string, petData: PetForm) => Promise<void>;
  feedPet: (userId: string) => Promise<void>;
  playWithPet: (userId: string) => Promise<void>;
  checkEvolution: (userId: string) => Promise<boolean>;
  
  // Study activity updates
  updateFromStudyActivity: (
    userId: string,
    activityType: 'study_session' | 'quest_complete' | 'todo_complete',
    durationMinutes?: number
  ) => Promise<void>;
  
  // Accessory management
  fetchAccessories: (userId: string) => Promise<PetAccessory[]>;
  unlockAccessory: (userId: string, accessory: Omit<PetAccessory, 'id' | 'unlockedAt'>) => Promise<void>;
  
  // Pet needs
  checkPetNeeds: (userId: string) => Promise<void>;
  
  // UI state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAdopting: (adopting: boolean) => void;
  setEvolving: (evolving: boolean) => void;
  setInteracting: (interacting: boolean, type?: 'feed' | 'play' | 'evolve' | null) => void;
  reset: () => void;
}

const initialState: PetState = {
  pet: null,
  species: [],
  isLoading: false,
  error: null,
  isAdopting: false,
  isEvolving: false,
  isInteracting: false,
  lastInteraction: null,
  interactionType: null,
  needsAttention: false,
  attentionReason: null,
};

export const usePetStore = create<PetState & PetActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        fetchUserPet: async (userId: string) => {
          try {
            set({ isLoading: true, error: null });
            const pet = await petService.getUserPet(userId);
            set({ pet, isLoading: false });
            
            // Check if pet needs attention
            if (pet) {
              get().checkPetNeeds(userId);
            }
          } catch (error) {
            console.error('Error fetching user pet:', error);
            set({ error: 'Failed to load pet data', isLoading: false });
          }
        },
        
        fetchPetSpecies: async () => {
          try {
            set({ isLoading: true, error: null });
            const species = await petService.getPetSpecies();
            set({ species, isLoading: false });
          } catch (error) {
            console.error('Error fetching pet species:', error);
            set({ error: 'Failed to load pet species', isLoading: false });
          }
        },
        
        adoptPet: async (userId: string, petData: PetForm) => {
          try {
            set({ isLoading: true, isAdopting: true, error: null });
            const pet = await petService.adoptPet(userId, petData);
            set({ 
              pet, 
              isLoading: false, 
              isAdopting: false,
              lastInteraction: new Date(),
              interactionType: null,
            });
          } catch (error) {
            console.error('Error adopting pet:', error);
            set({ 
              error: 'Failed to adopt pet', 
              isLoading: false, 
              isAdopting: false 
            });
          }
        },
        
        feedPet: async (userId: string) => {
          try {
            set({ isLoading: true, isInteracting: true, interactionType: 'feed', error: null });
            const pet = await petService.feedPet(userId);
            set({ 
              pet, 
              isLoading: false, 
              isInteracting: false,
              lastInteraction: new Date(),
              interactionType: null,
              needsAttention: false,
              attentionReason: null,
            });
          } catch (error) {
            console.error('Error feeding pet:', error);
            set({ 
              error: 'Failed to feed pet', 
              isLoading: false, 
              isInteracting: false,
              interactionType: null,
            });
          }
        },
        
        playWithPet: async (userId: string) => {
          try {
            set({ isLoading: true, isInteracting: true, interactionType: 'play', error: null });
            const pet = await petService.playWithPet(userId);
            set({ 
              pet, 
              isLoading: false, 
              isInteracting: false,
              lastInteraction: new Date(),
              interactionType: null,
              needsAttention: false,
              attentionReason: null,
            });
          } catch (error) {
            console.error('Error playing with pet:', error);
            set({ 
              error: 'Failed to play with pet', 
              isLoading: false, 
              isInteracting: false,
              interactionType: null,
            });
          }
        },
        
        checkEvolution: async (userId: string) => {
          try {
            set({ isLoading: true, isEvolving: true, error: null });
            const result = await petService.checkAndEvolvePet(userId);
            
            if (result.evolved) {
              set({ 
                pet: result.pet, 
                isLoading: false, 
                isEvolving: false,
                lastInteraction: new Date(),
                interactionType: 'evolve',
              });
              return true;
            } else {
              set({ 
                pet: result.pet, 
                isLoading: false, 
                isEvolving: false,
              });
              return false;
            }
          } catch (error) {
            console.error('Error checking pet evolution:', error);
            set({ 
              error: 'Failed to check pet evolution', 
              isLoading: false, 
              isEvolving: false,
            });
            return false;
          }
        },
        
        updateFromStudyActivity: async (userId: string, activityType, durationMinutes) => {
          try {
            const pet = await petService.updatePetFromStudyActivity(userId, activityType, durationMinutes);
            set({ pet });
            
            // Check if pet can evolve after gaining XP
            await get().checkEvolution(userId);
          } catch (error) {
            console.error('Error updating pet from study activity:', error);
            // Don't set error state here to avoid disrupting the user experience
          }
        },
        
        fetchAccessories: async (userId: string) => {
          try {
            const accessories = await petService.getPetAccessories(userId);
            return accessories;
          } catch (error) {
            console.error('Error fetching pet accessories:', error);
            return [];
          }
        },
        
        unlockAccessory: async (userId: string, accessory) => {
          try {
            set({ isLoading: true, error: null });
            const pet = await petService.addPetAccessory(userId, accessory);
            set({ 
              pet, 
              isLoading: false,
              lastInteraction: new Date(),
            });
          } catch (error) {
            console.error('Error unlocking accessory:', error);
            set({ 
              error: 'Failed to unlock accessory', 
              isLoading: false,
            });
          }
        },
        
        checkPetNeeds: async (userId: string) => {
          try {
            const { needsAttention, reason } = await petService.checkPetNeeds(userId);
            set({ needsAttention, attentionReason: reason });
          } catch (error) {
            console.error('Error checking pet needs:', error);
            // Don't set error state here to avoid disrupting the user experience
          }
        },
        
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
        
        setError: (error: string | null) => {
          set({ error });
        },
        
        setAdopting: (adopting: boolean) => {
          set({ isAdopting: adopting });
        },
        
        setEvolving: (evolving: boolean) => {
          set({ isEvolving: evolving });
        },
        
        setInteracting: (interacting: boolean, type = null) => {
          set({ isInteracting: interacting, interactionType: type });
        },
        
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'pet-store',
        partialize: (state) => ({
          pet: state.pet,
          lastInteraction: state.lastInteraction,
          needsAttention: state.needsAttention,
          attentionReason: state.attentionReason,
        }),
      }
    ),
    { name: 'PetStore' }
  )
);