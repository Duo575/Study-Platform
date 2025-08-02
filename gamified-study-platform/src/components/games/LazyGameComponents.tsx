import { lazy } from 'react';

// Lazy load mini-game components for better code splitting
export const BreathingExercise = lazy(() =>
  import('./BreathingExercise').then(module => ({
    default: module.BreathingExercise,
  }))
);

export const MemoryGame = lazy(() =>
  import('./MemoryGame').then(module => ({ default: module.MemoryGame }))
);

export const SimplePuzzle = lazy(() =>
  import('./SimplePuzzle').then(module => ({ default: module.SimplePuzzle }))
);

export const RelaxationGames = lazy(() =>
  import('./RelaxationGames').then(module => ({
    default: module.RelaxationGames,
  }))
);

export const MiniGameInterface = lazy(() =>
  import('./MiniGameInterface').then(module => ({
    default: module.MiniGameInterface,
  }))
);

// Lazy load environment components
export const EnvironmentSelector = lazy(() =>
  import('../environment/EnvironmentSelector').then(module => ({
    default: module.EnvironmentSelector,
  }))
);

export const MusicPlayer = lazy(() =>
  import('../environment/MusicPlayer').then(module => ({
    default: module.MusicPlayer,
  }))
);

export const AmbientSoundController = lazy(() =>
  import('../environment/AmbientSoundController').then(module => ({
    default: module.AmbientSoundController,
  }))
);

// Lazy load theme components
export const ThemeSelector = lazy(() =>
  import('../themes/ThemeSelector').then(module => ({
    default: module.ThemeSelector,
  }))
);

export const ThemeCustomizer = lazy(() =>
  import('../themes/ThemeCustomizer').then(module => ({
    default: module.ThemeCustomizer,
  }))
);

// Lazy load store components
export const StoreInterface = lazy(() =>
  import('../store/StoreInterface').then(module => ({
    default: module.StoreInterface,
  }))
);

export const InventoryManager = lazy(() =>
  import('../store/InventoryDisplay').then(module => ({
    default: module.InventoryDisplay,
  }))
);

// Lazy load pet evolution components
export const PetEvolutionCenter = lazy(() =>
  import('../pet/PetEvolutionCenter').then(module => ({
    default: module.PetEvolutionCenter,
  }))
);

export const PetHealthDashboard = lazy(() =>
  import('../pet/PetHealthDashboard').then(module => ({
    default: module.PetHealthDashboard,
  }))
);

// Lazy load advanced features
export const PerformanceAnalysis = lazy(() =>
  import('../PerformanceAnalysis/PerformanceDashboard').then(module => ({
    default: module.PerformanceDashboard,
  }))
);

export const DataExportInterface = lazy(() =>
  import('../features/DataExport').then(module => ({
    default: module.DataExport,
  }))
);

export const AdvancedSettings = lazy(() =>
  import('../settings/DataManagement').then(module => ({
    default: module.DataManagement,
  }))
);

// Lazy load admin components
export const AdminDashboard = lazy(() =>
  import('../admin/PerformanceDashboard').then(module => ({
    default: module.PerformanceDashboard,
  }))
);

export const UserManagement = lazy(() =>
  import('../profile/ProfileForm').then(module => ({
    default: module.ProfileForm,
  }))
);

// Lazy load social features
export const StudyGroups = lazy(() =>
  import('../features/StudyRooms').then(module => ({
    default: module.StudyRooms,
  }))
);

export const SocialFeed = lazy(() =>
  import('../features/GroupChat').then(module => ({
    default: module.GroupChat,
  }))
);

// Lazy load AI features
export const AIAssistant = lazy(() =>
  import('../features/AIAssistantSetup').then(module => ({
    default: module.AIAssistantSetup,
  }))
);

export const SmartRecommendations = lazy(() =>
  import('../features/AIAssistantSetup').then(module => ({
    default: module.AIAssistantSetup,
  }))
);
