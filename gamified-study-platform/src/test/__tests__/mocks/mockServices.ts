import { vi } from 'vitest';
import type {
  Environment,
  StudyPet,
  PetSpecies,
  MusicTrack,
  AudioSettings,
  StoreItem,
  UserEconomy,
  Theme,
} from '../../../types';

// Mock Environment Service
export const mockEnvironmentService = {
  loadEnvironments: vi.fn(),
  loadEnvironment: vi.fn(),
  switchEnvironment: vi.fn(),
  preloadEnvironments: vi.fn(),
  getCurrentEnvironment: vi.fn(),
  getAvailableEnvironments: vi.fn(),
  unlockEnvironment: vi.fn(),
  validateEnvironmentConfig: vi.fn(),
  isEnvironmentPreloaded: vi.fn(),
  clearPreloadedAssets: vi.fn(),
  dispose: vi.fn(),
};

// Mock Pet Service
export const mockPetService = {
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
};

// Mock Audio Service
export const mockAudioService = {
  playAmbientSound: vi.fn(),
  playMusic: vi.fn(),
  stopAmbientSound: vi.fn(),
  stopMusic: vi.fn(),
  setMasterVolume: vi.fn(),
  setAmbientVolume: vi.fn(),
  setMusicVolume: vi.fn(),
  crossfade: vi.fn(),
  getCurrentTrack: vi.fn(),
  getPlaylist: vi.fn(),
  setPlaylist: vi.fn(),
  addToPlaylist: vi.fn(),
  removeFromPlaylist: vi.fn(),
  playSoundEffect: vi.fn(),
  pauseMusic: vi.fn(),
  resumeMusic: vi.fn(),
  getCurrentPosition: vi.fn(),
  setPosition: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  isPlaying: vi.fn(),
  isAmbientPlaying: vi.fn(),
  dispose: vi.fn(),
};

// Mock Store Manager
export const mockStoreManager = {
  getInstance: vi.fn(),
  getStoreItems: vi.fn(),
  getItemsByCategory: vi.fn(),
  getItemById: vi.fn(),
  getCategories: vi.fn(),
  checkPurchaseEligibility: vi.fn(),
  processPurchase: vi.fn(),
  addStoreItem: vi.fn(),
  updateStoreItem: vi.fn(),
  removeStoreItem: vi.fn(),
  validateItem: vi.fn(),
  getAffordableItems: vi.fn(),
  getRecommendedItems: vi.fn(),
};

// Mock Theme Service
export const mockThemeService = {
  loadThemes: vi.fn(),
  applyTheme: vi.fn(),
  unlockTheme: vi.fn(),
  purchaseTheme: vi.fn(),
  previewTheme: vi.fn(),
  stopPreview: vi.fn(),
  customizeTheme: vi.fn(),
  resetCustomizations: vi.fn(),
  resetToDefaultTheme: vi.fn(),
  exportTheme: vi.fn(),
  importTheme: vi.fn(),
};

// Mock Mini Game Service
export const mockMiniGameService = {
  getAvailableGames: vi.fn(),
  startGame: vi.fn(),
  endGame: vi.fn(),
  getGameHistory: vi.fn(),
  getGameById: vi.fn(),
  calculateScore: vi.fn(),
  awardCoins: vi.fn(),
};

