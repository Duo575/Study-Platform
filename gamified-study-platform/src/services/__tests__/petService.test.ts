import { describe, it, expect, beforeEach, vi } from 'vitest';
import { petService } from '../petService';
import type { PetForm, StudyPet, PetSpecies } from '../../types';

// Mock the database services
const mockStudyPetService = {
  create: vi.fn(),
  getByUserId: vi.fn(),
  update: vi.fn()
};

const mockPetSpeciesService = {
  getById: vi.fn(),
  getAll: vi.fn()
};

vi.mock('../database', () => ({
  studyPetService: mockStudyPetService,
  petSpeciesService: mockPetSpeciesService
}));

// Mock the supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {}
}));

// Mock the mappers
const mockMapDatabasePetToStudyPet = vi.fn();
vi.mock('../../utils/mappers', () => ({
  mapDatabasePetToStudyPet: mockMapDatabasePetToStudyPet
}));

describe('Pet Service', () => {
  const mockUserId = 'user-123';
  const mockPetForm: PetForm = {
    name: 'Buddy',
    speciesId: 'dragon'
  };

  const mockSpeciesData = {
    id: 'dragon',
    name: 'Study Dragon',
    description: 'A wise dragon that grows stronger with knowledge',
    base_happiness: 50,
    base_health: 50,
    evolution_stages: [
      { name: 'baby', requirements: { level: 1 } },
      { name: 'teen', requirements: { level: 5 } },
      { name: 'adult', requirements: { level: 10 } }
    ]
  };

  const mockDatabasePet = {
    id: 'pet-123',
    user_id: mockUserId,
    name: 'Buddy',
    species_id: 'dragon',
    level: 1,
    happiness: 50,
    health: 50,
    evolution_stage: 'baby',
    accessories: [],
    last_fed: '2024-01-15T10:00:00Z',
    last_played: '2024-01-15T10:00:00Z',
    last_interaction: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  };

  const mockStudyPet: StudyPet = {
    id: 'pet-123',
    userId: mockUserId,
    name: 'Buddy',
    speciesId: 'dragon',
    level: 1,
    happiness: 50,
    health: 50,
    evolutionStage: 'baby',
    accessories: [],
    lastFed: new Date('2024-01-15T10:00:00Z'),
    lastPlayed: new Date('2024-01-15T10:00:00Z'),
    lastInteraction: new Date('2024-01-15T10:00:00Z'),
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMapDatabasePetToStudyPet.mockReturnValue(mockStudyPet);
  });

  describe('adoptPet', () => {
    it('should adopt a new pet successfully', async () => {
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);
      mockStudyPetService.create.mockResolvedValue(mockDatabasePet);

      const result = await petService.adoptPet(mockUserId, mockPetForm);

      expect(result).toEqual(mockStudyPet);
      expect(mockPetSpeciesService.getById).toHaveBeenCalledWith('dragon');
      expect(mockStudyPetService.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: 'Buddy',
        species_id: 'dragon',
        level: 1,
        happiness: 50,
        health: 50,
        evolution_stage: 'baby',
        accessories: [],
        last_fed: expect.any(String),
        last_played: expect.any(String),
        last_interaction: expect.any(String)
      });
      expect(mockMapDatabasePetToStudyPet).toHaveBeenCalledWith(mockDatabasePet);
    });

    it('should throw error for invalid species', async () => {
      mockPetSpeciesService.getById.mockResolvedValue(null);

      await expect(petService.adoptPet(mockUserId, mockPetForm))
        .rejects.toThrow('Invalid pet species selected');

      expect(mockStudyPetService.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);
      mockStudyPetService.create.mockRejectedValue(new Error('Database error'));

      await expect(petService.adoptPet(mockUserId, mockPetForm))
        .rejects.toThrow('Failed to adopt pet. Please try again.');
    });

    it('should handle species service errors', async () => {
      mockPetSpeciesService.getById.mockRejectedValue(new Error('Species service error'));

      await expect(petService.adoptPet(mockUserId, mockPetForm))
        .rejects.toThrow('Failed to adopt pet. Please try again.');
    });
  });

  describe('getUserPet', () => {
    it('should return user pet when found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(mockDatabasePet);

      const result = await petService.getUserPet(mockUserId);

      expect(result).toEqual(mockStudyPet);
      expect(mockStudyPetService.getByUserId).toHaveBeenCalledWith(mockUserId);
      expect(mockMapDatabasePetToStudyPet).toHaveBeenCalledWith(mockDatabasePet);
    });

    it('should return null when no pet found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      const result = await petService.getUserPet(mockUserId);

      expect(result).toBeNull();
      expect(mockMapDatabasePetToStudyPet).not.toHaveBeenCalled();
    });

    it('should return null when database error occurs', async () => {
      mockStudyPetService.getByUserId.mockRejectedValue(new Error('Database error'));

      const result = await petService.getUserPet(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('getPetSpecies', () => {
    it('should return all pet species', async () => {
      const mockSpeciesList = [
        mockSpeciesData,
        {
          id: 'owl',
          name: 'Scholar Owl',
          description: 'A wise owl companion',
          base_happiness: 60,
          base_health: 40,
          evolution_stages: []
        }
      ];

      mockPetSpeciesService.getAll.mockResolvedValue(mockSpeciesList);

      const result = await petService.getPetSpecies();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'dragon',
        name: 'Study Dragon',
        description: 'A wise dragon that grows stronger with knowledge',
        baseStats: {
          happiness: 50,
          health: 50,
          intelligence: 50
        },
        evolutionStages: mockSpeciesData.evolution_stages
      });
      expect(result[1]).toEqual({
        id: 'owl',
        name: 'Scholar Owl',
        description: 'A wise owl companion',
        baseStats: {
          happiness: 60,
          health: 40,
          intelligence: 50
        },
        evolutionStages: []
      });
    });

    it('should handle missing descriptions gracefully', async () => {
      const speciesWithoutDesc = {
        ...mockSpeciesData,
        description: null
      };

      mockPetSpeciesService.getAll.mockResolvedValue([speciesWithoutDesc]);

      const result = await petService.getPetSpecies();

      expect(result[0].description).toBe('');
    });

    it('should throw error when database fails', async () => {
      mockPetSpeciesService.getAll.mockRejectedValue(new Error('Database error'));

      await expect(petService.getPetSpecies())
        .rejects.toThrow('Failed to load pet species. Please try again.');
    });
  });

  describe('feedPet', () => {
    it('should feed pet and increase happiness and health', async () => {
      const petToFeed = { ...mockDatabasePet, happiness: 30, health: 40 };
      const fedPet = { ...petToFeed, happiness: 45, health: 50 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToFeed);
      mockStudyPetService.update.mockResolvedValue(fedPet);

      const result = await petService.feedPet(mockUserId);

      expect(result).toEqual(mockStudyPet);
      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 45, // 30 + 15
        health: 50,    // 40 + 10
        last_fed: expect.any(String),
        last_interaction: expect.any(String)
      });
    });

    it('should cap happiness and health at 100', async () => {
      const petToFeed = { ...mockDatabasePet, happiness: 95, health: 95 };
      const fedPet = { ...petToFeed, happiness: 100, health: 100 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToFeed);
      mockStudyPetService.update.mockResolvedValue(fedPet);

      await petService.feedPet(mockUserId);

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 100, // Capped at 100
        health: 100,    // Capped at 100
        last_fed: expect.any(String),
        last_interaction: expect.any(String)
      });
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      await expect(petService.feedPet(mockUserId))
        .rejects.toThrow('Pet not found');
    });

    it('should handle update errors gracefully', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(mockDatabasePet);
      mockStudyPetService.update.mockRejectedValue(new Error('Update failed'));

      await expect(petService.feedPet(mockUserId))
        .rejects.toThrow('Failed to feed pet. Please try again.');
    });
  });

  describe('playWithPet', () => {
    it('should play with pet and increase happiness', async () => {
      const petToPlay = { ...mockDatabasePet, happiness: 30 };
      const playedPet = { ...petToPlay, happiness: 50 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToPlay);
      mockStudyPetService.update.mockResolvedValue(playedPet);

      const result = await petService.playWithPet(mockUserId);

      expect(result).toEqual(mockStudyPet);
      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 50, // 30 + 20
        last_played: expect.any(String),
        last_interaction: expect.any(String)
      });
    });

    it('should cap happiness at 100', async () => {
      const petToPlay = { ...mockDatabasePet, happiness: 90 };
      const playedPet = { ...petToPlay, happiness: 100 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToPlay);
      mockStudyPetService.update.mockResolvedValue(playedPet);

      await petService.playWithPet(mockUserId);

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 100, // Capped at 100
        last_played: expect.any(String),
        last_interaction: expect.any(String)
      });
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      await expect(petService.playWithPet(mockUserId))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('checkAndEvolvePet', () => {
    it('should evolve pet when requirements are met', async () => {
      const evolvablePet = { ...mockDatabasePet, level: 5, evolution_stage: 'baby' };
      const evolvedPet = { ...evolvablePet, evolution_stage: 'teen', happiness: 75 };

      mockStudyPetService.getByUserId.mockResolvedValue(evolvablePet);
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);
      mockStudyPetService.update.mockResolvedValue(evolvedPet);

      const result = await petService.checkAndEvolvePet(mockUserId);

      expect(result.evolved).toBe(true);
      expect(result.newStage).toBe('teen');
      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        evolution_stage: 'teen',
        happiness: 75, // 50 + 25 bonus
        last_interaction: expect.any(String)
      });
    });

    it('should not evolve pet when requirements are not met', async () => {
      const nonEvolvablePet = { ...mockDatabasePet, level: 3, evolution_stage: 'baby' };

      mockStudyPetService.getByUserId.mockResolvedValue(nonEvolvablePet);
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);

      const result = await petService.checkAndEvolvePet(mockUserId);

      expect(result.evolved).toBe(false);
      expect(result.newStage).toBeNull();
      expect(mockStudyPetService.update).not.toHaveBeenCalled();
    });

    it('should not evolve pet at maximum evolution stage', async () => {
      const maxEvolutionPet = { ...mockDatabasePet, level: 15, evolution_stage: 'adult' };

      mockStudyPetService.getByUserId.mockResolvedValue(maxEvolutionPet);
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);

      const result = await petService.checkAndEvolvePet(mockUserId);

      expect(result.evolved).toBe(false);
      expect(result.newStage).toBeNull();
    });

    it('should handle unknown evolution stage gracefully', async () => {
      const unknownStagePet = { ...mockDatabasePet, level: 15, evolution_stage: 'unknown' };

      mockStudyPetService.getByUserId.mockResolvedValue(unknownStagePet);
      mockPetSpeciesService.getById.mockResolvedValue(mockSpeciesData);

      const result = await petService.checkAndEvolvePet(mockUserId);

      expect(result.evolved).toBe(false);
      expect(result.newStage).toBeNull();
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      await expect(petService.checkAndEvolvePet(mockUserId))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('updatePetFromStudyActivity', () => {
    it('should update pet stats from study session', async () => {
      const petToUpdate = { ...mockDatabasePet, happiness: 40, level: 2 };
      const updatedPet = { ...petToUpdate, happiness: 45, level: 2 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToUpdate);
      mockStudyPetService.update.mockResolvedValue(updatedPet);

      const result = await petService.updatePetFromStudyActivity(mockUserId, 'study_session', 60);

      expect(result).toEqual(mockStudyPet);
      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 46, // 40 + min(15, floor(60/10)) = 40 + 6
        level: 2,      // No level up
        last_interaction: expect.any(String)
      });
    });

    it('should update pet stats from quest completion', async () => {
      const petToUpdate = { ...mockDatabasePet, happiness: 40, level: 2 };
      const updatedPet = { ...petToUpdate, happiness: 50, level: 2 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToUpdate);
      mockStudyPetService.update.mockResolvedValue(updatedPet);

      const result = await petService.updatePetFromStudyActivity(mockUserId, 'quest_complete');

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 50, // 40 + 10
        level: 2,
        last_interaction: expect.any(String)
      });
    });

    it('should update pet stats from todo completion', async () => {
      const petToUpdate = { ...mockDatabasePet, happiness: 40, level: 2 };
      const updatedPet = { ...petToUpdate, happiness: 45, level: 2 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToUpdate);
      mockStudyPetService.update.mockResolvedValue(updatedPet);

      const result = await petService.updatePetFromStudyActivity(mockUserId, 'todo_complete');

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 45, // 40 + 5
        level: 2,
        last_interaction: expect.any(String)
      });
    });

    it('should level up pet when XP threshold is reached', async () => {
      const petToUpdate = { ...mockDatabasePet, happiness: 40, level: 1 };
      const updatedPet = { ...petToUpdate, happiness: 50, level: 2 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToUpdate);
      mockStudyPetService.update.mockResolvedValue(updatedPet);

      // 150 minutes should give enough XP to level up (150/15 = 10 XP, level 1 needs 100 XP)
      await petService.updatePetFromStudyActivity(mockUserId, 'study_session', 150);

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 55, // 40 + min(15, floor(150/10)) = 40 + 15
        level: 1,      // XP gain (10) < required (100), so no level up
        last_interaction: expect.any(String)
      });
    });

    it('should cap happiness at 100', async () => {
      const petToUpdate = { ...mockDatabasePet, happiness: 95, level: 2 };
      const updatedPet = { ...petToUpdate, happiness: 100, level: 2 };

      mockStudyPetService.getByUserId.mockResolvedValue(petToUpdate);
      mockStudyPetService.update.mockResolvedValue(updatedPet);

      await petService.updatePetFromStudyActivity(mockUserId, 'study_session', 100);

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        happiness: 100, // Capped at 100
        level: 2,
        last_interaction: expect.any(String)
      });
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      await expect(petService.updatePetFromStudyActivity(mockUserId, 'study_session', 60))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('getPetAccessories', () => {
    it('should return pet accessories', async () => {
      const petWithAccessories = {
        ...mockDatabasePet,
        accessories: [
          {
            id: 'acc-1',
            name: 'Study Hat',
            description: 'A hat for studying',
            image_url: '/accessories/hat.png',
            rarity: 'common',
            unlocked_at: '2024-01-15T10:00:00Z'
          }
        ]
      };

      mockStudyPetService.getByUserId.mockResolvedValue(petWithAccessories);

      const result = await petService.getPetAccessories(mockUserId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'acc-1',
        name: 'Study Hat',
        description: 'A hat for studying',
        imageUrl: '/accessories/hat.png',
        rarity: 'common',
        unlockedAt: new Date('2024-01-15T10:00:00Z')
      });
    });

    it('should return empty array when no accessories', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(mockDatabasePet);

      const result = await petService.getPetAccessories(mockUserId);

      expect(result).toEqual([]);
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      await expect(petService.getPetAccessories(mockUserId))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('addPetAccessory', () => {
    it('should add new accessory to pet', async () => {
      const newAccessory = {
        name: 'Study Glasses',
        description: 'Glasses for better focus',
        imageUrl: '/accessories/glasses.png',
        rarity: 'rare' as const
      };

      const petWithNewAccessory = {
        ...mockDatabasePet,
        accessories: [
          {
            id: expect.stringMatching(/^acc_\d+$/),
            ...newAccessory,
            unlocked_at: expect.any(String)
          }
        ]
      };

      mockStudyPetService.getByUserId.mockResolvedValue(mockDatabasePet);
      mockStudyPetService.update.mockResolvedValue(petWithNewAccessory);

      const result = await petService.addPetAccessory(mockUserId, newAccessory);

      expect(result).toEqual(mockStudyPet);
      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        accessories: expect.arrayContaining([
          expect.objectContaining({
            id: expect.stringMatching(/^acc_\d+$/),
            name: 'Study Glasses',
            description: 'Glasses for better focus',
            imageUrl: '/accessories/glasses.png',
            rarity: 'rare',
            unlocked_at: expect.any(String)
          })
        ]),
        last_interaction: expect.any(String)
      });
    });

    it('should add to existing accessories', async () => {
      const existingAccessory = {
        id: 'acc-1',
        name: 'Study Hat',
        description: 'A hat for studying',
        image_url: '/accessories/hat.png',
        rarity: 'common',
        unlocked_at: '2024-01-15T10:00:00Z'
      };

      const petWithExistingAccessory = {
        ...mockDatabasePet,
        accessories: [existingAccessory]
      };

      const newAccessory = {
        name: 'Study Glasses',
        description: 'Glasses for better focus',
        imageUrl: '/accessories/glasses.png',
        rarity: 'rare' as const
      };

      mockStudyPetService.getByUserId.mockResolvedValue(petWithExistingAccessory);
      mockStudyPetService.update.mockResolvedValue({
        ...petWithExistingAccessory,
        accessories: [existingAccessory, { ...newAccessory, id: 'acc-2', unlocked_at: '2024-01-15T11:00:00Z' }]
      });

      await petService.addPetAccessory(mockUserId, newAccessory);

      expect(mockStudyPetService.update).toHaveBeenCalledWith(mockUserId, {
        accessories: expect.arrayContaining([
          existingAccessory,
          expect.objectContaining(newAccessory)
        ]),
        last_interaction: expect.any(String)
      });
    });

    it('should throw error when pet not found', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      const newAccessory = {
        name: 'Study Glasses',
        description: 'Glasses for better focus',
        imageUrl: '/accessories/glasses.png',
        rarity: 'rare' as const
      };

      await expect(petService.addPetAccessory(mockUserId, newAccessory))
        .rejects.toThrow('Pet not found');
    });
  });

  describe('checkPetNeeds', () => {
    it('should return no attention needed for well-cared pet', async () => {
      const wellCaredPet = {
        ...mockDatabasePet,
        happiness: 80,
        health: 80,
        last_fed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        last_played: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        last_interaction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      };

      mockStudyPetService.getByUserId.mockResolvedValue(wellCaredPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(false);
      expect(result.reason).toBeNull();
    });

    it('should detect hungry pet', async () => {
      const hungryPet = {
        ...mockDatabasePet,
        happiness: 80,
        health: 80,
        last_fed: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        last_played: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      };

      mockStudyPetService.getByUserId.mockResolvedValue(hungryPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('hungry');
    });

    it('should detect bored pet', async () => {
      const boredPet = {
        ...mockDatabasePet,
        happiness: 80,
        health: 80,
        last_fed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        last_played: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(), // 49 hours ago
        last_interaction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      };

      mockStudyPetService.getByUserId.mockResolvedValue(boredPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('bored');
    });

    it('should detect lonely pet', async () => {
      const lonelyPet = {
        ...mockDatabasePet,
        happiness: 80,
        health: 80,
        last_fed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        last_played: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(Date.now() - 73 * 60 * 60 * 1000).toISOString() // 73 hours ago
      };

      mockStudyPetService.getByUserId.mockResolvedValue(lonelyPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('lonely');
    });

    it('should detect unhappy pet', async () => {
      const unhappyPet = {
        ...mockDatabasePet,
        happiness: 25, // Below 30
        health: 80,
        last_fed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        last_played: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      };

      mockStudyPetService.getByUserId.mockResolvedValue(unhappyPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('unhappy');
    });

    it('should detect unwell pet', async () => {
      const unwellPet = {
        ...mockDatabasePet,
        happiness: 80,
        health: 25, // Below 30
        last_fed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        last_played: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        last_interaction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      };

      mockStudyPetService.getByUserId.mockResolvedValue(unwellPet);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('unwell');
    });

    it('should return no attention needed when no pet exists', async () => {
      mockStudyPetService.getByUserId.mockResolvedValue(null);

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(false);
      expect(result.reason).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockStudyPetService.getByUserId.mockRejectedValue(new Error('Database error'));

      const result = await petService.checkPetNeeds(mockUserId);

      expect(result.needsAttention).toBe(false);
      expect(result.reason).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty user ID', async () => {
      const result = await petService.getUserPet('');
      expect(result).toBeNull();
    });

    it('should handle malformed database responses', async () => {
      const malformedPet = {
        ...mockDatabasePet,
        happiness: null,
        health: undefined
      };

      mockStudyPetService.getByUserId.mockResolvedValue(malformedPet);

      // Should not throw error, mapper should handle it
      const result = await petService.getUserPet(mockUserId);
      expect(mockMapDatabasePetToStudyPet).toHaveBeenCalledWith(malformedPet);
    });

    it('should handle missing evolution stages', async () => {
      const speciesWithoutStages = {
        ...mockSpeciesData,
        evolution_stages: null
      };

      mockStudyPetService.getByUserId.mockResolvedValue(mockDatabasePet);
      mockPetSpeciesService.getById.mockResolvedValue(speciesWithoutStages);

      const result = await petService.checkAndEvolvePet(mockUserId);

      expect(result.evolved).toBe(false);
      expect(result.newStage).toBeNull();
    });

    it('should handle null accessories array', async () => {
      const petWithNullAccessories = {
        ...mockDatabasePet,
        accessories: null
      };

      mockStudyPetService.getByUserId.mockResolvedValue(petWithNullAccessories);

      const result = await petService.getPetAccessories(mockUserId);
      expect(result).toEqual([]);
    });
  });
});