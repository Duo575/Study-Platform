import React, { useState, useEffect } from 'react';
import { OnboardingTour, useOnboarding } from './OnboardingTour';
import { HelpTooltip, ContextHelp, QuickTips } from '../ui/HelpTooltip';

interface OnboardingManagerProps {
  userId: string;
  currentPage: string;
  className?: string;
}

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({
  userId,
  currentPage,
  className = '',
}) => {
  const { activeTour, startTour, completeTour, skipTour, shouldShowTour } =
    useOnboarding();

  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(`welcome-${userId}`);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem(`welcome-${userId}`, 'true');
    }

    // Auto-start relevant tours based on current page
    if (currentPage === 'pet' && shouldShowTour('pet-adoption')) {
      setTimeout(() => startTour('pet-adoption'), 1000);
    } else if (
      currentPage === 'environment' &&
      shouldShowTour('environment-selection')
    ) {
      setTimeout(() => startTour('environment-selection'), 1000);
    } else if (currentPage === 'games' && shouldShowTour('mini-games')) {
      setTimeout(() => startTour('mini-games'), 1000);
    } else if (currentPage === 'store' && shouldShowTour('store-usage')) {
      setTimeout(() => startTour('store-usage'), 1000);
    }
  }, [currentPage, userId, shouldShowTour, startTour]);

  const getPageTips = () => {
    switch (currentPage) {
      case 'pet':
        return [
          'Feed your pet regularly to keep it healthy and happy',
          "Study sessions boost your pet's mood and evolution progress",
          'Play with your pet during breaks for bonus happiness',
          "Check your pet's needs in the status display",
        ];
      case 'environment':
        return [
          'Choose environments that match your study mood',
          'Adjust ambient sound volume for optimal focus',
          'Unlock new environments by maintaining study streaks',
          'Combine environments with lo-fi music for best results',
        ];
      case 'games':
        return [
          'Use mini-games during study breaks to refresh your mind',
          'Complete games to earn coins for your pet',
          'Games are time-limited to prevent over-distraction',
          'Try different games to find your favorites',
        ];
      case 'store':
        return [
          'Spend earned coins on pet food and accessories',
          'Check item effects before making purchases',
          'Premium items provide better bonuses',
          'Environment unlocks are permanent upgrades',
        ];
      default:
        return [
          'Start by adopting your first virtual pet',
          'Choose a comfortable study environment',
          'Take breaks with relaxing mini-games',
          'Earn coins to customize your experience',
        ];
    }
  };

  return (
    <div className={`onboarding-manager ${className}`}>
      {/* Welcome message for new users */}
      {showWelcome && (
        <div className="fixed top-4 right-4 z-40 max-w-sm">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Welcome to Gamified Study! 🎉</h3>
            <p className="text-sm mb-3">
              Let's get you started with your personalized study experience.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  startTour('complete-tour');
                  setShowWelcome(false);
                }}
                className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Take Tour
              </button>
              <button
                onClick={() => setShowWelcome(false)}
                className="px-3 py-1 bg-transparent border border-white text-white rounded text-sm hover:bg-white hover:text-blue-600 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context-sensitive help */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="flex flex-col space-y-2 items-end">
          {/* Quick tips */}
          <QuickTips
            title="💡 Study Tips"
            tips={getPageTips()}
            className="max-w-xs"
          />

          {/* Help button */}
          <ContextHelp
            context={currentPage as any}
            className="bg-white shadow-lg rounded-full"
          />

          {/* Tour restart button */}
          <HelpTooltip
            content="Restart the guided tour for this section"
            type="info"
            trigger="hover"
          >
            <button
              onClick={() => {
                const tourMap: Record<string, string> = {
                  pet: 'pet-adoption',
                  environment: 'environment-selection',
                  games: 'mini-games',
                  store: 'store-usage',
                };
                startTour(tourMap[currentPage] || 'complete-tour');
              }}
              className="p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-sm font-medium">?</span>
            </button>
          </HelpTooltip>
        </div>
      </div>

      {/* Active tour */}
      {activeTour && (
        <OnboardingTour
          isActive={true}
          tourType={activeTour as any}
          onComplete={() => completeTour(activeTour)}
          onSkip={skipTour}
        />
      )}
    </div>
  );
};

// Simple tutorial trigger component
interface TutorialTriggerProps {
  tourType: string;
  children: React.ReactNode;
  className?: string;
}

export const TutorialTrigger: React.FC<TutorialTriggerProps> = ({
  tourType,
  children,
  className = '',
}) => {
  const { startTour, shouldShowTour } = useOnboarding();

  if (!shouldShowTour(tourType)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute -top-2 -right-2 z-10">
        <button
          onClick={() => startTour(tourType)}
          className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-600 transition-colors animate-pulse"
        >
          ?
        </button>
      </div>
    </div>
  );
};
