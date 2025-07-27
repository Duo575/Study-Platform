import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  StudyPet,
  StudyPetExtended,
  PetSpecies,
  PetForm,
  PetAccessory,
  PetStatus,
  PetNeed,
  PetFood,
  PetToy,
  EvolutionEligibility,
  EvolutionResult,
} from '../types';
import { petService } from '../services/petService';
import { petHungerSystem } from '../services/petHungerSystem';
import { useGamificationStore } from './gamificationStore';

interface PetState {
  // Pet data
  pet: StudyPetExtended | null;
  species: PetSpecies[];
  petStatus: PetStatus | null;

  // UI states
  isLoading: boolean;
  error: string | null;
  isAdopting: boolean;
  isEvolving: boolean;
  isInteracting: boolean;
  isFeeding: boolean;
  isPlaying: boolean;

  // Interaction states
  lastInteraction: Date | null;
  interactionType: 'feed' | 'play' | 'evolve' | 'care' | null;

  // Pet needs and status
  needsAttention: boolean;
  attentionReason: string | null;
  petNeeds: PetNeed[];
  evolutionEligibility: EvolutionEligibility | null;

  // Inventory and items
  petFood: PetFood[];
  petToys: PetToy[];
  selectedFood: PetFood | null;
  selectedToy: PetToy | null;

  // Auto-care settings
  autoCareEnabled: boolean;
  autoFeedThreshold: number; // hunger level to trigger auto-feed
  autoPlayThreshold: number; // happiness level to trigger auto-play
}

interface PetActions {
  // Data fetching
  fetchUserPet: (userId: string) => Promise<void>;
  fetchPetSpecies: () => Promise<void>;
  fetchPetFood: () => Promise<void>;
  fetchPetToys: () => Promise<void>;

  // Pet interactions
  adoptPet: (userId: string, petData: PetForm) => Promise<void>;
  feedPet: (userId: string, foodId?: string) => Promise<void>;
  playWithPet: (userId: string, toyId?: string) => Promise<void>;
  checkEvolution: (userId: string) => Promise<boolean>;
  carePet: (userId: string) => Promise<void>;

  // Study activity updates
  updateFromStudyActivity: (
    userId: string,
    activityType: 'study_session' | 'quest_complete' | 'todo_complete',
    durationMinutes?: number
  ) => Promise<void>;

  // Accessory management
  fetchAccessories: (userId: string) => Promise<PetAccessory[]>;
  unlockAccessory: (
    userId: string,
    accessory: Omit<PetAccessory, 'id' | 'unlockedAt'>
  ) => Promise<void>;

  // Pet needs and status
  checkPetNeeds: (userId: string) => Promise<void>;
  updatePetStatus: (userId: string) => Promise<void>;
  checkEvolutionEligibility: (userId: string) => Promise<void>;

  // Food and toy management
  selectFood: (food: PetFood | null) => void;
  selectToy: (toy: PetToy | null) => void;
  useFood: (userId: string, foodId: string) => Promise<void>;
  useToy: (userId: string, toyId: string) => Promise<void>;

  // Auto-care settings
  setAutoCareEnabled: (enabled: boolean) => void;
  setAutoFeedThreshold: (threshold: number) => void;
  setAutoPlayThreshold: (threshold: number) => void;
  performAutoCare: (userId: string) => Promise<void>;

  // UI state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAdopting: (adopting: boolean) => void;
  setEvolving: (evolving: boolean) => void;
  setInteracting: (
    interacting: boolean,
    type?: 'feed' | 'play' | 'evolve' | 'care' | null
  ) => void;
  setFeeding: (feeding: boolean) => void;
  setPlaying: (playing: boolean) => void;
  reset: () => void;
}

