// import type { Database } from '../types/database';
import type {
  StudyPet,
  PetSpecies,
  PetEvolution,
  // PetEvolutionStage,
  // PetAccessory,
  EvolutionRequirement,
} from '../types';

/**
 * Maps a database pet object to the frontend StudyPet model
 */
export function mapDatabasePetToStudyPet(
  dbPet: Record<string, unknown>
): StudyPet {
  // Extract species data
  const speciesData = (dbPet.pet_species as Record<string, any>) || {};

  // Map evolution stages
  const evolutionStages = ((speciesData.evolution_stages as any[]) || []).map(
    (stage: any) => ({
      id: stage.name || '',
      name: stage.name || '',
      description: stage.description || '',
      imageUrl: stage.image_url || '',
      requiredLevel: stage.required_level || 1,
      stats: {
        happiness: stage.stats?.happiness || 50,
        health: stage.stats?.health || 50,
        intelligence: stage.stats?.intelligence || 50,
      },
      unlockedAbilities: stage.unlocked_abilities || [],
    })
  );

  // Find current evolution stage
  const currentStage =
    evolutionStages.find(stage => stage.name === dbPet.evolution_stage) ||
    evolutionStages[0];

  // Find next evolution stage
  const currentStageIndex = evolutionStages.findIndex(
    stage => stage.name === dbPet.evolution_stage
  );
  const nextStage =
    currentStageIndex < evolutionStages.length - 1
      ? evolutionStages[currentStageIndex + 1]
      : null;

  // Create evolution requirements
  const evolutionRequirements: EvolutionRequirement[] = [];

  if (
    nextStage &&
    speciesData.evolution_stages &&
    (speciesData.evolution_stages as any[])[currentStageIndex + 1]
  ) {
    const nextStageReqs =
      (speciesData.evolution_stages as any[])[currentStageIndex + 1]
        .requirements || {};

    if (nextStageReqs.level) {
      evolutionRequirements.push({
        type: 'level_reached',
        target: nextStageReqs.level,
        current: typeof dbPet.level === 'number' ? dbPet.level : 1,
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
  const accessories = ((dbPet.accessories as unknown[]) || []).map(
    (acc: any) => ({
      id: acc.id,
      name: acc.name,
      description: acc.description || '',
      imageUrl: acc.image_url || '',
      rarity: acc.rarity || 'common',
      unlockedAt: new Date(acc.unlocked_at),
    })
  );

  // Create the pet species
  const species: PetSpecies = {
    id: String(speciesData.id || ''),
    name: String(speciesData.name || ''),
    description: String(speciesData.description || ''),
    baseStats: {
      happiness: Number(speciesData.base_happiness) || 50,
      health: Number(speciesData.base_health) || 50,
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
    id: String(dbPet.user_id || ''),
    name: String(dbPet.name || ''),
    species,
    level: Number(dbPet.level) || 1,
    happiness: Number(dbPet.happiness) || 50,
    health: Number(dbPet.health) || 50,
    evolution,
    accessories,
    lastFed: new Date(String(dbPet.last_fed)),
    lastPlayed: new Date(String(dbPet.last_played)),
    createdAt: new Date(String(dbPet.created_at)),
  };
}
