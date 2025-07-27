# Design Document: Focus Environments and Pet System

## Overview

This design document outlines the architecture for implementing immersive focus environments, relaxation mini-games, and a comprehensive virtual pet system within the existing gamified study platform. The system will enhance user engagement through environmental theming, ambient audio, pet care mechanics, and an expanded economy system.

## Architecture

### High-Level Architecture

The new features will integrate with the existing React/TypeScript frontend and extend the current Zustand state management system. The architecture follows a modular approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Focus Environment UI  │  Pet Interface  │  Mini-Games UI   │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Environment Manager  │  Pet System  │  Audio Manager      │
├─────────────────────────────────────────────────────────────┤
│                    Data Management Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Environment Store  │  Pet Store  │  Theme Store           │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Local Storage  │  IndexedDB  │  External APIs             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Integration

- **Frontend**: React 19 with TypeScript
- **State Management**: Zustand (existing)
- **Styling**: Tailwind CSS (existing)
- **Audio**: Web Audio API + HTML5 Audio
- **Animations**: Framer Motion (existing)
- **Storage**: Local Storage + IndexedDB for offline support
- **Assets**: Static files served via Vite

## Components and Interfaces

### 1. Focus Environment System

#### Environment Manager

```typescript
interface EnvironmentManager {
  loadEnvironment(environmentId: string): Promise<Environment>;
  switchEnvironment(environmentId: string): void;
  preloadEnvironments(environmentIds: string[]): Promise<void>;
  getCurrentEnvironment(): Environment | null;
  getAvailableEnvironments(): Environment[];
}

interface Environment {
  id: string;
  name: string;
  category: "free" | "premium";
  theme: EnvironmentTheme;
  audio: EnvironmentAudio;
  visuals: EnvironmentVisuals;
  unlockRequirements?: UnlockRequirement[];
}

interface EnvironmentTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  cssVariables: Record<string, string>;
}

interface EnvironmentAudio {
  ambientTrack?: string;
  musicTracks: MusicTrack[];
  soundEffects: Record<string, string>;
  defaultVolume: number;
}

interface EnvironmentVisuals {
  backgroundImage: string;
  backgroundVideo?: string;
  overlayElements: VisualElement[];
  particleEffects?: ParticleConfig[];
}
```

#### Audio System

```typescript
interface AudioManager {
  playAmbientSound(trackId: string, volume?: number): void;
  playMusic(trackId: string, volume?: number): void;
  stopAmbientSound(): void;
  stopMusic(): void;
  setMasterVolume(volume: number): void;
  setAmbientVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  crossfade(fromTrack: string, toTrack: string, duration: number): void;
}

interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  url: string;
  genre: "lofi" | "ambient" | "classical" | "nature";
  mood: "calm" | "focused" | "energetic" | "relaxing";
}
```

### 2. Virtual Pet System

#### Pet Core System

```typescript
interface PetManager {
  adoptPet(speciesId: string, name: string): Promise<StudyPet>;
  feedPet(petId: string, foodId: string): Promise<void>;
  playWithPet(petId: string, activityId: string): Promise<void>;
  checkPetStatus(petId: string): PetStatus;
  evolvePet(petId: string): Promise<boolean>;
  equipAccessory(petId: string, accessoryId: string): Promise<void>;
}

interface PetStatus {
  health: number; // 0-100
  happiness: number; // 0-100
  hunger: number; // 0-100
  energy: number; // 0-100
  needsAttention: boolean;
  timeSinceLastFed: number; // minutes
  timeSinceLastPlayed: number; // minutes
  evolutionProgress: number; // 0-100
}

interface PetFood {
  id: string;
  name: string;
  description: string;
  cost: number;
  effects: PetEffect[];
  rarity: "common" | "rare" | "epic" | "legendary";
  imageUrl: string;
}

interface PetEffect {
  type: "health" | "happiness" | "energy" | "evolution_boost";
  value: number;
  duration?: number; // minutes, if temporary
}
```

#### Pet Evolution System