// Mock data generators
export const createMockEnvironment = (
  overrides: Partial<Environment> = {}
): Environment => ({
  id: 'test-env',
  name: 'Test Environment',
  category: 'free',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#F8FAFC',
    textColor: '#1F2937',
    accentColor: '#10B981',
    cssVariables: {
      '--env-primary': '#3B82F6',
      '--env-secondary': '#1E40AF',
      '--env-bg': '#F8FAFC',
      '--env-text': '#1F2937',
      '--env-accent': '#10B981',
    },
  },
  audio: {
    ambientTrack: 'test-ambient',
    musicTracks: [],
    soundEffects: {},
    defaultVolume: 0.5,
  },
  visuals: {
    backgroundImage: '/test-bg.jpg',
    overlayElements: [],
    particleEffects: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockStudyPet = (
  overrides: Partial<StudyPet> = {}
): StudyPet => ({
  id: 'test-pet',
  userId: 'test-user',
  name: 'Test Pet',
  species: {
    id: 'test-species',
    name: 'Test Species',
    description: 'A test pet species',
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
      id: 'baby',
      name: 'baby',
      description: 'Baby stage',
      imageUrl: '/pets/baby.png',
      unlockedAbilities: [],
      requirements: { level: 1 },
    },
    progress: 0,
    nextStageRequirements: [
      {
        id: 'level-5',
        type: 'level',
        target: 5,
        current: 0,
        completed: false,
        description: 'Reach level 5',
      },
    ],
  },
  accessories: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockPetSpecies = (
  overrides: Partial<PetSpecies> = {}
): PetSpecies => ({
  id: 'test-species',
  name: 'Test Species',
  description: 'A test pet species',
  baseStats: {
    happiness: 80,
    health: 90,
    intelligence: 50,
  },
  evolutionStages: [
    {
      id: 'baby',
      name: 'baby',
      description: 'Baby stage',
      imageUrl: '/pets/baby.png',
      unlockedAbilities: [],
      requirements: { level: 1 },
    },
    {
      id: 'adult',
      name: 'adult',
      description: 'Adult stage',
      imageUrl: '/pets/adult.png',
      unlockedAbilities: [],
      requirements: { level: 5 },
    },
  ],
  ...overrides,
});

export const createMockMusicTrack = (
  overrides: Partial<MusicTrack> = {}
): MusicTrack => ({
  id: 'test-track',
  title: 'Test Track',
  artist: 'Test Artist',
  duration: 180,
  url: '/test-track.mp3',
  genre: 'lofi',
  mood: 'focused',
  ...overrides,
});

export const createMockAudioSettings = (
  overrides: Partial<AudioSettings> = {}
): AudioSettings => ({
  masterVolume: 0.7,
  ambientVolume: 0.5,
  musicVolume: 0.6,
  soundEffectsVolume: 0.8,
  autoPlay: true,
  ...overrides,
});

export const createMockStoreItem = (
  overrides: Partial<StoreItem> = {}
): StoreItem => ({
  id: 'test-item',
  name: 'Test Item',
  description: 'A test store item',
  category: 'pet_food',
  price: 10,
  currency: 'coins',
  rarity: 'common',
  imageUrl: '/test-item.png',
  isLimited: false,
  tags: ['test', 'mock'],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockUserEconomy = (
  overrides: Partial<UserEconomy> = {}
): UserEconomy => ({
  coins: 1000,
  premiumCoins: 50,
  totalEarned: 2000,
  totalSpent: 1000,
  purchaseHistory: [],
  inventory: [],
  dailyCoinLimit: 100,
  dailyCoinsEarned: 25,
  ...overrides,
});

export const createMockTheme = (overrides: Partial<Theme> = {}): Theme => ({
  id: 'test-theme',
  name: 'Test Theme',
  description: 'A test theme',
  category: 'light',
  cssVariables: {
    '--theme-primary': '#3B82F6',
    '--theme-secondary': '#1E40AF',
    '--theme-background': '#FFFFFF',
    '--theme-text': '#1F2937',
  },
  previewImages: ['/test-theme-preview.jpg'],
  price: 100,
  currency: 'coins',
  rarity: 'common',
  isUnlocked: false,
  isPurchased: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Service factory for creating mock implementations
export const createMockServiceImplementations = () => {
  // Reset all mocks
  Object.values(mockEnvironmentService).forEach(mock => mock.mockReset());
  Object.values(mockPetService).forEach(mock => mock.mockReset());
  Object.values(mockAudioService).forEach(mock => mock.mockReset());
  Object.values(mockStoreManager).forEach(mock => mock.mockReset());
  Object.values(mockThemeService).forEach(mock => mock.mockReset());
  Object.values(mockMiniGameService).forEach(mock => mock.mockReset());

  // Set up default implementations
  mockEnvironmentService.loadEnvironments.mockResolvedValue([
    createMockEnvironment({ id: 'classroom', name: 'Classroom' }),
    createMockEnvironment({ id: 'office', name: 'Office' }),
  ]);

  mockEnvironmentService.getCurrentEnvironment.mockReturnValue(null);
  mockEnvironmentService.getAvailableEnvironments.mockReturnValue([]);
  mockEnvironmentService.validateEnvironmentConfig.mockReturnValue({
    isValid: true,
    errors: [],
  });
  mockEnvironmentService.isEnvironmentPreloaded.mockReturnValue(false);

  mockPetService.getUserPet.mockResolvedValue(null);
  mockPetService.getPetSpecies.mockResolvedValue([
    createMockPetSpecies({ id: 'cat', name: 'Cat' }),
    createMockPetSpecies({ id: 'dog', name: 'Dog' }),
  ]);
  mockPetService.checkPetNeeds.mockResolvedValue({
    needsAttention: false,
    reason: null,
  });

  mockAudioService.getCurrentTrack.mockReturnValue(null);
  mockAudioService.getPlaylist.mockReturnValue([]);
  mockAudioService.getSettings.mockReturnValue(createMockAudioSettings());
  mockAudioService.isPlaying.mockReturnValue(false);
  mockAudioService.isAmbientPlaying.mockReturnValue(false);
  mockAudioService.getCurrentPosition.mockReturnValue(0);

  mockStoreManager.getInstance.mockReturnValue(mockStoreManager);
  mockStoreManager.getStoreItems.mockReturnValue([
    createMockStoreItem({ id: 'food1', name: 'Basic Food' }),
    createMockStoreItem({
      id: 'accessory1',
      name: 'Red Collar',
      category: 'pet_accessories',
    }),
  ]);
  mockStoreManager.getCategories.mockReturnValue([
    'pet_food',
    'pet_accessories',
    'themes',
  ]);
  mockStoreManager.checkPurchaseEligibility.mockReturnValue({
    canPurchase: true,
  });
  mockStoreManager.validateItem.mockReturnValue(true);

  mockThemeService.loadThemes.mockResolvedValue([
    createMockTheme({ id: 'light', name: 'Light Theme', isUnlocked: true }),
    createMockTheme({ id: 'dark', name: 'Dark Theme', isUnlocked: true }),
  ]);

  mockMiniGameService.getAvailableGames.mockReturnValue([
    {
      id: 'memory-game',
      name: 'Memory Game',
      description: 'Test your memory',
      category: 'memory',
      difficulty: 'easy',
      estimatedDuration: 5,
      coinReward: 10,
    },
  ]);

  return {
    mockEnvironmentService,
    mockPetService,
    mockAudioService,
    mockStoreManager,
    mockThemeService,
    mockMiniGameService,
  };
};

// Helper for setting up component test environment
export const setupComponentTestEnvironment = () => {
  const mocks = createMockServiceImplementations();

  // Mock DOM methods commonly used in components
  global.document = {
    ...global.document,
    documentElement: {
      style: {
        setProperty: vi.fn(),
        getPropertyValue: vi.fn(),
      },
    },
    createElement: vi.fn(),
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
  } as any;

  global.window = {
    ...global.window,
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    sessionStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    location: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      reload: vi.fn(),
    },
    history: {
      pushState: vi.fn(),
      replaceState: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as any;

  return mocks;
};

// Helper for cleaning up after tests
export const cleanupComponentTestEnvironment = () => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

// Test utilities for common assertions
export const expectServiceCalled = (
  service: any,
  method: string,
  ...args: any[]
) => {
  expect(service[method]).toHaveBeenCalledWith(...args);
};

export const expectServiceNotCalled = (service: any, method: string) => {
  expect(service[method]).not.toHaveBeenCalled();
};

export const expectServiceCalledTimes = (
  service: any,
  method: string,
  times: number
) => {
  expect(service[method]).toHaveBeenCalledTimes(times);
};

// Mock implementations for specific test scenarios
export const mockSuccessfulPetAdoption = () => {
  const mockPet = createMockStudyPet({
    name: 'Fluffy',
    species: {
      id: 'cat',
      name: 'Cat',
      description: 'A friendly cat',
      baseStats: { happiness: 80, health: 90, intelligence: 60 },
      evolutionStages: [],
    },
  });
  mockPetService.adoptPet.mockResolvedValue(mockPet);
  return mockPet;
};

export const mockFailedPetAdoption = (error = 'Adoption failed') => {
  mockPetService.adoptPet.mockRejectedValue(new Error(error));
};

export const mockSuccessfulEnvironmentSwitch = () => {
  const mockEnv = createMockEnvironment({ id: 'forest', name: 'Forest' });
  mockEnvironmentService.switchEnvironment.mockResolvedValue(undefined);
  mockEnvironmentService.getCurrentEnvironment.mockReturnValue(mockEnv);
  return mockEnv;
};

export const mockFailedEnvironmentSwitch = (
  error = 'Environment not found'
) => {
  mockEnvironmentService.switchEnvironment.mockRejectedValue(new Error(error));
};

export const mockSuccessfulPurchase = () => {
  const mockItem = createMockStoreItem({ id: 'test-item', price: 50 });
  const mockResult = {
    success: true,
    item: mockItem,
    quantity: 1,
    totalCost: 50,
    newBalance: 950,
    inventoryItem: {
      id: 'inv-1',
      itemId: 'test-item',
      userId: 'test-user',
      quantity: 1,
      acquiredAt: new Date(),
      usedCount: 0,
    },
    transaction: {
      id: 'tx-1',
      userId: 'test-user',
      amount: -50,
      type: 'spent' as const,
      source: 'store_purchase' as const,
      description: 'Purchased test item',
      timestamp: new Date(),
    },
  };
  mockStoreManager.processPurchase.mockResolvedValue(mockResult);
  return mockResult;
};

export const mockFailedPurchase = (error = 'Insufficient funds') => {
  const mockItem = createMockStoreItem({ id: 'test-item', price: 50 });
  const mockResult = {
    success: false,
    item: mockItem,
    quantity: 1,
    totalCost: 50,
    newBalance: 1000,
    error,
    transaction: {
      id: 'tx-failed',
      userId: 'test-user',
      amount: 0,
      type: 'spent' as const,
      source: 'store_purchase' as const,
      description: `Failed purchase: ${error}`,
      timestamp: new Date(),
    },
  };
  mockStoreManager.processPurchase.mockResolvedValue(mockResult);
  return mockResult;
};

export const mockPlayingMusic = () => {
  const mockTrack = createMockMusicTrack({
    id: 'test-track',
    title: 'Test Song',
  });
  mockAudioService.getCurrentTrack.mockReturnValue(mockTrack);
  mockAudioService.isPlaying.mockReturnValue(true);
  mockAudioService.getCurrentPosition.mockReturnValue(60);
  return mockTrack;
};

export const mockStoppedMusic = () => {
  mockAudioService.getCurrentTrack.mockReturnValue(null);
  mockAudioService.isPlaying.mockReturnValue(false);
  mockAudioService.getCurrentPosition.mockReturnValue(0);
};
