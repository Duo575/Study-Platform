import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Theme,
  ThemeState,
  ThemeHistoryEntry,
  ThemeCustomization,
  UnlockRequirement,
} from '../types';

interface ThemeStoreState extends ThemeState {
  // Additional UI states
  isLoadingThemes: boolean;
  isPurchasingTheme: boolean;
  isUnlockingTheme: boolean;

  // Theme preview states
  originalTheme: Theme | null;
  previewTimeout: NodeJS.Timeout | null;

  // Customization states
  customizations: Record<string, ThemeCustomization>;
  isCustomizing: boolean;
}

interface ThemeActions {
  // Theme management
  loadThemes: () => Promise<void>;
  applyTheme: (themeId: string) => Promise<void>;
  unlockTheme: (themeId: string) => Promise<boolean>;
  purchaseTheme: (themeId: string) => Promise<boolean>;

  // Theme preview
  previewTheme: (themeId: string, duration?: number) => void;
  stopPreview: () => void;

  // Theme customization
  customizeTheme: (
    themeId: string,
    customizations: Record<string, string>
  ) => void;
  resetCustomizations: (themeId: string) => void;

  // Theme utilities
  resetToDefaultTheme: () => void;
  exportTheme: (themeId: string) => string | null;
  importTheme: (themeData: string) => Promise<Theme | null>;

