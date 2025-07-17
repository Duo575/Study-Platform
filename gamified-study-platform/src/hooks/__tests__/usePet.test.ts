import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePet } from '../usePet';
import type { StudyPet, PetForm, PetSpecies } from '../../types';

// Mock the pet service
const mockPetService = {
  adoptPet: vi.fn(),
  getUserPet: vi.fn(),
  getPetSpecies: vi.fn(),
  feedPet: vi.fn(),
  playWithPet: vi.fn(),
  checkAndEvolvePet: vi.fn(),
  updatePetFromStudyActivity: vi.fn(),
  getPetAccessories: vi.fn(),
  addPetAccessory: vi.fn(),
  checkPetNeeds: vi.fn()
};

vi.mock('../../services/petService', () => ({
  petService: mockPetService
}));

// Mock the auth context
const mockUser = { id: 'user-123', email: 'test@example.com' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('usePet Hook', () => {
  const mockStudyPet: StudyPet = {
    id: 'pet-123',
    userId: 'user-123',
    name: 'Buddy',
    speciesId: 'dragon',
    level: 3,
    happiness: 75,
    health: 80,
    evolutionStage: 'teen',
    accessories: [],
    lastFed: new Date(),
    lastPlayed: new Date(),
    lastInteraction: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockPetSpecies: PetSpecies[] = [
    {
      id: 'dragon',
      name: 'Study Dragon',
      description: 'A wise dragon that grows stronger with knowledge',
      baseStats: { happiness: 50, health: 50, intelligence: 70 },
      evolutionStages: [
        { name: 'baby', requirements: { level: 1 } },
        { name: 'teen', requirements: { level: 5 } },
        { name: 'adult', requirements: { level: 10 } }
      ]
    },
    {
      id: 'owl',
      name: 'Scholar Owl',
      description: 'A nocturnal companion perfect for late-night study sessions',
      baseStats: { happiness: 60, health: 40, intelligence: 80 },
      evolutionStages: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.pet).toBeNull();
      expect(result.current.species).toEqual([]);
      expect(result.current.accessories).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.needsAttention).toBe(false);
      expect(result.current.attentionReason).toBeNull();
    });
  });

  describe('loadPetData', () => {
    it('should load pet data successfully', async () => {
      mockPetService.getUserPet.mockResolvedValue(mockStudyPet);
      mockPetService.getPetSpecies.mockResolvedValue(mockPetSpecies);
      mockPetService.getPetAccessories.mockResolvedValue([]);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.loadPetData();
      });

      expect(result.current.pet).toEqual(mockStudyPet);
      expect(result.current.species).toEqual(mockPetSpecies);
      expect(result.current.accessories).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.needsAttention).toBe(false);
    });

    it('should handle no pet case', async () => {
      mockPetService.getUserPet.mockResolvedValue(null);
      mockPetService.getPetSpecies.mockResolvedValue(mockPetSpecies);

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.loadPetData();
      });

      expect(result.current.pet).toBeNull();
      expect(result.current.species).toEqual(mockPetSpecies);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle load error', async () => {
      const errorMessage = 'Failed to load pet data';
      mockPetService.getUserPet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.loadPetData();
      });

      expect(result.current.pet).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('adoptPet', () => {
    it('should adopt pet successfully', async () => {
      const petForm: PetForm = { name: 'Buddy', speciesId: 'dragon' };
      mockPetService.adoptPet.mockResolvedValue(mockStudyPet);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      let adoptResult;
      await act(async () => {
        adoptResult = await result.current.adoptPet(petForm);
      });

      expect(adoptResult).toEqual(mockStudyPet);
      expect(result.current.pet).toEqual(mockStudyPet);
      expect(mockPetService.adoptPet).toHaveBeenCalledWith('user-123', petForm);
    });

    it('should handle adopt error', async () => {
      const petForm: PetForm = { name: 'Buddy', speciesId: 'dragon' };
      const errorMessage = 'Failed to adopt pet';
      mockPetService.adoptPet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const adoptResult = await result.current.adoptPet(petForm);
        expect(adoptResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('feedPet', () => {
    it('should feed pet successfully', async () => {
      const fedPet = { ...mockStudyPet, happiness: 90, health: 95 };
      mockPetService.feedPet.mockResolvedValue(fedPet);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      let feedResult;
      await act(async () => {
        feedResult = await result.current.feedPet();
      });

      expect(feedResult).toEqual(fedPet);
      expect(result.current.pet).toEqual(fedPet);
      expect(mockPetService.feedPet).toHaveBeenCalledWith('user-123');
    });

    it('should handle feed error', async () => {
      const errorMessage = 'Failed to feed pet';
      mockPetService.feedPet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const feedResult = await result.current.feedPet();
        expect(feedResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('playWithPet', () => {
    it('should play with pet successfully', async () => {
      const playedPet = { ...mockStudyPet, happiness: 95 };
      mockPetService.playWithPet.mockResolvedValue(playedPet);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      let playResult;
      await act(async () => {
        playResult = await result.current.playWithPet();
      });

      expect(playResult).toEqual(playedPet);
      expect(result.current.pet).toEqual(playedPet);
      expect(mockPetService.playWithPet).toHaveBeenCalledWith('user-123');
    });

    it('should handle play error', async () => {
      const errorMessage = 'Failed to play with pet';
      mockPetService.playWithPet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const playResult = await result.current.playWithPet();
        expect(playResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('checkEvolution', () => {
    it('should check evolution successfully with evolution', async () => {
      const evolutionResult = {
        pet: { ...mockStudyPet, evolutionStage: 'adult' as const },
        evolved: true,
        newStage: 'adult'
      };

      mockPetService.checkAndEvolvePet.mockResolvedValue(evolutionResult);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkEvolution();
      });

      expect(checkResult).toEqual(evolutionResult);
      expect(result.current.pet).toEqual(evolutionResult.pet);
      expect(mockPetService.checkAndEvolvePet).toHaveBeenCalledWith('user-123');
    });

    it('should check evolution successfully without evolution', async () => {
      const evolutionResult = {
        pet: mockStudyPet,
        evolved: false,
        newStage: null
      };

      mockPetService.checkAndEvolvePet.mockResolvedValue(evolutionResult);

      const { result } = renderHook(() => usePet());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkEvolution();
      });

      expect(checkResult).toEqual(evolutionResult);
      expect(result.current.pet).toEqual(mockStudyPet);
    });

    it('should handle evolution check error', async () => {
      const errorMessage = 'Failed to check evolution';
      mockPetService.checkAndEvolvePet.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const checkResult = await result.current.checkEvolution();
        expect(checkResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('updateFromStudyActivity', () => {
    it('should update pet from study activity successfully', async () => {
      const updatedPet = { ...mockStudyPet, happiness: 85 };
      mockPetService.updatePetFromStudyActivity.mockResolvedValue(updatedPet);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      const { result } = renderHook(() => usePet());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateFromStudyActivity('study_session', 60);
      });

      expect(updateResult).toEqual(updatedPet);
      expect(result.current.pet).toEqual(updatedPet);
      expect(mockPetService.updatePetFromStudyActivity).toHaveBeenCalledWith(
        'user-123',
        'study_session',
        60
      );
    });

    it('should handle update from study activity error', async () => {
      const errorMessage = 'Failed to update pet';
      mockPetService.updatePetFromStudyActivity.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const updateResult = await result.current.updateFromStudyActivity('study_session', 60);
        expect(updateResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('addAccessory', () => {
    it('should add accessory successfully', async () => {
      const newAccessory = {
        name: 'Study Hat',
        description: 'A hat for studying',
        imageUrl: '/accessories/hat.png',
        rarity: 'common' as const
      };

      const updatedPet = {
        ...mockStudyPet,
        accessories: [{ ...newAccessory, id: 'acc-1', unlockedAt: new Date() }]
      };

      mockPetService.addPetAccessory.mockResolvedValue(updatedPet);
      mockPetService.getPetAccessories.mockResolvedValue(updatedPet.accessories);

      const { result } = renderHook(() => usePet());

      let addResult;
      await act(async () => {
        addResult = await result.current.addAccessory(newAccessory);
      });

      expect(addResult).toEqual(updatedPet);
      expect(result.current.pet).toEqual(updatedPet);
      expect(result.current.accessories).toEqual(updatedPet.accessories);
      expect(mockPetService.addPetAccessory).toHaveBeenCalledWith('user-123', newAccessory);
    });

    it('should handle add accessory error', async () => {
      const newAccessory = {
        name: 'Study Hat',
        description: 'A hat for studying',
        imageUrl: '/accessories/hat.png',
        rarity: 'common' as const
      };

      const errorMessage = 'Failed to add accessory';
      mockPetService.addPetAccessory.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const addResult = await result.current.addAccessory(newAccessory);
        expect(addResult).toBeNull();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('checkNeeds', () => {
    it('should check pet needs successfully', async () => {
      const needsResult = { needsAttention: true, reason: 'hungry' };
      mockPetService.checkPetNeeds.mockResolvedValue(needsResult);

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.checkNeeds();
      });

      expect(result.current.needsAttention).toBe(true);
      expect(result.current.attentionReason).toBe('hungry');
      expect(mockPetService.checkPetNeeds).toHaveBeenCalledWith('user-123');
    });

    it('should handle check needs error', async () => {
      const errorMessage = 'Failed to check needs';
      mockPetService.checkPetNeeds.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.checkNeeds();
      });

      expect(result.current.needsAttention).toBe(false);
      expect(result.current.attentionReason).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Utility Functions', () => {
    it('should check if user has pet', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.hasPet()).toBe(false);

      act(() => {
        result.current.pet = mockStudyPet;
      });

      expect(result.current.hasPet()).toBe(true);
    });

    it('should get pet happiness level', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.getHappinessLevel()).toBe('unknown');

      act(() => {
        result.current.pet = { ...mockStudyPet, happiness: 90 };
      });

      expect(result.current.getHappinessLevel()).toBe('very-happy');

      act(() => {
        result.current.pet = { ...mockStudyPet, happiness: 70 };
      });

      expect(result.current.getHappinessLevel()).toBe('happy');

      act(() => {
        result.current.pet = { ...mockStudyPet, happiness: 50 };
      });

      expect(result.current.getHappinessLevel()).toBe('neutral');

      act(() => {
        result.current.pet = { ...mockStudyPet, happiness: 30 };
      });

      expect(result.current.getHappinessLevel()).toBe('sad');

      act(() => {
        result.current.pet = { ...mockStudyPet, happiness: 10 };
      });

      expect(result.current.getHappinessLevel()).toBe('very-sad');
    });

    it('should get pet health level', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.getHealthLevel()).toBe('unknown');

      act(() => {
        result.current.pet = { ...mockStudyPet, health: 90 };
      });

      expect(result.current.getHealthLevel()).toBe('excellent');

      act(() => {
        result.current.pet = { ...mockStudyPet, health: 70 };
      });

      expect(result.current.getHealthLevel()).toBe('good');

      act(() => {
        result.current.pet = { ...mockStudyPet, health: 50 };
      });

      expect(result.current.getHealthLevel()).toBe('fair');

      act(() => {
        result.current.pet = { ...mockStudyPet, health: 30 };
      });

      expect(result.current.getHealthLevel()).toBe('poor');

      act(() => {
        result.current.pet = { ...mockStudyPet, health: 10 };
      });

      expect(result.current.getHealthLevel()).toBe('critical');
    });

    it('should check if pet can evolve', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.canEvolve()).toBe(false);

      act(() => {
        result.current.pet = { ...mockStudyPet, level: 5, evolutionStage: 'teen' };
        result.current.species = mockPetSpecies;
      });

      expect(result.current.canEvolve()).toBe(false); // Level 5 required for teen, but already teen

      act(() => {
        result.current.pet = { ...mockStudyPet, level: 10, evolutionStage: 'teen' };
      });

      expect(result.current.canEvolve()).toBe(true); // Level 10 required for adult, currently teen
    });

    it('should get next evolution stage', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.getNextEvolutionStage()).toBeNull();

      act(() => {
        result.current.pet = { ...mockStudyPet, evolutionStage: 'teen' };
        result.current.species = mockPetSpecies;
      });

      const nextStage = result.current.getNextEvolutionStage();
      expect(nextStage?.name).toBe('adult');
      expect(nextStage?.requirements.level).toBe(10);
    });

    it('should get time since last interaction', () => {
      const { result } = renderHook(() => usePet());

      expect(result.current.getTimeSinceLastInteraction()).toBe(0);

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      act(() => {
        result.current.pet = { ...mockStudyPet, lastInteraction: oneHourAgo };
      });

      const timeSince = result.current.getTimeSinceLastInteraction();
      expect(timeSince).toBeCloseTo(60, 0); // Approximately 60 minutes
    });
  });

  describe('Loading States', () => {
    it('should set loading state during async operations', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockPetService.getUserPet.mockReturnValue(promise);

      const { result } = renderHook(() => usePet());

      act(() => {
        result.current.loadPetData();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(mockStudyPet);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when successful operation occurs', async () => {
      // First, cause an error
      mockPetService.getUserPet.mockRejectedValue(new Error('First error'));

      const { result } = renderHook(() => usePet());

      await act(async () => {
        await result.current.loadPetData();
      });

      expect(result.current.error).toBe('First error');

      // Then, perform successful operation
      mockPetService.getUserPet.mockResolvedValue(mockStudyPet);
      mockPetService.getPetSpecies.mockResolvedValue(mockPetSpecies);
      mockPetService.getPetAccessories.mockResolvedValue([]);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      await act(async () => {
        await result.current.loadPetData();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle operations when user is not authenticated', async () => {
      // Mock no user
      vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth = () => ({ user: null });

      const { result } = renderHook(() => usePet());

      await act(async () => {
        const loadResult = await result.current.loadPetData();
        expect(loadResult).toBeUndefined();
      });

      expect(mockPetService.getUserPet).not.toHaveBeenCalled();
    });
  });

  describe('Automatic Data Loading', () => {
    it('should automatically load data when user is available', async () => {
      mockPetService.getUserPet.mockResolvedValue(mockStudyPet);
      mockPetService.getPetSpecies.mockResolvedValue(mockPetSpecies);
      mockPetService.getPetAccessories.mockResolvedValue([]);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      renderHook(() => usePet());

      // Wait for automatic loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockPetService.getUserPet).toHaveBeenCalledWith('user-123');
      expect(mockPetService.getPetSpecies).toHaveBeenCalled();
    });
  });

  describe('Periodic Needs Checking', () => {
    it('should periodically check pet needs', async () => {
      vi.useFakeTimers();

      mockPetService.getUserPet.mockResolvedValue(mockStudyPet);
      mockPetService.getPetSpecies.mockResolvedValue(mockPetSpecies);
      mockPetService.getPetAccessories.mockResolvedValue([]);
      mockPetService.checkPetNeeds.mockResolvedValue({ needsAttention: false, reason: null });

      renderHook(() => usePet());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Clear the initial calls
      vi.clearAllMocks();

      // Fast forward time to trigger periodic check
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      });

      expect(mockPetService.checkPetNeeds).toHaveBeenCalledWith('user-123');

      vi.useRealTimers();
    });
  });
});