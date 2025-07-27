/**
 * Persistence Provider component to initialize and manage data persistence
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  usePersistenceInit,
  useEnvironmentPersistence,
  useThemePersistence,
  useUserPreferencesPersistence,
  useAutoSave,
} from '../../hooks/usePersistence';

interface PersistenceContextValue {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

const PersistenceContext = createContext<PersistenceContextValue>({
  isInitialized: false,
  isLoading: true,
  error: null,
});

export const usePersistenceContext = () => {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error(
      'usePersistenceContext must be used within a PersistenceProvider'
    );
  }
  return context;
};

interface PersistenceProviderProps {
  children: React.ReactNode;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize persistence system
  usePersistenceInit();

  // Initialize store persistence hooks
  useEnvironmentPersistence();
  useThemePersistence();
  useUserPreferencesPersistence();

  // Enable auto-save functionality
  useAutoSave();

  // Handle initialization state
  useEffect(() => {
    const initializeTimeout = setTimeout(() => {
      setIsInitialized(true);
      setIsLoading(false);
    }, 1000); // Give time for all persistence hooks to initialize

    return () => clearTimeout(initializeTimeout);
  }, []);

  // Handle errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes('persistence') ||
        event.message.includes('storage')
      ) {
        setError(
          'Failed to initialize data persistence. Some settings may not be saved.'
        );
        console.error('Persistence error:', event.error);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const contextValue: PersistenceContextValue = {
    isInitialized,
    isLoading,
    error,
  };

  return (
    <PersistenceContext.Provider value={contextValue}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg max-w-sm z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Persistence Warning</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-yellow-600 hover:text-yellow-500 mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </PersistenceContext.Provider>
  );
};
