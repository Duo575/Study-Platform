import React, { useEffect, createContext, useContext } from 'react';
import { Theme } from '../../types';
import { useThemeStore } from '../../store/themeStore';
import { themeService } from '../../services/themeService';

interface ThemeContextValue {
  currentTheme: Theme | null;
  applyTheme: (themeId: string) => Promise<void>;
  previewTheme: (themeId: string, duration?: number) => void;
  stopPreview: () => void;
  customizeTheme: (
    themeId: string,
    customizations: Record<string, string>
  ) => void;
  resetCustomizations: (themeId: string) => void;
  isPreviewingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const {
    currentTheme,
    isPreviewingTheme,
    loadThemes,
    applyTheme: storeApplyTheme,
    startPreviewTheme: storePreviewTheme,
    stopPreview: storeStopPreview,
  } = useThemeStore();

  useEffect(() => {
    // Initialize themes and load saved theme
    const initializeThemes = async () => {
      try {
        await loadThemes();
        themeService.loadSavedTheme();
      } catch (error) {
        console.error('Error initializing themes:', error);
        // Fallback to default theme
        themeService.resetToDefaultTheme();
      }
    };

    initializeThemes();
  }, [loadThemes]);

  useEffect(() => {
    // Apply theme changes to document
    if (currentTheme) {
      const root = document.documentElement;

      // Apply theme CSS variables
      Object.entries(currentTheme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Add theme class to body
      document.body.className = document.body.className.replace(
        /theme-\w+/g,
        ''
      );
      document.body.classList.add(`theme-${currentTheme.id}`);

      // Apply any customizations
      const customizations = themeService.getThemeCustomizations(
        currentTheme.id
      );
      if (customizations) {
        Object.entries(customizations.customizations).forEach(
          ([key, value]) => {
            root.style.setProperty(key, value);
          }
        );
      }
    }
  }, [currentTheme]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually selected a theme
      const savedTheme = localStorage.getItem('selected-theme');
      if (!savedTheme) {
        const defaultTheme = e.matches ? 'default-dark' : 'default-light';
        storeApplyTheme(defaultTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [storeApplyTheme]);

  const applyTheme = async (themeId: string) => {
    try {
      await storeApplyTheme(themeId);
      if (themeService) {
        await themeService.applyTheme(themeId);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      throw error;
    }
  };

  const previewTheme = (themeId: string, duration?: number) => {
    storePreviewTheme(themeId, duration);
    if (themeService) {
      themeService.previewTheme(themeId, duration);
    }
  };

  const stopPreview = () => {
    storeStopPreview();
    if (themeService) {
      themeService.stopPreview();
    }
  };

  const customizeTheme = (
    themeId: string,
    customizations: Record<string, string>
  ) => {
    if (themeService) {
      themeService.customizeTheme(themeId, customizations);
    }
  };

  const resetCustomizations = (themeId: string) => {
    if (themeService) {
      themeService.resetCustomizations(themeId);
    }
  };

  const contextValue: ThemeContextValue = {
    currentTheme,
    applyTheme,
    previewTheme,
    stopPreview,
    customizeTheme,
    resetCustomizations,
    isPreviewingTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="theme-provider">{children}</div>
    </ThemeContext.Provider>
  );
};

// Theme transition component for smooth theme changes
export const ThemeTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isPreviewingTheme } = useTheme();

  return (
    <div
      className={`theme-transition ${isPreviewingTheme ? 'previewing' : ''}`}
      style={{
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {children}
    </div>
  );
};

// Quick theme switcher component
interface QuickThemeSwitcherProps {
  className?: string;
}

export const QuickThemeSwitcher: React.FC<QuickThemeSwitcherProps> = ({
  className = '',
}) => {
  const { currentTheme, applyTheme } = useTheme();
  const { themes, unlockedThemes } = useThemeStore();

  const quickThemes = themes.filter(
    theme =>
      unlockedThemes.includes(theme.id) &&
      ['default-light', 'default-dark'].includes(theme.id)
  );

  const handleQuickSwitch = async () => {
    if (!currentTheme) return;

    const currentIndex = quickThemes.findIndex(
      theme => theme.id === currentTheme.id
    );
    const nextIndex = (currentIndex + 1) % quickThemes.length;
    const nextTheme = quickThemes[nextIndex];

    if (nextTheme) {
      try {
        await applyTheme(nextTheme.id);
      } catch (error) {
        console.error('Error switching theme:', error);
      }
    }
  };

  if (quickThemes.length < 2) return null;

  return (
    <button
      onClick={handleQuickSwitch}
      className={`quick-theme-switcher p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      title={`Switch to ${quickThemes.find(t => t.id !== currentTheme?.id)?.name || 'next theme'}`}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{
            backgroundColor:
              currentTheme?.cssVariables['--theme-primary'] || '#3B82F6',
          }}
        />
        <span className="text-sm">🔄</span>
      </div>
    </button>
  );
};

// Theme status indicator
export const ThemeStatusIndicator: React.FC = () => {
  const { currentTheme, isPreviewingTheme } = useTheme();
  const { previewTheme } = useThemeStore();

  if (!currentTheme) return null;

  return (
    <div className="theme-status-indicator flex items-center gap-2 text-sm">
      <div
        className="w-3 h-3 rounded-full border border-gray-300"
        style={{
          backgroundColor: currentTheme.cssVariables['--theme-primary'],
        }}
      />
      <span className="text-gray-600">
        {isPreviewingTheme && previewTheme ? (
          <>Previewing: {previewTheme.name}</>
        ) : (
          <>Theme: {currentTheme.name}</>
        )}
      </span>
    </div>
  );
};