```typescript
interface EvolutionManager {
  checkEvolutionEligibility(petId: string): EvolutionEligibility;
  triggerEvolution(petId: string): Promise<EvolutionResult>;
  getEvolutionRequirements(petId: string): EvolutionRequirement[];
}

interface EvolutionEligibility {
  canEvolve: boolean;
  nextStage?: PetEvolutionStage;
  missingRequirements: EvolutionRequirement[];
  progress: number; // 0-100
}

interface EvolutionResult {
  success: boolean;
  newStage: PetEvolutionStage;
  unlockedAbilities: string[];
  celebrationAnimation: string;
}
```

### 3. Mini-Games System

#### Game Manager

```typescript
interface MiniGameManager {
  getAvailableGames(): MiniGame[];
  startGame(gameId: string): Promise<GameSession>;
  endGame(sessionId: string, score: number): Promise<GameResult>;
  getGameHistory(userId: string): GameSession[];
}

interface MiniGame {
  id: string;
  name: string;
  description: string;
  category: "puzzle" | "memory" | "reflex" | "creativity";
  difficulty: "easy" | "medium" | "hard";
  estimatedDuration: number; // minutes
  coinReward: number;
  unlockRequirements?: UnlockRequirement[];
}

interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  coinsEarned: number;
  completed: boolean;
}
```

### 4. Store and Economy System

#### Store Manager

```typescript
interface StoreManager {
  getStoreItems(category: StoreCategory): StoreItem[];
  purchaseItem(itemId: string, quantity: number): Promise<PurchaseResult>;
  getUserInventory(userId: string): InventoryItem[];
  checkPurchaseEligibility(
    itemId: string,
    quantity: number
  ): PurchaseEligibility;
}

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: StoreCategory;
  price: number;
  currency: "coins" | "premium_coins";
  stock?: number; // unlimited if undefined
  rarity: "common" | "rare" | "epic" | "legendary";
  effects?: ItemEffect[];
  imageUrl: string;
  unlockRequirements?: UnlockRequirement[];
}

type StoreCategory =
  | "pet_food"
  | "pet_accessories"
  | "themes"
  | "environments"
  | "music_packs";

interface PurchaseResult {
  success: boolean;
  item: StoreItem;
  newBalance: number;
  error?: string;
}
```

### 5. Theme System

#### Theme Manager

```typescript
interface ThemeManager {
  applyTheme(themeId: string): void;
  getAvailableThemes(): Theme[];
  unlockTheme(themeId: string): Promise<boolean>;
  previewTheme(themeId: string): void;
  resetToDefaultTheme(): void;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  category: "seasonal" | "nature" | "abstract" | "minimal";
  cssVariables: Record<string, string>;
  customComponents?: ThemeComponent[];
  unlockRequirements?: UnlockRequirement[];
  previewImages: string[];
}

interface ThemeComponent {
  component: string;
  styles: Record<string, string>;
  animations?: AnimationConfig[];
}
```

## Data Models

### Extended Type Definitions

```typescript
// Extend existing StudyPet interface
interface StudyPetExtended extends StudyPet {
  hunger: number;
  energy: number;
  mood: PetMood;
  activities: PetActivity[];
  inventory: PetInventoryItem[];
  evolutionHistory: EvolutionRecord[];
  preferences: PetPreferences;
}

interface PetMood {
  current: "happy" | "content" | "sad" | "excited" | "sleepy" | "hungry";
  factors: MoodFactor[];
  lastChanged: Date;
}

interface PetActivity {
  id: string;
  type: "feeding" | "playing" | "studying_together" | "sleeping";
  timestamp: Date;
  duration?: number;
  happiness_change: number;
  health_change: number;
}

// Environment-related types
interface UserEnvironmentSettings {
  currentEnvironment: string;
  unlockedEnvironments: string[];
  audioSettings: AudioSettings;
  visualSettings: VisualSettings;
  customizations: EnvironmentCustomization[];
}

interface AudioSettings {
  masterVolume: number;
  ambientVolume: number;
  musicVolume: number;
  soundEffectsVolume: number;
  currentPlaylist?: string;
  autoPlay: boolean;
}

// Game-related types
interface MiniGameProgress {
  gameId: string;
  bestScore: number;
  totalPlays: number;
  totalTimeSpent: number;
  achievements: string[];
  unlockedLevels: number[];
}

// Store and economy
interface UserEconomy {
  coins: number;
  premiumCoins: number;
  totalEarned: number;
  totalSpent: number;
  purchaseHistory: Purchase[];
  inventory: InventoryItem[];
}
```

