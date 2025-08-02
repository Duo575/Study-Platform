import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePetStore } from '../petStore';
import type {
  StudyPet,
  StudyPetExtended,
  PetForm,
  PetSpecies,
  PetFood,
  PetToy,
} from '../../types';
import { petService } from '../../services/petService';
import { petHungerSystem } from '../../services/petHungerSystem';

// Mock the services at the top level
vi.mock('../../services/petService', () => ({
  petService: {
    adoptPet: vi.fn(),
    getUserPet: vi.fn(),
    getPetSpecies: vi.fn(),
    feedPet: vi.fn(),
    playWithPet: vi.fn(),
    checkAndEvolvePet: vi.fn(),
    updatePetFromStudyActivity: vi.fn(),
    getPetAccessories: vi.fn(),
    addPetAccessory: vi.fn(),
    checkPetNeeds: vi.fn(),
  },
}));

vi.mock('../../services/petHungerSystem', () => ({
  petHungerSystem: {
    calculateHungerFromTime: vi.fn(),
    calculateHealthImpact: vi.fn(),
    calculateHappinessImpact: vi.fn(),
  },
}));

describe('usePetStore', () => {
  const mockUserId = 'user-123';
  const mockPetData: PetForm = {
    name: 'Fluffy',
    speciesId: 'cat-species',
  };

  const mockStudyPet: StudyPetExtended = {
    id: 'pet-123',
    name: 'Fluffy',
    species: {
      id: 'cat-species',
      name: 'Cat',
      description: 'A friendly cat',
      baseStats: { happiness: 80, health: 90, intelligence: 50 },
      evolutionStages: [],
    },
    level: 1,
    happiness: 80,
    health: 90,
    lastFed: new Date(),
    lastPlayed: new Date(),
    evolution: {
      stage: {
        id: 'baby-stage',
        name: 'baby',
        description: 'Baby stage',
        imageUrl: '/baby.png',
        unlockedAbilities: [],
      },
      progress: 0,
      nextStageRequirements: [],
    },
    accessories: [],
    createdAt: new Date(),
    // StudyPetExtended specific properties
    mood: {
      current: 'happy',
      factors: [],
      lastUpdated: new Date(),
      trend: 'stable',
    },
    moodHistory: [],
    totalStudyTime: 0,
    favoriteSubjects: [],
    achievements: [],
    evolutionStage: 'baby',
    updatedAt: new Date(),
    userId: mockUserId,
  };

  const mockSpecies: PetSpecies[] = [
    {
      id: 'cat-species',
      name: 'Cat',
      description: 'A friendly cat',
      baseStats: {
        happiness: 80,
        health: 90,
        intelligence: 50,
      },
      evolutionStages: [
        {
          id: 'baby-stage',
          name: 'baby',
          description: 'Baby stage',
          imageUrl: '/baby.png',
          unlockedAbilities: [],
          requirements: { level: 1 },
        },
        {
          id: 'adult-stage',
          name: 'adult',
          description: 'Adult stage',
          imageUrl: '/adult.png',
          unlockedAbilities: [],
          requirements: { level: 5 },
        },
      ],
    },
  ];

  beforeEach(() => {
    // Reset store state before each test
    usePetStore.getState().reset();
    vi.clearAllMocks();

    // Set up default mock return values
    vi.mocked(petService.getUserPet).mockResolvedValue(null);
    vi.mocked(petService.getPetSpecies).mockResolvedValue([]);
    vi.mocked(petService.adoptPet).mockResolvedValue(mockStudyPet);
    vi.mocked(petService.feedPet).mockResolvedValue(mockStudyPet);
    vi.mocked(petService.playWithPet).mockResolvedValue(mockStudyPet);
    vi.mocked(petService.checkAndEvolvePet).mockResolvedValue({
      evolved: false,
      pet: mockStudyPet,
      newStage: null,
    });
    vi.mocked(petService.updatePetFromStudyActivity).mockResolvedValue(
      mockStudyPet
    );
    vi.mocked(petService.getPetAccessories).mockResolvedValue([]);
    vi.mocked(petService.addPetAccessory).mockResolvedValue(mockStudyPet);
    vi.mocked(petService.checkPetNeeds).mockResolvedValue({
      needsAttention: false,
      reason: null,
    });

    // Set up hunger system mocks
    vi.mocked(petHungerSystem.calculateHungerFromTime).mockReturnValue(40);
    vi.mocked(petHungerSystem.calculateHealthImpact).mockReturnValue(85);
    vi.mocked(petHungerSystem.calculateHappinessImpact).mockReturnValue(75);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = usePetStore.getState();

      expect(state.pet).toBeNull();
      expect(state.species).toEqual([]);
      expect(state.petStatus).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isAdopting).toBe(false);
      expect(state.isEvolving).toBe(false);
      expect(state.isInteracting).toBe(false);
      expect(state.needsAttention).toBe(false);
      expect(state.attentionReason).toBeNull();
      expect(state.petNeeds).toEqual([]);
      expect(state.evolutionEligibility).toBeNull();
      expect(state.autoCareEnabled).toBe(false);
      expect(state.autoFeedThreshold).toBe(30);
      expect(state.autoPlayThreshold).toBe(40);
    });
  });

  describe('fetchUserPet', () => {
    it('should fetch user pet successfully', async () => {
      vi.mocked(petService).getUserPet.mockResolvedValue(mockStudyPet);
      const store = usePetStore.getState();

      await store.fetchUserPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(mockStudyPet);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(vi.mocked(petService).getUserPet).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle no pet found', async () => {
      vi.mocked(petService).getUserPet.mockResolvedValue(null);
      const store = usePetStore.getState();

      await store.fetchUserPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.pet).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      vi.mocked(petService).getUserPet.mockRejectedValue(
        new Error('Database error')
      );
      const store = usePetStore.getState();

      await store.fetchUserPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.pet).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load pet data');
    });

    it('should check pet needs after fetching pet', async () => {
      vi.mocked(petService).getUserPet.mockResolvedValue(mockStudyPet);
      const store = usePetStore.getState();
      const checkPetNeedsSpy = vi
        .spyOn(store, 'checkPetNeeds')
        .mockResolvedValue();

      await store.fetchUserPet(mockUserId);

      expect(checkPetNeedsSpy).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('fetchPetSpecies', () => {
    it('should fetch pet species successfully', async () => {
      vi.mocked(petService).getPetSpecies.mockResolvedValue(mockSpecies);
      const store = usePetStore.getState();

      await store.fetchPetSpecies();

      const state = usePetStore.getState();
      expect(state.species).toEqual(mockSpecies);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch species errors', async () => {
      vi.mocked(petService).getPetSpecies.mockRejectedValue(
        new Error('Database error')
      );
      const store = usePetStore.getState();

      await store.fetchPetSpecies();

      const state = usePetStore.getState();
      expect(state.species).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load pet species');
    });
  });

  describe('adoptPet', () => {
    it('should adopt pet successfully', async () => {
      vi.mocked(petService).adoptPet.mockResolvedValue(mockStudyPet);
      const store = usePetStore.getState();

      await store.adoptPet(mockUserId, mockPetData);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(mockStudyPet);
      expect(state.isLoading).toBe(false);
      expect(state.isAdopting).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastInteraction).toBeInstanceOf(Date);
      expect(vi.mocked(petService).adoptPet).toHaveBeenCalledWith(
        mockUserId,
        mockPetData
      );
    });

    it('should handle adoption errors', async () => {
      vi.mocked(petService).adoptPet.mockRejectedValue(
        new Error('Adoption failed')
      );
      const store = usePetStore.getState();

      await store.adoptPet(mockUserId, mockPetData);

      const state = usePetStore.getState();
      expect(state.pet).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isAdopting).toBe(false);
      expect(state.error).toBe('Failed to adopt pet');
    });

    it('should set adopting state during adoption', async () => {
      let resolveAdoption: (value: any) => void;
      const adoptionPromise = new Promise<StudyPet>(resolve => {
        resolveAdoption = resolve;
      });
      vi.mocked(petService).adoptPet.mockReturnValue(adoptionPromise);

      const store = usePetStore.getState();
      const adoptPromise = store.adoptPet(mockUserId, mockPetData);

      // Check state during adoption
      const duringState = usePetStore.getState();
      expect(duringState.isLoading).toBe(true);
      expect(duringState.isAdopting).toBe(true);

      // Resolve adoption
      resolveAdoption!(mockStudyPet);
      await adoptPromise;

      // Check state after adoption
      const afterState = usePetStore.getState();
      expect(afterState.isLoading).toBe(false);
      expect(afterState.isAdopting).toBe(false);
    });
  });

  describe('feedPet', () => {
    it('should feed pet successfully', async () => {
      const fedPet = { ...mockStudyPet, happiness: 95, health: 100 };
      vi.mocked(petService).feedPet.mockResolvedValue(fedPet);
      const store = usePetStore.getState();

      await store.feedPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(fedPet);
      expect(state.isLoading).toBe(false);
      expect(state.isInteracting).toBe(false);
      expect(state.needsAttention).toBe(false);
      expect(state.attentionReason).toBeNull();
      expect(state.lastInteraction).toBeInstanceOf(Date);
      expect(vi.mocked(petService).feedPet).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle feeding errors', async () => {
      vi.mocked(petService).feedPet.mockRejectedValue(
        new Error('Feeding failed')
      );
      const store = usePetStore.getState();

      await store.feedPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.error).toBe('Failed to feed pet');
      expect(state.isLoading).toBe(false);
      expect(state.isInteracting).toBe(false);
    });

    it('should set interaction state during feeding', async () => {
      let resolveFeed: (value: any) => void;
      const feedPromise = new Promise<StudyPet>(resolve => {
        resolveFeed = resolve;
      });
      vi.mocked(petService).feedPet.mockReturnValue(feedPromise);

      const store = usePetStore.getState();
      const feedingPromise = store.feedPet(mockUserId);

      // Check state during feeding
      const duringState = usePetStore.getState();
      expect(duringState.isLoading).toBe(true);
      expect(duringState.isInteracting).toBe(true);
      expect(duringState.interactionType).toBe('feed');

      // Resolve feeding
      resolveFeed!(mockStudyPet);
      await feedingPromise;

      // Check state after feeding
      const afterState = usePetStore.getState();
      expect(afterState.isLoading).toBe(false);
      expect(afterState.isInteracting).toBe(false);
      expect(afterState.interactionType).toBeNull();
    });
  });

  describe('playWithPet', () => {
    it('should play with pet successfully', async () => {
      const playedPet = { ...mockStudyPet, happiness: 100 };
      vi.mocked(petService).playWithPet.mockResolvedValue(playedPet);
      const store = usePetStore.getState();

      await store.playWithPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(playedPet);
      expect(state.isLoading).toBe(false);
      expect(state.isInteracting).toBe(false);
      expect(state.needsAttention).toBe(false);
      expect(state.attentionReason).toBeNull();
      expect(vi.mocked(petService).playWithPet).toHaveBeenCalledWith(
        mockUserId
      );
    });

    it('should handle playing errors', async () => {
      vi.mocked(petService).playWithPet.mockRejectedValue(
        new Error('Playing failed')
      );
      const store = usePetStore.getState();

      await store.playWithPet(mockUserId);

      const state = usePetStore.getState();
      expect(state.error).toBe('Failed to play with pet');
      expect(state.isLoading).toBe(false);
      expect(state.isInteracting).toBe(false);
    });
  });

  describe('checkEvolution', () => {
    it('should evolve pet when possible', async () => {
      const evolvedPet = {
        ...mockStudyPet,
        evolution: {
          ...mockStudyPet.evolution,
          stage: {
            id: 'adult-stage',
            name: 'adult',
            description: 'Adult stage',
            imageUrl: '/adult.png',
            unlockedAbilities: [],
          },
        },
      };
      vi.mocked(petService).checkAndEvolvePet.mockResolvedValue({
        pet: evolvedPet,
        evolved: true,
        newStage: 'adult',
      });
      const store = usePetStore.getState();

      const result = await store.checkEvolution(mockUserId);

      expect(result).toBe(true);
      const state = usePetStore.getState();
      expect(state.pet).toEqual(evolvedPet);
      expect(state.isEvolving).toBe(false);
      expect(state.interactionType).toBe('evolve');
    });

    it('should not evolve pet when not possible', async () => {
      vi.mocked(petService).checkAndEvolvePet.mockResolvedValue({
        pet: mockStudyPet,
        evolved: false,
        newStage: null,
      });
      const store = usePetStore.getState();

      const result = await store.checkEvolution(mockUserId);

      expect(result).toBe(false);
      const state = usePetStore.getState();
      expect(state.pet).toEqual(mockStudyPet);
      expect(state.isEvolving).toBe(false);
    });

    it('should handle evolution errors', async () => {
      vi.mocked(petService).checkAndEvolvePet.mockRejectedValue(
        new Error('Evolution failed')
      );
      const store = usePetStore.getState();

      const result = await store.checkEvolution(mockUserId);

      expect(result).toBe(false);
      const state = usePetStore.getState();
      expect(state.error).toBe('Failed to check pet evolution');
      expect(state.isEvolving).toBe(false);
    });
  });

  describe('updateFromStudyActivity', () => {
    it('should update pet from study activity', async () => {
      const updatedPet = { ...mockStudyPet, happiness: 85 };
      vi.mocked(petService).updatePetFromStudyActivity.mockResolvedValue(
        updatedPet
      );
      const store = usePetStore.getState();
      const checkEvolutionSpy = vi
        .spyOn(store, 'checkEvolution')
        .mockResolvedValue(false);

      await store.updateFromStudyActivity(mockUserId, 'study_session', 30);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(updatedPet);
      expect(
        vi.mocked(petService).updatePetFromStudyActivity
      ).toHaveBeenCalledWith(mockUserId, 'study_session', 30);
      expect(checkEvolutionSpy).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle study activity update errors silently', async () => {
      vi.mocked(petService).updatePetFromStudyActivity.mockRejectedValue(
        new Error('Update failed')
      );
      const store = usePetStore.getState();

      await store.updateFromStudyActivity(mockUserId, 'study_session', 30);

      // Should not set error state to avoid disrupting user experience
      const state = usePetStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('fetchAccessories', () => {
    it('should fetch pet accessories', async () => {
      const mockAccessories = [
        {
          id: 'acc-1',
          name: 'Red Collar',
          description: 'A stylish red collar',
          imageUrl: '/accessories/red-collar.png',
          rarity: 'common' as const,
          unlockedAt: new Date(),
        },
      ];
      vi.mocked(petService).getPetAccessories.mockResolvedValue(
        mockAccessories
      );
      const store = usePetStore.getState();

      const result = await store.fetchAccessories(mockUserId);

      expect(result).toEqual(mockAccessories);
      expect(vi.mocked(petService).getPetAccessories).toHaveBeenCalledWith(
        mockUserId
      );
    });

    it('should handle fetch accessories errors', async () => {
      vi.mocked(petService).getPetAccessories.mockRejectedValue(
        new Error('Fetch failed')
      );
      const store = usePetStore.getState();

      const result = await store.fetchAccessories(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('unlockAccessory', () => {
    it('should unlock accessory successfully', async () => {
      const updatedPet = { ...mockStudyPet };
      vi.mocked(petService).addPetAccessory.mockResolvedValue(updatedPet);
      const store = usePetStore.getState();

      const accessory = {
        name: 'Blue Hat',
        description: 'A cool blue hat',
        imageUrl: '/accessories/blue-hat.png',
        rarity: 'rare' as const,
      };

      await store.unlockAccessory(mockUserId, accessory);

      const state = usePetStore.getState();
      expect(state.pet).toEqual(updatedPet);
      expect(state.isLoading).toBe(false);
      expect(vi.mocked(petService).addPetAccessory).toHaveBeenCalledWith(
        mockUserId,
        accessory
      );
    });

    it('should handle unlock accessory errors', async () => {
      vi.mocked(petService).addPetAccessory.mockRejectedValue(
        new Error('Unlock failed')
      );
      const store = usePetStore.getState();

      const accessory = {
        name: 'Blue Hat',
        description: 'A cool blue hat',
        imageUrl: '/accessories/blue-hat.png',
        rarity: 'rare' as const,
      };

      await store.unlockAccessory(mockUserId, accessory);

      const state = usePetStore.getState();
      expect(state.error).toBe('Failed to unlock accessory');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('pet food and toy management', () => {
    it('should fetch pet food', async () => {
      const store = usePetStore.getState();

      await store.fetchPetFood();

      const state = usePetStore.getState();
      expect(state.petFood).toHaveLength(2);
      expect(state.petFood[0]).toMatchObject({
        id: 'basic-kibble',
        name: 'Basic Kibble',
        category: 'basic',
      });
      expect(state.isLoading).toBe(false);
    });

    it('should fetch pet toys', async () => {
      const store = usePetStore.getState();

      await store.fetchPetToys();

      const state = usePetStore.getState();
      expect(state.petToys).toHaveLength(2);
      expect(state.petToys[0]).toMatchObject({
        id: 'ball',
        name: 'Bouncy Ball',
        category: 'interactive',
      });
      expect(state.isLoading).toBe(false);
    });

    it('should select food', () => {
      const store = usePetStore.getState();
      const food: PetFood = {
        id: 'test-food',
        name: 'Test Food',
        description: 'Test food item',
        type: 'meal',
        cost: 10,
        effects: [],
        rarity: 'common',
        imageUrl: '/test.png',
        category: 'basic',
      };

      store.selectFood(food);

      const state = usePetStore.getState();
      expect(state.selectedFood).toEqual(food);
    });

    it('should select toy', () => {
      const store = usePetStore.getState();
      const toy: PetToy = {
        id: 'test-toy',
        name: 'Test Toy',
        description: 'Test toy item',
        cost: 15,
        effects: [],
        rarity: 'common',
        imageUrl: '/test.png',
        category: 'interactive',
        durability: 10,
      };

      store.selectToy(toy);

      const state = usePetStore.getState();
      expect(state.selectedToy).toEqual(toy);
    });

    it('should use food item', async () => {
      vi.mocked(petService).feedPet.mockResolvedValue(mockStudyPet);
      const store = usePetStore.getState();
      const feedPetSpy = vi.spyOn(store, 'feedPet').mockResolvedValue();

      await store.useFood(mockUserId, 'basic-kibble');

      expect(feedPetSpy).toHaveBeenCalledWith(mockUserId, 'basic-kibble');
      const state = usePetStore.getState();
      expect(state.isFeeding).toBe(false);
      expect(state.selectedFood).toBeNull();
    });

    it('should use toy item', async () => {
      vi.mocked(petService).playWithPet.mockResolvedValue(mockStudyPet);
      const store = usePetStore.getState();
      const playWithPetSpy = vi.spyOn(store, 'playWithPet').mockResolvedValue();

      await store.useToy(mockUserId, 'ball');

      expect(playWithPetSpy).toHaveBeenCalledWith(mockUserId, 'ball');
      const state = usePetStore.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.selectedToy).toBeNull();
    });
  });

  describe('auto-care settings', () => {
    it('should set auto-care enabled', () => {
      const store = usePetStore.getState();

      store.setAutoCareEnabled(true);

      const state = usePetStore.getState();
      expect(state.autoCareEnabled).toBe(true);
    });

    it('should set auto-feed threshold', () => {
      const store = usePetStore.getState();

      store.setAutoFeedThreshold(50);

      const state = usePetStore.getState();
      expect(state.autoFeedThreshold).toBe(50);
    });

    it('should clamp auto-feed threshold to 0-100 range', () => {
      const store = usePetStore.getState();

      store.setAutoFeedThreshold(150);
      expect(usePetStore.getState().autoFeedThreshold).toBe(100);

      store.setAutoFeedThreshold(-10);
      expect(usePetStore.getState().autoFeedThreshold).toBe(0);
    });

    it('should set auto-play threshold', () => {
      const store = usePetStore.getState();

      store.setAutoPlayThreshold(60);

      const state = usePetStore.getState();
      expect(state.autoPlayThreshold).toBe(60);
    });

    it('should perform auto-care when conditions are met', async () => {
      const store = usePetStore.getState();
      const feedPetSpy = vi.spyOn(store, 'feedPet').mockResolvedValue();
      const playWithPetSpy = vi.spyOn(store, 'playWithPet').mockResolvedValue();

      // Set up auto-care conditions
      store.setAutoCareEnabled(true);
      store.setAutoFeedThreshold(40);
      store.setAutoPlayThreshold(50);

      // Mock pet status that triggers auto-care
      const mockPetStatus = {
        health: 90,
        happiness: 40, // Below play threshold
        hunger: 50, // Above feed threshold
        energy: 70,
        mood: 'idle' as const,
        needsAttention: true,
        timeSinceLastFed: 60,
        timeSinceLastPlayed: 120,
        evolutionProgress: 25,
      };

      // Set the pet and status
      usePetStore.setState({
        pet: mockStudyPet,
        petStatus: mockPetStatus,
        autoCareEnabled: true,
        autoFeedThreshold: 40,
        autoPlayThreshold: 50,
      });

      await store.performAutoCare(mockUserId);

      expect(feedPetSpy).toHaveBeenCalledWith(mockUserId);
      expect(playWithPetSpy).toHaveBeenCalledWith(mockUserId);
    });

    it('should not perform auto-care when disabled', async () => {
      const store = usePetStore.getState();
      const feedPetSpy = vi.spyOn(store, 'feedPet').mockResolvedValue();
      const playWithPetSpy = vi.spyOn(store, 'playWithPet').mockResolvedValue();

      // Set up conditions but disable auto-care
      usePetStore.setState({
        pet: mockStudyPet,
        autoCareEnabled: false,
      });

      await store.performAutoCare(mockUserId);

      expect(feedPetSpy).not.toHaveBeenCalled();
      expect(playWithPetSpy).not.toHaveBeenCalled();
    });
  });

  describe('pet status and needs', () => {
    beforeEach(() => {
      // Mock hunger system calculations
      vi.mocked(petHungerSystem).calculateHungerFromTime.mockReturnValue(40);
      vi.mocked(petHungerSystem).calculateHealthImpact.mockReturnValue(85);
      vi.mocked(petHungerSystem).calculateHappinessImpact.mockReturnValue(75);
    });

    it('should update pet status', async () => {
      const store = usePetStore.getState();
      usePetStore.setState({ pet: mockStudyPet });

      await store.updatePetStatus(mockUserId);

      const state = usePetStore.getState();
      expect(state.petStatus).toBeDefined();
      expect(state.petStatus?.hunger).toBe(40);
      expect(state.petStatus?.health).toBe(85);
      expect(state.petStatus?.happiness).toBe(75);
    });

    it('should check pet needs', async () => {
      // Clear the default mock and set up specific mock for this test
      vi.mocked(petService.checkPetNeeds).mockClear();
      vi.mocked(petService.checkPetNeeds).mockResolvedValue({
        needsAttention: true,
        reason: 'hungry',
      });

      const store = usePetStore.getState();
      await store.checkPetNeeds(mockUserId);

      const state = usePetStore.getState();
      expect(state.needsAttention).toBe(true);
      expect(state.attentionReason).toBe('hungry');
      expect(state.petNeeds).toHaveLength(1);
      expect(state.petNeeds[0]).toMatchObject({
        type: 'food',
        urgency: 'high',
        description: 'Your pet is hungry and needs food',
      });
    });

    it('should check evolution eligibility', async () => {
      const store = usePetStore.getState();
      usePetStore.setState({ pet: mockStudyPet });

      await store.checkEvolutionEligibility(mockUserId);

      const state = usePetStore.getState();
      expect(state.evolutionEligibility).toBeDefined();
      expect(state.evolutionEligibility?.canEvolve).toBe(false); // Level 1 < 5 and happiness 80 >= 80
    });
  });

  describe('state management utilities', () => {
    it('should set loading state', () => {
      const store = usePetStore.getState();

      store.setLoading(true);
      expect(usePetStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(usePetStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      const store = usePetStore.getState();

      store.setError('Test error');
      expect(usePetStore.getState().error).toBe('Test error');

      store.setError(null);
      expect(usePetStore.getState().error).toBeNull();
    });

    it('should set adopting state', () => {
      const store = usePetStore.getState();

      store.setAdopting(true);
      expect(usePetStore.getState().isAdopting).toBe(true);

      store.setAdopting(false);
      expect(usePetStore.getState().isAdopting).toBe(false);
    });

    it('should set evolving state', () => {
      const store = usePetStore.getState();

      store.setEvolving(true);
      expect(usePetStore.getState().isEvolving).toBe(true);

      store.setEvolving(false);
      expect(usePetStore.getState().isEvolving).toBe(false);
    });

    it('should set interacting state', () => {
      const store = usePetStore.getState();

      store.setInteracting(true, 'feed');
      expect(usePetStore.getState().isInteracting).toBe(true);
      expect(usePetStore.getState().interactionType).toBe('feed');

      store.setInteracting(false);
      expect(usePetStore.getState().isInteracting).toBe(false);
      expect(usePetStore.getState().interactionType).toBeNull();
    });

    it('should set feeding state', () => {
      const store = usePetStore.getState();

      store.setFeeding(true);
      expect(usePetStore.getState().isFeeding).toBe(true);

      store.setFeeding(false);
      expect(usePetStore.getState().isFeeding).toBe(false);
    });

    it('should set playing state', () => {
      const store = usePetStore.getState();

      store.setPlaying(true);
      expect(usePetStore.getState().isPlaying).toBe(true);

      store.setPlaying(false);
      expect(usePetStore.getState().isPlaying).toBe(false);
    });
  });

  describe('reset functionality', () => {
    it('should reset store to initial state', () => {
      const store = usePetStore.getState();

      // Make some changes
      usePetStore.setState({
        pet: mockStudyPet,
        species: mockSpecies,
        isLoading: true,
        error: 'Test error',
        needsAttention: true,
      });

      // Reset
      store.reset();

      const state = usePetStore.getState();
      expect(state.pet).toBeNull();
      expect(state.species).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.needsAttention).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist important state properties', () => {
      const store = usePetStore.getState();

      // The persist middleware should save these properties
      const persistedKeys = [
        'pet',
        'lastInteraction',
        'needsAttention',
        'attentionReason',
      ];

      // These properties should exist in the store
      persistedKeys.forEach(key => {
        expect(store).toHaveProperty(key);
      });
    });
  });
});
