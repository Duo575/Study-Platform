import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StudyPet } from '../components/gamification/pet/StudyPet';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';

export function PetPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access your study pet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Study Pet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Take care of your virtual study companion and watch them grow as you
          learn!
        </p>
      </div>

      {/* Pet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pet Display */}
        <div className="lg:col-span-2">
          <StudyPet userId={user.id} className="h-full" />
        </div>

        {/* Pet Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pet Care Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">🍎</span>
                  <div>
                    <p className="font-medium">Feed your pet</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Keep your pet happy and healthy by feeding them regularly
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">⚽</span>
                  <div>
                    <p className="font-medium">Play with your pet</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Playing increases happiness and strengthens your bond
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-500">✨</span>
                  <div>
                    <p className="font-medium">Study to help them grow</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your study activities help your pet gain experience and
                      evolve
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evolution Stages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🥚</span>
                  <div>
                    <p className="font-medium">Egg</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Starting stage
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🐣</span>
                  <div>
                    <p className="font-medium">Baby</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Level 1-5
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🐾</span>
                  <div>
                    <p className="font-medium">Teen</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Level 6-15
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🦄</span>
                  <div>
                    <p className="font-medium">Adult</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Level 16-30
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <p className="font-medium">Master</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Level 30+
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