## Error Handling

### Error Categories and Strategies

1. **Audio Loading Errors**

   - Fallback to silent mode
   - Retry mechanism with exponential backoff
   - User notification with option to reload

2. **Pet System Errors**

   - Graceful degradation (pet becomes "sleeping")
   - Data recovery from last known good state
   - Automatic health restoration on error recovery

3. **Theme Loading Errors**

   - Fallback to default theme
   - Partial theme loading (load what's available)
   - Cache invalidation and retry

4. **Store Transaction Errors**
   - Transaction rollback
   - Inventory consistency checks
   - Duplicate purchase prevention

### Error Recovery Mechanisms

```typescript
interface ErrorRecoveryManager {
  handleAudioError(error: AudioError): void;
  handlePetSystemError(error: PetError): void;
  handleThemeError(error: ThemeError): void;
  handleStoreError(error: StoreError): void;
  recoverFromCriticalError(): Promise<void>;
}
```

## Testing Strategy

### Unit Testing

- Component isolation testing
- State management testing
- Audio system mocking
- Pet behavior simulation

### Integration Testing

- Environment switching workflows
- Pet care complete cycles
- Store purchase flows
- Theme application processes

### Performance Testing

- Audio loading and playback performance
- Large asset loading optimization
- Memory usage monitoring
- Battery usage on mobile devices

### User Experience Testing

- Accessibility compliance (WCAG 2.1)
- Mobile responsiveness
- Cross-browser compatibility
- Offline functionality

## Free Hosting Considerations

### Vercel/Netlify Limitations

- **Asset Storage**: 100MB limit for static assets
- **Function Execution**: 10-second timeout for serverless functions
- **Bandwidth**: 100GB/month on free tier
- **Build Time**: 300 build minutes/month

### Optimization Strategies

1. **Asset Optimization**

   - Compress audio files (MP3 at 128kbps)
   - Use WebP images with fallbacks
   - Implement lazy loading for non-critical assets
   - CDN integration for large assets

2. **Caching Strategy**

   - Service Worker for offline support
   - IndexedDB for user data persistence
   - Local Storage for preferences
   - Cache-first strategy for static assets

3. **Progressive Loading**
   - Load core features first
   - Stream additional content as needed
   - Preload next likely-needed assets
   - Background downloading during idle time

### Recommended Free Services Integration

- **Audio Hosting**: GitHub LFS or external CDN
- **Image Optimization**: Cloudinary free tier
- **Analytics**: Google Analytics 4
- **Error Monitoring**: Sentry free tier
- **Database**: Supabase free tier (already integrated)

## API Requirements

### External APIs Needed

1. **Audio Content API**

   - Lo-fi music streaming
   - Ambient sound effects
   - Nature sounds library

2. **Asset Management API**

   - Image optimization service
   - CDN for large files
   - Progressive image loading

3. **Analytics API**
   - User behavior tracking
   - Performance monitoring
   - A/B testing capabilities

### Internal API Extensions

1. **Pet Management Endpoints**

   - `/api/pets/adopt`
   - `/api/pets/feed`
   - `/api/pets/play`
   - `/api/pets/evolve`

2. **Environment Endpoints**

   - `/api/environments/list`
   - `/api/environments/unlock`
   - `/api/environments/settings`

3. **Store Endpoints**

   - `/api/store/items`
   - `/api/store/purchase`
   - `/api/store/inventory`

4. **Mini-Game Endpoints**
   - `/api/games/start`
   - `/api/games/end`
   - `/api/games/leaderboard`

This design provides a comprehensive foundation for implementing the focus environments and pet system while maintaining compatibility with the existing platform architecture and working within free hosting constraints.