  // State management
  setCurrentTheme: (theme: Theme | null) => void;
  addUnlockedTheme: (themeId: string) => void;
  addPurchasedTheme: (themeId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setApplyingTheme: (applying: boolean) => void;
  setPreviewingTheme: (previewing: boolean) => void;
  setPurchasingTheme: (purchasing: boolean) => void;
  setUnlockingTheme: (unlocking: boolean) => void;

  // Reset
  reset: () => void;
}

const defaultThemes: Theme[] = [
  {
    id: 'default-light',
    name: 'Classic Light',
    description: 'Clean and bright theme perfect for daytime studying',
    category: 'light',
    cssVariables: {
      '--theme-primary': '#3B82F6',
      '--theme-secondary': '#1E40AF',
      '--theme-background': '#FFFFFF',
      '--theme-surface': '#F8FAFC',
      '--theme-text': '#1F2937',
      '--theme-text-secondary': '#6B7280',
      '--theme-accent': '#10B981',
      '--theme-border': '#E5E7EB',
      '--theme-shadow': 'rgba(0, 0, 0, 0.1)',
    },
    previewImages: ['/themes/default-light-preview.jpg'],
    price: 0,
    currency: 'coins',
    rarity: 'common',
    isUnlocked: true,
    isPurchased: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'default-dark',
    name: 'Classic Dark',
    description: 'Easy on the eyes theme for evening study sessions',
    category: 'dark',
    cssVariables: {
      '--theme-primary': '#60A5FA',
      '--theme-secondary': '#3B82F6',
      '--theme-background': '#111827',
      '--theme-surface': '#1F2937',
      '--theme-text': '#F9FAFB',
      '--theme-text-secondary': '#D1D5DB',
      '--theme-accent': '#34D399',
      '--theme-border': '#374151',
      '--theme-shadow': 'rgba(0, 0, 0, 0.3)',
    },
    previewImages: ['/themes/default-dark-preview.jpg'],
    price: 0,
    currency: 'coins',
    rarity: 'common',
    isUnlocked: true,
    isPurchased: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'forest-green',
    name: 'Forest Serenity',
    description: 'Nature-inspired green theme for peaceful studying',
    category: 'nature',
    cssVariables: {
      '--theme-primary': '#059669',
      '--theme-secondary': '#047857',
      '--theme-background': '#ECFDF5',
      '--theme-surface': '#D1FAE5',
      '--theme-text': '#064E3B',
      '--theme-text-secondary': '#065F46',
      '--theme-accent': '#F59E0B',
      '--theme-border': '#A7F3D0',
      '--theme-shadow': 'rgba(5, 150, 105, 0.1)',
    },
    previewImages: ['/themes/forest-green-preview.jpg'],
    price: 250,
    currency: 'coins',
    rarity: 'common',
    isUnlocked: false,
    isPurchased: false,
    unlockRequirements: [
      {
        type: 'coins',
        target: 250,
        current: 0,
        description: 'Purchase for 250 coins',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Depths',
    description: 'Calming blue theme inspired by deep ocean waters',
    category: 'nature',
    cssVariables: {
      '--theme-primary': '#0EA5E9',
      '--theme-secondary': '#0284C7',
      '--theme-background': '#F0F9FF',
      '--theme-surface': '#E0F2FE',
      '--theme-text': '#0C4A6E',
      '--theme-text-secondary': '#075985',
      '--theme-accent': '#F97316',
      '--theme-border': '#BAE6FD',
      '--theme-shadow': 'rgba(14, 165, 233, 0.1)',
    },
    previewImages: ['/themes/ocean-blue-preview.jpg'],
    price: 300,
    currency: 'coins',
    rarity: 'rare',
    isUnlocked: false,
    isPurchased: false,
    unlockRequirements: [
      {
        type: 'study_hours',
        target: 25,
        current: 0,
        description: 'Study for 25 hours to unlock',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm gradient theme with sunset colors',
    category: 'abstract',
    cssVariables: {
      '--theme-primary': '#F59E0B',
      '--theme-secondary': '#D97706',
      '--theme-background': 'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)',
      '--theme-surface': '#FEF3C7',
      '--theme-text': '#92400E',
      '--theme-text-secondary': '#B45309',
      '--theme-accent': '#DC2626',
      '--theme-border': '#FDE68A',
      '--theme-shadow': 'rgba(245, 158, 11, 0.2)',
    },
    previewImages: ['/themes/sunset-gradient-preview.jpg'],
    price: 500,
    currency: 'coins',
    rarity: 'epic',
    isUnlocked: false,
    isPurchased: false,
    unlockRequirements: [
      {
        type: 'streak_days',
        target: 7,
        current: 0,
        description: 'Maintain a 7-day study streak',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    description: 'Delicate pink theme inspired by Japanese cherry blossoms',
    category: 'seasonal',
    cssVariables: {
      '--theme-primary': '#EC4899',
      '--theme-secondary': '#DB2777',
      '--theme-background': '#FDF2F8',
      '--theme-surface': '#FCE7F3',
      '--theme-text': '#831843',
      '--theme-text-secondary': '#9D174D',
      '--theme-accent': '#10B981',
      '--theme-border': '#F9A8D4',
      '--theme-shadow': 'rgba(236, 72, 153, 0.1)',
    },
    previewImages: ['/themes/cherry-blossom-preview.jpg'],
    price: 750,
    currency: 'coins',
    rarity: 'legendary',
    isUnlocked: false,
    isPurchased: false,
    unlockRequirements: [
      {
        type: 'level_reached',
        target: 10,
        current: 0,
        description: 'Reach level 10',
      },
      {
        type: 'quests_completed',
        target: 50,
        current: 0,
        description: 'Complete 50 quests',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const initialState: ThemeStoreState = {
  themes: defaultThemes,
  currentTheme: defaultThemes[0], // Default to light theme
  unlockedThemes: ['default-light', 'default-dark'],
  purchasedThemes: ['default-light', 'default-dark'],
  isLoading: false,
  error: null,
  isApplyingTheme: false,
  isPreviewingTheme: false,
  previewTheme: null,
  themeHistory: [],

  // Additional states
  isLoadingThemes: false,
  isPurchasingTheme: false,
  isUnlockingTheme: false,
  originalTheme: null,
  previewTimeout: null,
  customizations: {},
  isCustomizing: false,
};

export const useThemeStore = create<ThemeStoreState & ThemeActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        loadThemes: async () => {
          try {
            set({ isLoadingThemes: true, error: null });

            // In a real app, this would fetch from an API
            // For now, we'll use the default themes
            await new Promise(resolve => setTimeout(resolve, 500));

            set({
              themes: defaultThemes,
              isLoadingThemes: false,
            });
          } catch (error) {
            console.error('Error loading themes:', error);
            set({
              error: 'Failed to load themes',
              isLoadingThemes: false,
            });
          }
        },

        applyTheme: async (themeId: string) => {
          try {
            set({ isApplyingTheme: true, error: null });

            const { themes, unlockedThemes } = get();
            const theme = themes.find(t => t.id === themeId);

            if (!theme) {
              throw new Error('Theme not found');
            }

            if (!unlockedThemes.includes(themeId)) {
              throw new Error('Theme not unlocked');
            }

            // Apply theme CSS variables to the document root
            const root = document.documentElement;
            Object.entries(theme.cssVariables).forEach(([key, value]) => {
              root.style.setProperty(key, value);
            });

            // Add theme history entry
            const historyEntry: ThemeHistoryEntry = {
              themeId,
              appliedAt: new Date(),
              duration: 0, // Will be calculated when theme changes
            };

            // Update duration of previous theme if exists
            const { themeHistory, currentTheme } = get();
            const updatedHistory = [...themeHistory];
            if (currentTheme && updatedHistory.length > 0) {
              const lastEntry = updatedHistory[updatedHistory.length - 1];
              if (lastEntry.themeId === currentTheme.id) {
                lastEntry.duration = Math.floor(
                  (new Date().getTime() - lastEntry.appliedAt.getTime()) / 60000
                );
              }
            }

            set({
              currentTheme: theme,
              themeHistory: [...updatedHistory, historyEntry],
              isApplyingTheme: false,
            });

            console.log('Applied theme:', theme.name);
          } catch (error) {
            console.error('Error applying theme:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to apply theme',
              isApplyingTheme: false,
            });
          }
        },

        unlockTheme: async (themeId: string) => {
          try {
            set({ isUnlockingTheme: true, error: null });

            const { themes, unlockedThemes } = get();
            const theme = themes.find(t => t.id === themeId);

            if (!theme) {
              throw new Error('Theme not found');
            }

            if (unlockedThemes.includes(themeId)) {
              // Already unlocked, just return success
              set({ isUnlockingTheme: false });
              return true;
            }

            // Add to unlocked themes
            set({
              unlockedThemes: [...unlockedThemes, themeId],
              isUnlockingTheme: false,
            });

            console.log('Theme unlocked:', theme.name);
            return true;
          } catch (error) {
            console.error('Error unlocking theme:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to unlock theme',
              isUnlockingTheme: false,
            });
            throw error; // Re-throw for unlock manager to handle
          }
        },

        purchaseTheme: async (themeId: string) => {
          try {
            set({ isPurchasingTheme: true, error: null });

            const { themes, purchasedThemes, unlockedThemes } = get();
            const theme = themes.find(t => t.id === themeId);

            if (!theme) {
              throw new Error('Theme not found');
            }

            if (purchasedThemes.includes(themeId)) {
              throw new Error('Theme already purchased');
            }

            // Check if user has enough coins (this would integrate with the store system)
            // For now, we'll simulate the purchase
            await new Promise(resolve => setTimeout(resolve, 1000));

            set({
              purchasedThemes: [...purchasedThemes, themeId],
              unlockedThemes: unlockedThemes.includes(themeId)
                ? unlockedThemes
                : [...unlockedThemes, themeId],
              isPurchasingTheme: false,
            });

            console.log('Purchased theme:', theme.name);
            return true;
          } catch (error) {
            console.error('Error purchasing theme:', error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to purchase theme',
              isPurchasingTheme: false,
            });
            return false;
          }
        },

        previewTheme: (themeId: string, duration = 10000) => {
          const { themes, currentTheme, previewTimeout } = get();
          const theme = themes.find(t => t.id === themeId);

          if (!theme || theme.id === currentTheme?.id) {
            return;
          }

          // Clear existing preview timeout
          if (previewTimeout) {
            clearTimeout(previewTimeout);
          }

          // Store original theme for restoration
          set({
            originalTheme: currentTheme,
            previewTheme: theme,
            isPreviewingTheme: true,
          });

          // Apply preview theme
          const root = document.documentElement;
          Object.entries(theme.cssVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
          });

          // Set timeout to restore original theme
          const timeout = setTimeout(() => {
            get().stopPreview();
          }, duration);

          set({ previewTimeout: timeout });

          console.log('Previewing theme:', theme.name, 'for', duration, 'ms');
        },

        stopPreview: () => {
          const { originalTheme, previewTimeout } = get();

          if (previewTimeout) {
            clearTimeout(previewTimeout);
          }

          if (originalTheme) {
            // Restore original theme
            const root = document.documentElement;
            Object.entries(originalTheme.cssVariables).forEach(
              ([key, value]) => {
                root.style.setProperty(key, value);
              }
            );
          }

          set({
            isPreviewingTheme: false,
            previewTheme: null,
            originalTheme: null,
            previewTimeout: null,
          });

          console.log('Stopped theme preview');
        },

        customizeTheme: (
          themeId: string,
          customizations: Record<string, string>
        ) => {
          const { customizations: currentCustomizations } = get();

          const themeCustomization: ThemeCustomization = {
            themeId,
            customizations,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set({
            customizations: {
              ...currentCustomizations,
              [themeId]: themeCustomization,
            },
          });

          // Apply customizations if this is the current theme
          const { currentTheme } = get();
          if (currentTheme?.id === themeId) {
            const root = document.documentElement;
            Object.entries(customizations).forEach(([key, value]) => {
              root.style.setProperty(key, value);
            });
          }

          console.log('Customized theme:', themeId, customizations);
        },

        resetCustomizations: (themeId: string) => {
          const { customizations, currentTheme } = get();
          const updatedCustomizations = { ...customizations };
          delete updatedCustomizations[themeId];

          set({ customizations: updatedCustomizations });

          // Reset to original theme if this is the current theme
          if (currentTheme?.id === themeId) {
            const root = document.documentElement;
            Object.entries(currentTheme.cssVariables).forEach(
              ([key, value]) => {
                root.style.setProperty(key, value);
              }
            );
          }

          console.log('Reset customizations for theme:', themeId);
        },

        resetToDefaultTheme: () => {
          const defaultTheme = get().themes.find(t => t.id === 'default-light');
          if (defaultTheme) {
            get().applyTheme(defaultTheme.id);
          }
        },

        exportTheme: (themeId: string) => {
          const { themes, customizations } = get();
          const theme = themes.find(t => t.id === themeId);

          if (!theme) {
            console.error('Theme not found for export:', themeId);
            return null;
          }

          const exportData = {
            theme,
            customizations: customizations[themeId] || null,
            exportedAt: new Date().toISOString(),
          };

          return JSON.stringify(exportData, null, 2);
        },

        importTheme: async (themeData: string) => {
          try {
            const importedData = JSON.parse(themeData);
            const { theme, customizations } = importedData;

            if (!theme || !theme.id || !theme.name) {
              throw new Error('Invalid theme data');
            }

            // Add imported theme to themes list
            const { themes } = get();
            const newTheme: Theme = {
              ...theme,
              id: `imported-${Date.now()}`, // Ensure unique ID
              createdAt: new Date(),
              updatedAt: new Date(),
              isUnlocked: true,
              isPurchased: true,
            };

            set({
              themes: [...themes, newTheme],
              unlockedThemes: [...get().unlockedThemes, newTheme.id],
              purchasedThemes: [...get().purchasedThemes, newTheme.id],
            });

            // Import customizations if present
            if (customizations) {
              get().customizeTheme(newTheme.id, customizations.customizations);
            }

            console.log('Imported theme:', newTheme.name);
            return newTheme;
          } catch (error) {
            console.error('Error importing theme:', error);
            set({ error: 'Failed to import theme' });
            return null;
          }
        },

        setCurrentTheme: (theme: Theme | null) => {
          set({ currentTheme: theme });
        },

        addUnlockedTheme: (themeId: string) => {
          const { unlockedThemes } = get();
          if (!unlockedThemes.includes(themeId)) {
            set({ unlockedThemes: [...unlockedThemes, themeId] });
          }
        },

        addPurchasedTheme: (themeId: string) => {
          const { purchasedThemes } = get();
          if (!purchasedThemes.includes(themeId)) {
            set({ purchasedThemes: [...purchasedThemes, themeId] });
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setApplyingTheme: (applying: boolean) => {
          set({ isApplyingTheme: applying });
        },

        setPreviewingTheme: (previewing: boolean) => {
          set({ isPreviewingTheme: previewing });
        },

        setPurchasingTheme: (purchasing: boolean) => {
          set({ isPurchasingTheme: purchasing });
        },

        setUnlockingTheme: (unlocking: boolean) => {
          set({ isUnlockingTheme: unlocking });
        },

        reset: () => {
          const { previewTimeout } = get();
          if (previewTimeout) {
            clearTimeout(previewTimeout);
          }
          set(initialState);
        },
      }),
      {
        name: 'theme-store',
        partialize: state => ({
          currentTheme: state.currentTheme,
          unlockedThemes: state.unlockedThemes,
          purchasedThemes: state.purchasedThemes,
          themeHistory: state.themeHistory,
          customizations: state.customizations,
        }),
      }
    ),
    { name: 'ThemeStore' }
  )
);
