import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { environmentService } from '../../services/environmentService';
import { EnvironmentTransition } from '../ui/AnimationComponents';
import type { Environment } from '../../types';

interface EnvironmentContextType {
  currentEnvironment: Environment | null;
  availableEnvironments: Environment[];
  unlockedEnvironments: string[];
  switchEnvironment: (environmentId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(
  undefined
);

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider: React.FC<EnvironmentProviderProps> = ({
  children,
}) => {
  const {
    currentEnvironment,
    availableEnvironments,
    unlockedEnvironments,
    isLoading,
    error,
    loadEnvironments,
    switchEnvironment: storeSwitchEnvironment,
    setError,
  } = useEnvironmentStore();

  // Load environments on mount
  useEffect(() => {
    const initializeEnvironments = async () => {
      try {
        await loadEnvironments();

        // Preload unlocked environments
        if (unlockedEnvironments.length > 0) {
          await environmentService.preloadEnvironments(unlockedEnvironments);
        }
      } catch (error) {
        console.error('Failed to initialize environments:', error);
        setError('Failed to load environments');
      }
    };

    if (availableEnvironments.length === 0) {
      initializeEnvironments();
    }
  }, [
    loadEnvironments,
    unlockedEnvironments,
    availableEnvironments.length,
    setError,
  ]);

  // Apply current environment theme on mount and changes
  useEffect(() => {
    if (currentEnvironment) {
      applyEnvironmentTheme(currentEnvironment);
    }
  }, [currentEnvironment]);

  const applyEnvironmentTheme = (environment: Environment) => {
    const root = document.documentElement;

    // Add environment switching class for enhanced animations
    document.body.classList.add('environment-switching');

    // Apply CSS variables with smooth transitions
    Object.entries(environment.theme.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply background image with transition
    if (environment.visuals.backgroundImage) {
      root.style.setProperty(
        '--env-background-image',
        `url(${environment.visuals.backgroundImage})`
      );
    }

    // Apply additional theme properties with transitions
    root.style.setProperty('--env-primary', environment.theme.primaryColor);
    root.style.setProperty('--env-secondary', environment.theme.secondaryColor);
    root.style.setProperty(
      '--env-background',
      environment.theme.backgroundColor
    );
    root.style.setProperty('--env-text', environment.theme.textColor);
    root.style.setProperty('--env-accent', environment.theme.accentColor);

    // Add transition classes for smooth theme changes
    root.style.setProperty(
      '--theme-transition',
      'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    );

    // Remove switching class after animation completes
    setTimeout(() => {
      document.body.classList.remove('environment-switching');
    }, 1200);
  };

  const handleSwitchEnvironment = async (environmentId: string) => {
    try {
      await storeSwitchEnvironment(environmentId);
    } catch (error) {
      console.error('Failed to switch environment:', error);
      throw error;
    }
  };

  const contextValue: EnvironmentContextType = {
    currentEnvironment,
    availableEnvironments,
    unlockedEnvironments,
    switchEnvironment: handleSwitchEnvironment,
    isLoading,
    error,
  };

  return (
    <EnvironmentContext.Provider value={contextValue}>
      <EnvironmentTransition
        environmentId={currentEnvironment?.id || 'default'}
        className="environment-wrapper"
      >
        <div data-environment={currentEnvironment?.id}>{children}</div>
      </EnvironmentTransition>
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error(
      'useEnvironment must be used within an EnvironmentProvider'
    );
  }
  return context;
};
