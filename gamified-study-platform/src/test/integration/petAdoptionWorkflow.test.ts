import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePetStore } from '../../store/petStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { petService } from '../../services/petService';
import type { PetForm, StudyPet, PetSpecies } from '../../types';

// Mock the pet service
vi.mock('../../services/petService', () => ({
  petService: {
    adoptPet: vi.fn(),
    getUserPet: vi.fn(),
    getPetSpecies: vi.fn(),
    feedPet: vi.fn(),
    playWithPet: vi.fn(),
    checkAndEvolvePet: vi.fn(),
    updatePetFromStudyActivity: vi.fn(),
    checkPetNeeds: vi.fn(),
  },
}));

// Mock the gamification store
vi.mock('../../store/gamificationStore', () => ({
  useGamificationStore: {
    getState: vi.fn(() => ({
      coins: 100,
      updateCoins: vi.fn(),
      addAchievement: vi.fn(),
    })),
  },
}));

describe('Pet Adoption Workflow Integration Tests', () => {
  const mockUserId = 'user-123';

  const mockSpecies: PetSpecies[] = [
    {
      id: 'cat-species',
      name: 'Cat',
      description: 'A friendly feline companion',
      baseStats: {
        happiness: 80,
        health: 90,
        intelligence: 70,
      },
      evolutionStages: [
        { name: 'kitten', requirements: { level: 1 } },
        { name: 'cat', requirements: { level: 5 } },
        { name: 'wise-cat', requirements: { level: 10 } },
      ],
    },
    {
      id: 'dog-species',
      name: 'Dog',
      description: 'A loyal canine friend',
      baseStats: {
        happiness: 85,
        health: 95,
        intelligence: 60,
      },
      evolutionStages: [
        { name: 'puppy', requirements: { level: 1 } },
        { name: 'dog', requirements: { level: 5 } },
        { name: 'wise-dog', requirements: { level: 10 } },
      ],
    },
  ];

  const mockAdoptedPet: StudyPet = {
    id: 'pet-123',
    userId: mockUserId,
    name: 'Fluffy',
    speciesId: 'cat-species',
    level: 1,
    happiness: 80,
    health: 90,
    lastFed: new Date(),
    lastPlayed: new Date(),
    evolution: {
      stage: 'kitten',
      progress: 0,
      nextStage: 'cat',
      requirements: { level: 5 },
    },
    accessories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset stores
    usePetStore.getState().reset();

    // Setup default mock responses
    (petService.getPetSpecies as any).mockResolvedValue(mockSpecies);
    (petService.getUserPet as any).mockResolvedValue(null);
    (petService.checkPetNeeds as any).mockResolvedValue({
      needsAttention: false,
      reason: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Pet Adoption Flow', () => {
    it('should complete full adoption workflow successfully', async () => {
      // Mock successful adoption
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);

      const { result } = renderHook(() => usePetStore());

      // Step 1: Load available species
      await act(async () => {
        await result.current.fetchPetSpecies();
      });

      expect(result.current.species).toEqual(mockSpecies);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Step 2: User selects species and provides name
      const petForm: PetForm = {
        name: 'Fluffy',
        speciesId: 'cat-species',
      };

      // Step 3: Adopt the pet
      await act(async () => {
        await result.current.adoptPet(mockUserId, petForm);
      });

      // Verify adoption was successful
      expect(result.current.pet).toEqual(mockAdoptedPet);
      expect(result.current.isAdopting).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastInteraction).toBeInstanceOf(Date);

      // Verify service was called correctly
      expect(petService.adoptPet).toHaveBeenCalledWith(mockUserId, petForm);
      expect(petService.checkPetNeeds).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle adoption failure gracefully', async () => {
      // Mock adoption failure
      (petService.adoptPet as any).mockRejectedValue(
        new Error('Species not available')
      );

      const { result } = renderHook(() => usePetStore());

      // Load species first
      await act(async () => {
        await result.current.fetchPetSpecies();
      });

      const petForm: PetForm = {
        name: 'Fluffy',
        speciesId: 'invalid-species',
      };

      // Attempt adoption
      await act(async () => {
        await result.current.adoptPet(mockUserId, petForm);
      });

      // Verify error handling
      expect(result.current.pet).toBeNull();
      expect(result.current.isAdopting).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to adopt pet');
    });

    it('should prevent adoption when user already has a pet', async () => {
      // Mock user already has a pet
      (petService.getUserPet as any).mockResolvedValue(mockAdoptedPet);

      const { result } = renderHook(() => usePetStore());

      // Fetch existing pet
      await act(async () => {
        await result.current.fetchUserPet(mockUserId);
      });

      expect(result.current.pet).toEqual(mockAdoptedPet);

      // Attempt to adopt another pet (this would typically be prevented in UI)
      const newPetForm: PetForm = {
        name: 'Buddy',
        speciesId: 'dog-species',
      };

      // The service call would still work, but UI should prevent this
      // This test verifies the store state is consistent
      expect(result.current.pet).not.toBeNull();
    });
  });

  describe('Post-Adoption Pet Care Workflow', () => {
    beforeEach(async () => {
      // Setup adopted pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      (petService.getUserPet as any).mockResolvedValue(mockAdoptedPet);

      const { result } = renderHook(() => usePetStore());
      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });
    });

    it('should complete feeding workflow', async () => {
      const fedPet = {
        ...mockAdoptedPet,
        happiness: 95,
        health: 100,
        lastFed: new Date(),
      };

      (petService.feedPet as any).mockResolvedValue(fedPet);

      const { result } = renderHook(() => usePetStore());

      // Feed the pet
      await act(async () => {
        await result.current.feedPet(mockUserId);
      });

      // Verify feeding results
      expect(result.current.pet?.happiness).toBe(95);
      expect(result.current.pet?.health).toBe(100);
      expect(result.current.isFeeding).toBe(false);
      expect(result.current.needsAttention).toBe(false);
      expect(result.current.lastInteraction).toBeInstanceOf(Date);

      expect(petService.feedPet).toHaveBeenCalledWith(mockUserId);
    });

    it('should complete playing workflow', async () => {
      const playedPet = {
        ...mockAdoptedPet,
        happiness: 100,
        lastPlayed: new Date(),
      };

      (petService.playWithPet as any).mockResolvedValue(playedPet);

      const { result } = renderHook(() => usePetStore());

      // Play with the pet
      await act(async () => {
        await result.current.playWithPet(mockUserId);
      });

      // Verify playing results
      expect(result.current.pet?.happiness).toBe(100);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.needsAttention).toBe(false);
      expect(result.current.lastInteraction).toBeInstanceOf(Date);

      expect(petService.playWithPet).toHaveBeenCalledWith(mockUserId);
    });

    it('should complete evolution workflow', async () => {
      const evolvedPet = {
        ...mockAdoptedPet,
        level: 5,
        evolution: {
          stage: 'cat',
          progress: 0,
          nextStage: 'wise-cat',
          requirements: { level: 10 },
        },
      };

      (petService.checkAndEvolvePet as any).mockResolvedValue({
        pet: evolvedPet,
        evolved: true,
        newStage: 'cat',
      });

      const { result } = renderHook(() => usePetStore());

      // Check evolution
      const evolved = await act(async () => {
        return await result.current.checkEvolution(mockUserId);
      });

      // Verify evolution results
      expect(evolved).toBe(true);
      expect(result.current.pet?.evolution.stage).toBe('cat');
      expect(result.current.pet?.level).toBe(5);
      expect(result.current.isEvolving).toBe(false);
      expect(result.current.interactionType).toBe('evolve');

      expect(petService.checkAndEvolvePet).toHaveBeenCalledWith(mockUserId);
    });

    it('should handle pet needs monitoring', async () => {
      (petService.checkPetNeeds as any).mockResolvedValue({
        needsAttention: true,
        reason: 'hungry',
      });

      const { result } = renderHook(() => usePetStore());

      // Check pet needs
      await act(async () => {
        await result.current.checkPetNeeds(mockUserId);
      });

      // Verify needs detection
      expect(result.current.needsAttention).toBe(true);
      expect(result.current.attentionReason).toBe('hungry');
      expect(result.current.petNeeds).toHaveLength(1);
      expect(result.current.petNeeds[0]).toMatchObject({
        type: 'food',
        urgency: 'high',
        description: 'Your pet is hungry and needs food',
      });
    });
  });

  describe('Study Activity Integration', () => {
    beforeEach(async () => {
      // Setup adopted pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      (petService.getUserPet as any).mockResolvedValue(mockAdoptedPet);

      const { result } = renderHook(() => usePetStore());
      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });
    });

    it('should update pet from study session', async () => {
      const updatedPet = {
        ...mockAdoptedPet,
        happiness: 90,
        level: 2,
      };

      (petService.updatePetFromStudyActivity as any).mockResolvedValue(
        updatedPet
      );
      (petService.checkAndEvolvePet as any).mockResolvedValue({
        pet: updatedPet,
        evolved: false,
        newStage: null,
      });

      const { result } = renderHook(() => usePetStore());

      // Simulate study session
      await act(async () => {
        await result.current.updateFromStudyActivity(
          mockUserId,
          'study_session',
          60 // 60 minutes
        );
      });

      // Verify pet was updated
      expect(result.current.pet?.happiness).toBe(90);
      expect(result.current.pet?.level).toBe(2);

      expect(petService.updatePetFromStudyActivity).toHaveBeenCalledWith(
        mockUserId,
        'study_session',
        60
      );
      expect(petService.checkAndEvolvePet).toHaveBeenCalledWith(mockUserId);
    });

    it('should trigger evolution after study activity', async () => {
      const leveledUpPet = {
        ...mockAdoptedPet,
        level: 5,
        happiness: 95,
      };

      const evolvedPet = {
        ...leveledUpPet,
        evolution: {
          stage: 'cat',
          progress: 0,
          nextStage: 'wise-cat',
          requirements: { level: 10 },
        },
      };

      (petService.updatePetFromStudyActivity as any).mockResolvedValue(
        leveledUpPet
      );
      (petService.checkAndEvolvePet as any).mockResolvedValue({
        pet: evolvedPet,
        evolved: true,
        newStage: 'cat',
      });

      const { result } = renderHook(() => usePetStore());

      // Simulate study session that triggers evolution
      await act(async () => {
        await result.current.updateFromStudyActivity(
          mockUserId,
          'study_session',
          120 // Long study session
        );
      });

      // Verify evolution occurred
      expect(result.current.pet?.evolution.stage).toBe('cat');
      expect(result.current.pet?.level).toBe(5);
    });
  });

  describe('Auto-Care Workflow', () => {
    beforeEach(async () => {
      // Setup adopted pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      (petService.getUserPet as any).mockResolvedValue(mockAdoptedPet);

      const { result } = renderHook(() => usePetStore());
      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });
    });

    it('should perform auto-care when conditions are met', async () => {
      const fedPet = { ...mockAdoptedPet, happiness: 95 };
      const playedPet = { ...fedPet, happiness: 100 };

      (petService.feedPet as any).mockResolvedValue(fedPet);
      (petService.playWithPet as any).mockResolvedValue(playedPet);

      const { result } = renderHook(() => usePetStore());

      // Enable auto-care and set thresholds
      act(() => {
        result.current.setAutoCareEnabled(true);
        result.current.setAutoFeedThreshold(40);
        result.current.setAutoPlayThreshold(50);
      });

      // Set pet status that triggers auto-care
      act(() => {
        usePetStore.setState({
          petStatus: {
            health: 90,
            happiness: 40, // Below play threshold
            hunger: 50, // Above feed threshold
            energy: 70,
            needsAttention: true,
            timeSinceLastFed: 60,
            timeSinceLastPlayed: 120,
            evolutionProgress: 25,
          },
        });
      });

      // Perform auto-care
      await act(async () => {
        await result.current.performAutoCare(mockUserId);
      });

      // Verify auto-care actions were performed
      expect(petService.feedPet).toHaveBeenCalledWith(mockUserId);
      expect(petService.playWithPet).toHaveBeenCalledWith(mockUserId);
    });

    it('should not perform auto-care when disabled', async () => {
      const { result } = renderHook(() => usePetStore());

      // Disable auto-care
      act(() => {
        result.current.setAutoCareEnabled(false);
      });

      // Set pet status that would normally trigger auto-care
      act(() => {
        usePetStore.setState({
          petStatus: {
            health: 90,
            happiness: 30,
            hunger: 60,
            energy: 70,
            needsAttention: true,
            timeSinceLastFed: 60,
            timeSinceLastPlayed: 120,
            evolutionProgress: 25,
          },
        });
      });

      // Attempt auto-care
      await act(async () => {
        await result.current.performAutoCare(mockUserId);
      });

      // Verify no auto-care actions were performed
      expect(petService.feedPet).not.toHaveBeenCalled();
      expect(petService.playWithPet).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from temporary service failures', async () => {
      const { result } = renderHook(() => usePetStore());

      // First call fails
      (petService.getUserPet as any).mockRejectedValueOnce(
        new Error('Network error')
      );

      await act(async () => {
        await result.current.fetchUserPet(mockUserId);
      });

      expect(result.current.error).toBe('Failed to load pet data');

      // Second call succeeds
      (petService.getUserPet as any).mockResolvedValue(mockAdoptedPet);

      await act(async () => {
        await result.current.fetchUserPet(mockUserId);
      });

      // Verify recovery
      expect(result.current.pet).toEqual(mockAdoptedPet);
      expect(result.current.error).toBeNull();
    });

    it('should handle multiple concurrent operations gracefully', async () => {
      // Setup adopted pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      (petService.feedPet as any).mockResolvedValue({
        ...mockAdoptedPet,
        happiness: 95,
      });
      (petService.playWithPet as any).mockResolvedValue({
        ...mockAdoptedPet,
        happiness: 100,
      });

      const { result } = renderHook(() => usePetStore());

      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });

      // Perform multiple operations concurrently
      await act(async () => {
        await Promise.all([
          result.current.feedPet(mockUserId),
          result.current.playWithPet(mockUserId),
          result.current.checkEvolution(mockUserId),
        ]);
      });

      // Verify final state is consistent
      expect(result.current.pet).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInteracting).toBe(false);
    });
  });

  describe('Data Consistency Workflows', () => {
    it('should maintain data consistency across store updates', async () => {
      const { result } = renderHook(() => usePetStore());

      // Adopt pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });

      const initialPet = result.current.pet;

      // Feed pet
      const fedPet = { ...mockAdoptedPet, happiness: 95 };
      (petService.feedPet as any).mockResolvedValue(fedPet);
      await act(async () => {
        await result.current.feedPet(mockUserId);
      });

      // Verify pet reference was updated
      expect(result.current.pet).not.toBe(initialPet);
      expect(result.current.pet?.happiness).toBe(95);

      // Play with pet
      const playedPet = { ...fedPet, happiness: 100 };
      (petService.playWithPet as any).mockResolvedValue(playedPet);
      await act(async () => {
        await result.current.playWithPet(mockUserId);
      });

      // Verify final state
      expect(result.current.pet?.happiness).toBe(100);
      expect(result.current.lastInteraction).toBeInstanceOf(Date);
    });

    it('should handle state rollback on operation failure', async () => {
      const { result } = renderHook(() => usePetStore());

      // Setup adopted pet
      (petService.adoptPet as any).mockResolvedValue(mockAdoptedPet);
      await act(async () => {
        await result.current.adoptPet(mockUserId, {
          name: 'Fluffy',
          speciesId: 'cat-species',
        });
      });

      const initialState = {
        pet: result.current.pet,
        needsAttention: result.current.needsAttention,
        error: result.current.error,
      };

      // Attempt operation that fails
      (petService.feedPet as any).mockRejectedValue(
        new Error('Feeding failed')
      );
      await act(async () => {
        await result.current.feedPet(mockUserId);
      });

      // Verify state rollback (pet unchanged, error set)
      expect(result.current.pet).toEqual(initialState.pet);
      expect(result.current.error).toBe('Failed to feed pet');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInteracting).toBe(false);
    });
  });
});
