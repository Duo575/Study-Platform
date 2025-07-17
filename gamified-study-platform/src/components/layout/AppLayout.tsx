import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { SkipLinks } from '../ui/SkipLinks';
import { AccessibilityToolbar } from '../ui/AccessibilityToolbar';
import { AccessibilityTesterComponent } from '../ui/AccessibilityTester';
import { HelpSystem, useHelp } from '../help/HelpSystem';
import {
  OnboardingTour,
  useOnboarding,
  dashboardTourSteps,
} from '../onboarding/OnboardingTour';
import { useAuth } from '../../contexts/AuthContext';
import { useFeedback } from '../feedback/FeedbackSystem';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { addMessage } = useFeedback();
  const { isHelpOpen, openHelp, closeHelp } = useHelp();
  const { hasCompletedOnboarding, currentTour, startTour, completeTour } =
    useOnboarding();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Auto-start onboarding for new users
  useEffect(() => {
    if (user && !hasCompletedOnboarding && !currentTour) {
      // Delay to allow page to load
      const timer = setTimeout(() => {
        addMessage({
          type: 'info',
          title: 'Welcome to StudyQuest!',
          message: 'Would you like to take a quick tour to get started?',
          action: {
            label: 'Start Tour',
            onClick: () => startTour('dashboard'),
          },
          duration: 10000,
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedOnboarding, currentTour, addMessage, startTour]);

  const handleTourComplete = () => {
    completeTour('dashboard');
    addMessage({
      type: 'success',
      title: 'Tour Complete!',
      message: "You're all set to start your study journey. Good luck!",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Links */}
      <SkipLinks />

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"
        aria-label="Main navigation"
      >
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
        <Sidebar onNavigate={closeMobileMenu} />
      </MobileDrawer>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header onMenuClick={toggleMobileMenu} />

        <main
          id="main-content"
          className="flex-1 py-6"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar />

      {/* Accessibility Tester (Development Only) */}
      <AccessibilityTesterComponent position="bottom-left" />

      {/* Help System */}
      <HelpSystem isOpen={isHelpOpen} onClose={closeHelp} />

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={dashboardTourSteps}
        isOpen={currentTour === 'dashboard'}
        onClose={() => completeTour('dashboard')}
        onComplete={handleTourComplete}
      />
    </div>
  );
}
