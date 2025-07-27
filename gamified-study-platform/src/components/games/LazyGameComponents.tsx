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
  import('../store/InventoryManager').then(module => ({
    default: module.InventoryManager,
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
  import('../PerformanceAnalysis/PerformanceAnalysis').then(module => ({
    default: module.PerformanceAnalysis,
  }))
);

export const DataExportInterface = lazy(() =>
  import('../export/DataExportInterface').then(module => ({
    default: module.DataExportInterface,
  }))
);

export const AdvancedSettings = lazy(() =>
  import('../settings/AdvancedSettings').then(module => ({
    default: module.AdvancedSettings,
  }))
);

// Lazy load admin components
export const AdminDashboard = lazy(() =>
  import('../admin/AdminDashboard').then(module => ({
    default: module.AdminDashboard,
  }))
);

export const UserManagement = lazy(() =>
  import('../admin/UserManagement').then(module => ({
    default: module.UserManagement,
  }))
);

// Lazy load social features
export const StudyGroups = lazy(() =>
  import('../social/StudyGroups').then(module => ({
    default: module.StudyGroups,
  }))
);

export const SocialFeed = lazy(() =>
  import('../social/SocialFeed').then(module => ({
    default: module.SocialFeed,
  }))
);

// Lazy load AI features
export const AIAssistant = lazy(() =>
  import('../ai/AIAssistant').then(module => ({ default: module.AIAssistant }))
);

export const SmartRecommendations = lazy(() =>
  import('../ai/SmartRecommendations').then(module => ({
    default: module.SmartRecommendations,
  }))
);
