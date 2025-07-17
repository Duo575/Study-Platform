import type { Database } from '../types/database';
import type { 
  StudyPet, 
  PetSpecies, 
  PetEvolution, 
  PetEvolutionStage,
  PetAccessory,
  EvolutionRequirement
} from '../types';

/**
 * Maps a database pet object to the frontend StudyPet model
 */
export function mapDatabasePetToStudyPet(
  dbPet: any
): StudyPet {
  // Extract species data
  const speciesData = dbPet.pet_species || {};
  
  // Map evolution stages
  const evolutionStages = (speciesData.evolution_stages as any[] || []).map(stage => ({
    id: stage.name,
    name: stage.name,
    description: stage.description || '',
    imageUrl: stage.image_url || '',
    unlockedAbilities: stage.unlocked_abilities || [],
  }));
  
  // Find current evolution stage
  const currentStage = evolutionStages.find(stage => stage.name === dbPet.evolution_stage) || evolutionStages[0];
  
  // Find next evolution stage
  const currentStageIndex = evolutionStages.findIndex(stage => stage.name === dbPet.evolution_stage);
  const nextStage = currentStageIndex < evolutionStages.length - 1 ? evolutionStages[currentStageIndex + 1] : null;
  
  // Create evolution requirements
  const evolutionRequirements: EvolutionRequirement[] = [];
  
  if (nextStage && speciesData.evolution_stages && speciesData.evolution_stages[currentStageIndex + 1]) {
    const nextStageReqs = speciesData.evolution_stages[currentStageIndex + 1].requirements || {};
    
    if (nextStageReqs.level) {
      evolutionRequirements.push({
        type: 'level_reached',
        target: nextStageReqs.level,
        current: dbPet.level,
        description: `Reach level ${nextStageReqs.level}`,
      });
    }
    
    if (nextStageReqs.study_hours) {
      evolutionRequirements.push({
        type: 'study_hours',
        target: nextStageReqs.study_hours,
        current: 0, // Would need to be calculated from study sessions
        description: `Study for ${nextStageReqs.study_hours} hours`,
      });
    }
  }
  
  // Map accessories
  const accessories = (dbPet.accessories as any[] || []).map(acc => ({
    id: acc.id,
    name: acc.name,
    description: acc.description || '',
    imageUrl: acc.image_url || '',
    rarity: acc.rarity || 'common',
    unlockedAt: new Date(acc.unlocked_at),
  }));
  
  // Create the pet species
  const species: PetSpecies = {
    id: speciesData.id || '',
    name: speciesData.name || '',
    description: speciesData.description || '',
    baseStats: {
      happiness: speciesData.base_happiness || 50,
      health: speciesData.base_health || 50,
      intelligence: 50, // Default value
    },
    evolutionStages,
  };
  
  // Create the pet evolution
  const evolution: PetEvolution = {
    stage: currentStage,
    progress: 0, // Would need to be calculated
    nextStageRequirements: evolutionRequirements,
  };
  
  // Create and return the study pet
  return {
    id: dbPet.user_id,
    name: dbPet.name,
    species,
    level: dbPet.level,
    happiness: dbPet.happiness,
    health: dbPet.health,
    evolution,
    accessories,
    lastFed: new Date(dbPet.last_fed),
    lastPlayed: new Date(dbPet.last_played),
    createdAt: new Date(dbPet.created_at),
  };
}