const initialState: PetState = {
  pet: null,
  species: [],
  petStatus: null,
  isLoading: false,
  error: null,
  isAdopting: false,
  isEvolving: false,
  isInteracting: false,
  isFeeding: false,
  isPlaying: false,
  lastInteraction: null,
  interactionType: null,
  needsAttention: false,
  attentionReason: null,
  petNeeds: [],
  evolutionEligibility: null,
  petFood: [],
  petToys: [],
  selectedFood: null,
  selectedToy: null,
  autoCareEnabled: false,
  autoFeedThreshold: 30,
  autoPlayThreshold: 40,
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
              isAdopting: false,
            });
          }
        },

        feedPet: async (userId: string) => {
          try {
            set({
              isLoading: true,
              isInteracting: true,
              interactionType: 'feed',
              error: null,
            });
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
            set({
              isLoading: true,
              isInteracting: true,
              interactionType: 'play',
              error: null,
            });
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

        updateFromStudyActivity: async (
          userId: string,
          activityType,
          durationMinutes
        ) => {
          try {
            const pet = await petService.updatePetFromStudyActivity(
              userId,
              activityType,
              durationMinutes
            );
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

        fetchPetFood: async () => {
          try {
            set({ isLoading: true, error: null });
            // Mock pet food data - in real app this would be an API call
            const mockFood: PetFood[] = [
              {
                id: 'basic-kibble',
                name: 'Basic Kibble',
                description: 'Standard pet food that restores hunger',
                cost: 10,
                effects: [
                  { type: 'hunger', value: -30 },
                  { type: 'health', value: 5 },
                ],
                rarity: 'common',
                imageUrl: '/items/basic-kibble.png',
                category: 'basic',
              },
              {
                id: 'premium-treats',
                name: 'Premium Treats',
                description: 'Delicious treats that boost happiness',
                cost: 25,
                effects: [
                  { type: 'hunger', value: -20 },
                  { type: 'happiness', value: 15 },
                ],
                rarity: 'rare',
                imageUrl: '/items/premium-treats.png',
                category: 'premium',
              },
            ];
            set({ petFood: mockFood, isLoading: false });
          } catch (error) {
            console.error('Error fetching pet food:', error);
            set({ error: 'Failed to load pet food', isLoading: false });
          }
        },

        fetchPetToys: async () => {
          try {
            set({ isLoading: true, error: null });
            // Mock pet toy data - in real app this would be an API call
            const mockToys: PetToy[] = [
              {
                id: 'ball',
                name: 'Bouncy Ball',
                description: 'A fun ball that increases happiness',
                cost: 15,
                effects: [
                  { type: 'happiness', value: 20 },
                  { type: 'energy', value: -10 },
                ],
                rarity: 'common',
                imageUrl: '/items/ball.png',
                category: 'interactive',
                durability: 10,
              },
              {
                id: 'puzzle-toy',
                name: 'Puzzle Toy',
                description: 'A challenging toy that boosts intelligence',
                cost: 40,
                effects: [
                  { type: 'happiness', value: 15 },
                  { type: 'evolution_boost', value: 5 },
                ],
                rarity: 'epic',
                imageUrl: '/items/puzzle-toy.png',
                category: 'training',
                durability: 20,
              },
            ];
            set({ petToys: mockToys, isLoading: false });
          } catch (error) {
            console.error('Error fetching pet toys:', error);
            set({ error: 'Failed to load pet toys', isLoading: false });
          }
        },

        carePet: async (userId: string) => {
          try {
            set({
              isLoading: true,
              isInteracting: true,
              interactionType: 'care',
              error: null,
            });

            // General care action that improves all stats slightly
            const pet = await petService.feedPet(userId); // Using existing service method
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
            console.error('Error caring for pet:', error);
            set({
              error: 'Failed to care for pet',
              isLoading: false,
              isInteracting: false,
              interactionType: null,
            });
          }
        },

        updatePetStatus: async (userId: string) => {
          try {
            const { pet } = get();
            if (!pet) return;

            // Calculate pet status based on current stats and time using hunger system
            const now = new Date();
            const lastFed = new Date(pet.lastFed);
            const lastPlayed = new Date(pet.lastPlayed);

            const timeSinceLastFed = Math.floor(
              (now.getTime() - lastFed.getTime()) / (1000 * 60)
            );
            const timeSinceLastPlayed = Math.floor(
              (now.getTime() - lastPlayed.getTime()) / (1000 * 60)
            );

            // Use hunger system to calculate hunger
            const currentHunger = petHungerSystem.calculateHungerFromTime(
              lastFed,
              (pet as any).hunger || 0
            );

            // Calculate health and happiness impacts from hunger
            const adjustedHealth = petHungerSystem.calculateHealthImpact(
              currentHunger,
              pet.health
            );
            const adjustedHappiness = petHungerSystem.calculateHappinessImpact(
              currentHunger,
              pet.happiness
            );

            const status: PetStatus = {
              health: adjustedHealth,
              happiness: adjustedHappiness,
              hunger: currentHunger,
              energy: Math.max(
                0,
                (pet as any).energy ||
                  100 - Math.floor(timeSinceLastPlayed / 120)
              ),
              needsAttention:
                timeSinceLastFed > 1440 ||
                timeSinceLastPlayed > 2880 ||
                currentHunger >= 80,
              timeSinceLastFed,
              timeSinceLastPlayed,
              evolutionProgress: pet.evolution.progress,
            };

            set({ petStatus: status });
          } catch (error) {
            console.error('Error updating pet status:', error);
          }
        },

        checkEvolutionEligibility: async (userId: string) => {
          try {
            const { pet } = get();
            if (!pet) return;

            // Mock evolution eligibility check
            const eligibility: EvolutionEligibility = {
              canEvolve: pet.level >= 5 && pet.happiness >= 80,
              nextStage: pet.evolution.stage,
              missingRequirements: [],
              progress: Math.min(100, pet.level * 20 + pet.happiness * 0.5),
            };

            set({ evolutionEligibility: eligibility });
          } catch (error) {
            console.error('Error checking evolution eligibility:', error);
          }
        },

        selectFood: (food: PetFood | null) => {
          set({ selectedFood: food });
        },

        selectToy: (toy: PetToy | null) => {
          set({ selectedToy: toy });
        },

        useFood: async (userId: string, foodId: string) => {
          try {
            set({ isFeeding: true, error: null });
            // In a real app, this would call a service to use the food item
            await get().feedPet(userId, foodId);
            set({ isFeeding: false, selectedFood: null });
          } catch (error) {
            console.error('Error using food:', error);
            set({ error: 'Failed to use food item', isFeeding: false });
          }
        },

        useToy: async (userId: string, toyId: string) => {
          try {
            set({ isPlaying: true, error: null });
            // In a real app, this would call a service to use the toy
            await get().playWithPet(userId, toyId);
            set({ isPlaying: false, selectedToy: null });
          } catch (error) {
            console.error('Error using toy:', error);
            set({ error: 'Failed to use toy', isPlaying: false });
          }
        },

        setAutoCareEnabled: (enabled: boolean) => {
          set({ autoCareEnabled: enabled });
        },

        setAutoFeedThreshold: (threshold: number) => {
          set({ autoFeedThreshold: Math.max(0, Math.min(100, threshold)) });
        },

        setAutoPlayThreshold: (threshold: number) => {
          set({ autoPlayThreshold: Math.max(0, Math.min(100, threshold)) });
        },

        performAutoCare: async (userId: string) => {
          try {
            const {
              pet,
              autoCareEnabled,
              autoFeedThreshold,
              autoPlayThreshold,
              petStatus,
            } = get();
            if (!autoCareEnabled || !pet || !petStatus) return;

            // Auto-feed if hunger is above threshold
            if (petStatus.hunger >= autoFeedThreshold) {
              await get().feedPet(userId);
            }

            // Auto-play if happiness is below threshold
            if (petStatus.happiness <= autoPlayThreshold) {
              await get().playWithPet(userId);
            }
          } catch (error) {
            console.error('Error performing auto-care:', error);
          }
        },

        checkPetNeeds: async (userId: string) => {
          try {
            const { needsAttention, reason } =
              await petService.checkPetNeeds(userId);

            // Generate pet needs based on status
            const needs: PetNeed[] = [];
            if (reason === 'hungry') {
              needs.push({
                type: 'food',
                urgency: 'high',
                description: 'Your pet is hungry and needs food',
                timeRemaining: 60,
              });
            }
            if (reason === 'bored') {
              needs.push({
                type: 'play',
                urgency: 'medium',
                description: 'Your pet wants to play',
                timeRemaining: 120,
              });
            }

            set({ needsAttention, attentionReason: reason, petNeeds: needs });
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

        setFeeding: (feeding: boolean) => {
          set({ isFeeding: feeding });
        },

        setPlaying: (playing: boolean) => {
          set({ isPlaying: playing });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'pet-store',
        partialize: state => ({
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
