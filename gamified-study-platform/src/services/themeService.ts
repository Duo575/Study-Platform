import type { ThemeManager, Theme, ThemeCustomization } from '../types';

/**
 * Enhanced Theme Manager Service for managing themes and visual customization
 * Integrates with the theme store and provides advanced theme management features
 */
export class ThemeManagerService implements ThemeManager {
  private themes: Theme[] = [];
  private currentTheme: Theme | null = null;
  private previewTheme: Theme | null = null;
  private originalTheme: Theme | null = null;
  private previewTimeout: NodeJS.Timeout | null = null;
  private defaultTheme: Theme;
  private customizations: Map<string, ThemeCustomization> = new Map();

  constructor() {
    this.initializeThemes();
    this.defaultTheme = this.themes[0]; // Use first theme as default
    this.loadCustomizations();
  }

  /**
   * Initialize available themes with enhanced data structure
   */
  private initializeThemes(): void {
    this.themes = [
      // Default Theme
      {
        id: 'default-light',
        name: 'Classic Light',
        description: 'Clean and bright theme perfect for daytime studying',
        category: 'light',
        cssVariables: {
          '--theme-primary': '#3B82F6',
          '--theme-secondary': '#1E40AF',
          '--theme-accent': '#10B981',
          '--theme-background': '#FFFFFF',
          '--theme-surface': '#F8FAFC',
          '--theme-text': '#1F2937',
          '--theme-text-secondary': '#6B7280',
          '--theme-border': '#E5E7EB',
          '--theme-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
        previewImages: ['/themes/default-light-preview.png'],
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
          '--theme-accent': '#34D399',
          '--theme-background': '#111827',
          '--theme-surface': '#1F2937',
          '--theme-text': '#F9FAFB',
          '--theme-text-secondary': '#D1D5DB',
          '--theme-border': '#374151',
          '--theme-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        },
        previewImages: ['/themes/default-dark-preview.png'],
        price: 0,
        currency: 'coins',
        rarity: 'common',
        isUnlocked: true,
        isPurchased: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Nature Themes
      {
        id: 'forest-green',
        name: 'Forest Serenity',
        description: 'Nature-inspired green theme for peaceful studying',
        category: 'nature',
        cssVariables: {
          '--theme-primary': '#059669',
          '--theme-secondary': '#047857',
          '--theme-accent': '#F59E0B',
          '--theme-background': '#ECFDF5',
          '--theme-surface': '#D1FAE5',
          '--theme-text': '#064E3B',
          '--theme-text-secondary': '#065F46',
          '--theme-border': '#A7F3D0',
          '--theme-shadow': 'rgba(5, 150, 105, 0.1)',
        },
        previewImages: ['/themes/forest-green-preview.png'],
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
          '--theme-accent': '#F97316',
          '--theme-background': '#F0F9FF',
          '--theme-surface': '#E0F2FE',
          '--theme-text': '#0C4A6E',
          '--theme-text-secondary': '#075985',
          '--theme-border': '#BAE6FD',
          '--theme-shadow': 'rgba(14, 165, 233, 0.1)',
        },
        previewImages: ['/themes/ocean-blue-preview.png'],
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
          '--theme-accent': '#DC2626',
          '--theme-background':
            'linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%)',
          '--theme-surface': '#FEF3C7',
          '--theme-text': '#92400E',
          '--theme-text-secondary': '#B45309',
          '--theme-border': '#FDE68A',
          '--theme-shadow': 'rgba(245, 158, 11, 0.2)',
        },
        previewImages: ['/themes/sunset-gradient-preview.png'],
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

      // Seasonal Themes
      {
        id: 'cherry-blossom',
        name: 'Cherry Blossom',
        description: 'Delicate pink theme inspired by Japanese cherry blossoms',
        category: 'seasonal',
        cssVariables: {
          '--theme-primary': '#EC4899',
          '--theme-secondary': '#DB2777',
          '--theme-accent': '#10B981',
          '--theme-background': '#FDF2F8',
          '--theme-surface': '#FCE7F3',
          '--theme-text': '#831843',
          '--theme-text-secondary': '#9D174D',
          '--theme-border': '#F9A8D4',
          '--theme-shadow': 'rgba(236, 72, 153, 0.1)',
        },
        previewImages: ['/themes/cherry-blossom-preview.png'],
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
      // Additional themes with complete data structure
      {
        id: 'minimal-dark',
        name: 'Minimal Dark',
        description: 'Clean dark theme with minimal distractions',
        category: 'minimal',
        cssVariables: {
          '--theme-primary': '#6366F1',
          '--theme-secondary': '#4F46E5',
          '--theme-accent': '#8B5CF6',
          '--theme-background': '#0F172A',
          '--theme-surface': '#1E293B',
          '--theme-text': '#F1F5F9',
          '--theme-text-secondary': '#CBD5E1',
          '--theme-border': '#334155',
          '--theme-shadow': 'rgba(0, 0, 0, 0.3)',
        },
        previewImages: ['/themes/minimal-dark-preview.png'],
        price: 100,
        currency: 'coins',
        rarity: 'common',
        isUnlocked: false,
        isPurchased: false,
        unlockRequirements: [
          {
            type: 'coins',
            target: 100,
            current: 0,
            description: 'Purchase for 100 coins',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Apply a theme to the document with enhanced validation and persistence
   */
  async applyTheme(themeId: string): Promise<void> {
    try {
      const theme = this.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }

      // Check if theme is unlocked
      if (!theme.isUnlocked) {
        throw new Error(`Theme not unlocked: ${theme.name}`);
      }

      // Stop any active preview
      this.stopPreview();

      this.currentTheme = theme;
      await this.applyThemeVariables(theme);
      this.applyCustomComponents(theme);
      this.applyCustomizations(theme);

      // Store theme preference with timestamp
      const themeData = {
        themeId,
        appliedAt: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem('selected-theme', JSON.stringify(themeData));

      console.log(`Applied theme: ${theme.name}`);
    } catch (error) {
      console.error('Error applying theme:', error);
      throw error;
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[] {
    return [...this.themes];
  }

  /**
   * Unlock a theme for the user
   */
  async unlockTheme(themeId: string): Promise<boolean> {
    try {
      const theme = this.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }

      if (!theme.unlockRequirements) {
        return true; // Already unlocked
      }

      // Check unlock requirements
      const canUnlock = await this.checkUnlockRequirements(
        theme.unlockRequirements
      );

      if (canUnlock) {
        // In a real app, this would update the backend
        console.log(`Theme unlocked: ${themeId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error unlocking theme ${themeId}:`, error);
      throw new Error(`Failed to unlock theme: ${themeId}`);
    }
  }

  /**
   * Preview a theme without applying it permanently with auto-restore
   */
  previewTheme(themeId: string, duration: number = 10000): void {
    try {
      const theme = this.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }

      // Don't preview the same theme that's currently active
      if (theme.id === this.currentTheme?.id) {
        return;
      }

      // Clear any existing preview timeout
      if (this.previewTimeout) {
        clearTimeout(this.previewTimeout);
      }

      // Store original theme for restoration
      this.originalTheme = this.currentTheme;
      this.previewTheme = theme;

      // Apply preview theme
      this.applyThemeVariables(theme);
      this.applyCustomComponents(theme);
      this.applyCustomizations(theme);

      // Set timeout to restore original theme
      this.previewTimeout = setTimeout(() => {
        this.stopPreview();
      }, duration);

      console.log(`Previewing theme: ${theme.name} for ${duration}ms`);
    } catch (error) {
      console.error('Error previewing theme:', error);
      throw error;
    }
  }

  /**
   * Stop theme preview and restore original theme
   */
  stopPreview(): void {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this.originalTheme) {
      this.applyThemeVariables(this.originalTheme);
      this.applyCustomComponents(this.originalTheme);
      this.applyCustomizations(this.originalTheme);
      this.originalTheme = null;
    }

    this.previewTheme = null;
    console.log('Stopped theme preview');
  }

  /**
   * Reset to default theme
   */
  resetToDefaultTheme(): void {
    this.applyTheme(this.defaultTheme.id);
    this.previewTheme = null;
  }

  /**
   * Get the currently active theme
   */
  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category: Theme['category']): Theme[] {
    return this.themes.filter(theme => theme.category === category);
  }

  /**
   * Get themes by rarity
   */
  getThemesByRarity(rarity: Theme['rarity']): Theme[] {
    return this.themes.filter(theme => theme.rarity === rarity);
  }

  /**
   * Search themes by name or description
   */
  searchThemes(query: string): Theme[] {
    const lowercaseQuery = query.toLowerCase();
    return this.themes.filter(
      theme =>
        theme.name.toLowerCase().includes(lowercaseQuery) ||
        theme.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Apply CSS variables to the document with validation
   */
  private async applyThemeVariables(theme: Theme): Promise<void> {
    const root = document.documentElement;

    // Validate CSS variables before applying
    const validation = this.validateThemeVariables(theme.cssVariables);
    if (!validation.isValid) {
      console.warn('Theme has invalid CSS variables:', validation.errors);
    }

    // Apply variables with error handling
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      try {
        root.style.setProperty(key, value);
      } catch (error) {
        console.error(`Error applying CSS variable ${key}:`, error);
      }
    });

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  }

  /**
   * Apply theme customizations if they exist
   */
  private applyCustomizations(theme: Theme): void {
    const customization = this.customizations.get(theme.id);
    if (customization) {
      const root = document.documentElement;
      Object.entries(customization.customizations).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }

  /**
   * Validate CSS variables
   */
  private validateThemeVariables(variables: Record<string, string>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    Object.entries(variables).forEach(([key, value]) => {
      if (!key.startsWith('--')) {
        errors.push(`Invalid CSS variable name: ${key} (must start with --)`);
      }
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(
          `Invalid CSS variable value for ${key}: must be a non-empty string`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply custom component styles
   */
  private applyCustomComponents(theme: Theme): void {
    if (!theme.customComponents) return;

    // Remove existing custom styles
    const existingStyle = document.getElementById('theme-custom-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const style = document.createElement('style');
    style.id = 'theme-custom-styles';

    let css = '';
    theme.customComponents.forEach(component => {
      const selector = component.component;
      const styles = Object.entries(component.styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');

      css += `${selector} { ${styles} }\n`;
    });

    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Check if unlock requirements are met
   */
  private async checkUnlockRequirements(requirements: any[]): Promise<boolean> {
    // In a real app, this would check against user data from the backend
    // For now, we'll simulate the check
    for (const requirement of requirements) {
      switch (requirement.type) {
        case 'coins':
          console.log(`Checking coins requirement: ${requirement.target}`);
          break;
        case 'level':
          console.log(`Checking level requirement: ${requirement.target}`);
          break;
        case 'study_hours':
          console.log(
            `Checking study hours requirement: ${requirement.target}`
          );
          break;
        case 'streak':
          console.log(`Checking streak requirement: ${requirement.target}`);
          break;
        case 'achievement':
          console.log(
            `Checking achievement requirement: ${requirement.target}`
          );
          break;
        default:
          console.warn(`Unknown requirement type: ${requirement.type}`);
      }
    }

    // For demo purposes, return true
    return true;
  }

  /**
   * Customize a theme with user-defined CSS variables
   */
  customizeTheme(
    themeId: string,
    customizations: Record<string, string>
  ): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    const customization: ThemeCustomization = {
      themeId,
      customizations,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customizations.set(themeId, customization);

    // Apply customizations if this is the current theme
    if (this.currentTheme?.id === themeId) {
      this.applyCustomizations(theme);
    }

    // Persist customizations
    this.saveCustomizations();
    console.log(`Customized theme: ${theme.name}`);
  }

  /**
   * Reset customizations for a theme
   */
  resetCustomizations(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    this.customizations.delete(themeId);

    // Reapply original theme if this is the current theme
    if (this.currentTheme?.id === themeId) {
      this.applyThemeVariables(theme);
      this.applyCustomComponents(theme);
    }

    // Persist changes
    this.saveCustomizations();
    console.log(`Reset customizations for theme: ${theme.name}`);
  }

  /**
   * Get customizations for a theme
   */
  getThemeCustomizations(themeId: string): ThemeCustomization | null {
    return this.customizations.get(themeId) || null;
  }

  /**
   * Save customizations to localStorage
   */
  private saveCustomizations(): void {
    const customizationsData = Array.from(this.customizations.entries()).map(
      ([id, customization]) => ({
        id,
        ...customization,
      })
    );
    localStorage.setItem(
      'theme-customizations',
      JSON.stringify(customizationsData)
    );
  }

  /**
   * Load customizations from localStorage
   */
  private loadCustomizations(): void {
    try {
      const saved = localStorage.getItem('theme-customizations');
      if (saved) {
        const customizationsData = JSON.parse(saved);
        customizationsData.forEach((item: any) => {
          this.customizations.set(item.id, {
            themeId: item.themeId,
            customizations: item.customizations,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          });
        });
      }
    } catch (error) {
      console.error('Error loading theme customizations:', error);
    }
  }

  /**
   * Load theme from localStorage with enhanced data structure
   */
  loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem('selected-theme');
      if (saved) {
        // Try to parse as new format first
        try {
          const themeData = JSON.parse(saved);
          if (
            themeData.themeId &&
            this.themes.find(t => t.id === themeData.themeId)
          ) {
            this.applyTheme(themeData.themeId);
            return;
          }
        } catch {
          // Fall back to old format (just theme ID)
          if (this.themes.find(t => t.id === saved)) {
            this.applyTheme(saved);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }

    // Default fallback
    this.resetToDefaultTheme();
  }

  /**
   * Export theme data with customizations
   */
  exportTheme(themeId: string): string | null {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme) {
      return null;
    }

    const customizations = this.customizations.get(themeId);
    const exportData = {
      theme,
      customizations: customizations || null,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import custom theme with validation and conflict resolution
   */
  async importTheme(themeData: string): Promise<Theme | null> {
    try {
      const importedData = JSON.parse(themeData);
      const { theme, customizations } = importedData;

      // Validate theme data
      const validation = this.validateTheme(theme);
      if (!validation.isValid) {
        throw new Error(`Invalid theme data: ${validation.errors.join(', ')}`);
      }

      // Create new theme with unique ID if needed
      const newTheme: Theme = {
        ...theme,
        id: theme.id.startsWith('imported-')
          ? theme.id
          : `imported-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isUnlocked: true,
        isPurchased: true,
        price: theme.price || 0,
        currency: theme.currency || 'coins',
      };

      // Check if theme already exists
      const existingIndex = this.themes.findIndex(t => t.id === newTheme.id);
      if (existingIndex !== -1) {
        this.themes[existingIndex] = newTheme;
      } else {
        this.themes.push(newTheme);
      }

      // Import customizations if present
      if (customizations) {
        this.customizations.set(newTheme.id, {
          themeId: newTheme.id,
          customizations: customizations.customizations,
          createdAt: new Date(customizations.createdAt),
          updatedAt: new Date(),
        });
        this.saveCustomizations();
      }

      console.log(`Imported theme: ${newTheme.name}`);
      return newTheme;
    } catch (error) {
      console.error('Error importing theme:', error);
      return null;
    }
  }

  /**
   * Validate theme data with comprehensive checks
   */
  validateTheme(themeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!themeData.id) errors.push('Theme ID is required');
    if (!themeData.name) errors.push('Theme name is required');
    if (!themeData.cssVariables) errors.push('CSS variables are required');

    // Validate ID format
    if (themeData.id && !/^[a-z0-9-]+$/.test(themeData.id)) {
      errors.push(
        'Theme ID must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Validate category
    const validCategories = [
      'seasonal',
      'nature',
      'abstract',
      'minimal',
      'dark',
      'light',
    ];
    if (themeData.category && !validCategories.includes(themeData.category)) {
      errors.push(
        `Invalid category: ${themeData.category}. Must be one of: ${validCategories.join(', ')}`
      );
    }

    // Validate rarity
    const validRarities = ['common', 'rare', 'epic', 'legendary'];
    if (themeData.rarity && !validRarities.includes(themeData.rarity)) {
      errors.push(
        `Invalid rarity: ${themeData.rarity}. Must be one of: ${validRarities.join(', ')}`
      );
    }

    // Validate CSS variables
    if (themeData.cssVariables) {
      const variableValidation = this.validateThemeVariables(
        themeData.cssVariables
      );
      errors.push(...variableValidation.errors);
    }

    // Validate price and currency
    if (themeData.price !== undefined) {
      if (typeof themeData.price !== 'number' || themeData.price < 0) {
        errors.push('Price must be a non-negative number');
      }
    }

    if (
      themeData.currency &&
      !['coins', 'premium_coins'].includes(themeData.currency)
    ) {
      errors.push('Currency must be either "coins" or "premium_coins"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Purchase a theme (integrates with store system)
   */
  async purchaseTheme(themeId: string): Promise<boolean> {
    try {
      const theme = this.themes.find(t => t.id === themeId);
      if (!theme) {
        throw new Error(`Theme not found: ${themeId}`);
      }

      if (theme.isPurchased) {
        throw new Error('Theme already purchased');
      }

      // In a real app, this would integrate with the store system
      // For now, we'll simulate the purchase
      console.log(
        `Purchasing theme: ${theme.name} for ${theme.price} ${theme.currency}`
      );

      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as purchased and unlocked
      theme.isPurchased = true;
      theme.isUnlocked = true;

      console.log(`Successfully purchased theme: ${theme.name}`);
      return true;
    } catch (error) {
      console.error('Error purchasing theme:', error);
      return false;
    }
  }

  /**
   * Get themes that can be unlocked with current progress
   */
  getUnlockableThemes(): Theme[] {
    return this.themes.filter(
      theme =>
        !theme.isUnlocked &&
        theme.unlockRequirements &&
        theme.unlockRequirements.every(req => req.current >= req.target)
    );
  }

  /**
   * Update unlock requirement progress
   */
  updateUnlockProgress(requirementType: string, currentValue: number): void {
    this.themes.forEach(theme => {
      if (theme.unlockRequirements) {
        theme.unlockRequirements.forEach(requirement => {
          if (requirement.type === requirementType) {
            requirement.current = currentValue;
          }
        });
      }
    });
  }

  /**
   * Dispose of resources and cleanup
   */
  dispose(): void {
    // Clear preview timeout
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    // Remove custom styles
    const existingStyle = document.getElementById('theme-custom-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Remove theme class from body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');

    // Clear state
    this.currentTheme = null;
    this.previewTheme = null;
    this.originalTheme = null;
    this.customizations.clear();
  }
}

// Create and export a singleton instance
export const themeService = new ThemeManagerService();
