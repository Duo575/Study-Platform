import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { useHelp } from '../help/HelpSystem';
import { useOnboarding } from '../onboarding/OnboardingTour';
import { HelpCircle, Play } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openHelp } = useHelp();
  const { startTour } = useOnboarding();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStartTour = () => {
    startTour('dashboard');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <IconButton
              onClick={onMenuClick}
              variant="ghost"
              aria-label="Open sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </IconButton>
          </div>

          {/* Logo/Title for mobile */}
          <div className="flex items-center lg:hidden">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              StudyQuest
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Help button */}
            <IconButton
              onClick={openHelp}
              variant="ghost"
              aria-label="Open help center"
              className="hidden sm:flex"
            >
              <HelpCircle className="w-5 h-5" />
            </IconButton>

            {/* Tour button */}
            <IconButton
              onClick={handleStartTour}
              variant="ghost"
              aria-label="Start guided tour"
              className="hidden sm:flex"
            >
              <Play className="w-5 h-5" />
            </IconButton>

            {/* Theme toggle */}
            <IconButton
              onClick={toggleTheme}
              variant="ghost"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </IconButton>

            {/* Notifications */}
            <IconButton variant="ghost" aria-label="Notifications">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM10.07 2.82a3 3 0 00-4.24 0L2.82 5.83a3 3 0 000 4.24l2.01 2.01a3 3 0 004.24 0l2.01-2.01a3 3 0 000-4.24L10.07 2.82z"
                />
              </svg>
            </IconButton>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Level 1 • 0 XP
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Avatar */}
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Sign out button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:inline-flex"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
