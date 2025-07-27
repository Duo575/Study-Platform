import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PetDisplay } from './PetDisplay';
import { Button } from '../../ui/Button';
import { usePetStore } from '../../../store/petStore';

interface PetDashboardWidgetProps {
  userId: string;
}

export function PetDashboardWidget({ userId }: PetDashboardWidgetProps) {
  const { pet, isLoading, fetchUserPet } = usePetStore();

  // Fetch pet data when component mounts
  useEffect(() => {
    if (userId) {
      fetchUserPet(userId);
    }
  }, [userId, fetchUserPet]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading your pet...
        </p>
      </div>
    );
  }

  // Show pet selection if no pet exists
  if (!pet) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🥚</span>
        </div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          Choose Your Pet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Select and name your study companion to get started!
        </p>
        <Link to="/pet">
          <Button size="sm">Choose Pet</Button>
        </Link>
      </div>
    );
  }

  // Show compact pet display for dashboard
  return (
    <div className="space-y-4">
      <PetDisplay
        userId={userId}
        size="md"
        showStats={true}
        showActions={false}
        className="flex flex-col items-center"
      />

      {/* Quick actions */}
      <div className="flex justify-center space-x-2">
        <Link to="/pet">
          <Button size="sm" variant="outline">
            Visit Pet
          </Button>
        </Link>
      </div>
    </div>
  );
}
