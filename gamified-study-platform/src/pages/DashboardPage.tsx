import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSpinner';
import { useOnboarding } from '../components/onboarding/OnboardingTour';
import { useFeedback } from '../components/feedback/FeedbackSystem';
import { Link } from 'react-router-dom';
import { PetDashboardWidget } from '../components/gamification/pet';
import LearningRecommendation from '../components/features/LearningRecommendation';
import { recommendationService } from '../services/recommendationService';
import type { StudentLearningProfile } from '../types';
import {
  BookOpen,
  Target,
  Timer,
  Users,
  Trophy,
  Zap,
  Calendar,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { startTour } = useOnboarding();
  const { addMessage } = useFeedback();
  const [learningProfile, setLearningProfile] = useState<StudentLearningProfile | undefined>();
  
  useEffect(() => {
    const fetchLearningProfile = async () => {
      if (user?.id) {
        try {
          const profile = await recommendationService.getUserLearningProfile(user.id);
          setLearningProfile(profile);
        } catch (error) {
          console.error('Error fetching learning profile:', error);
        }
      }
    };
    
    fetchLearningProfile();
  }, [user?.id]);

  const handleGetStarted = () => {
    addMessage({
      type: 'info',
      title: "Let's get you started!",
      message: 'Would you like to take a guided tour first?',
      action: {
        label: 'Start Tour',
        onClick: () => startTour('dashboard'),
      },
      duration: 8000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your study command center,{' '}
          {user?.profile?.username || user?.email?.split('@')[0]}!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="xp-bar">
        <Card variant="elevated">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Level
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                1
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-secondary-600 dark:text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total XP
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-accent-600 dark:text-accent-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0 days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>🎉 Welcome to StudyQuest!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You've successfully set up your account and are ready to begin your
            gamified study journey. Here's what you can do next:
          </p>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Create your first course and upload a syllabus
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Choose and name your virtual study pet
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Complete your first quest to earn XP
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Set up your study routine and goals
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleGetStarted}>Get Started</Button>
            <Button variant="outline" onClick={() => startTour('dashboard')}>
              Take a Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/courses"
          data-tour="courses"
          className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              Courses
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage syllabi
            </p>
          </div>
        </Link>

        <Link
          to="/quests"
          data-tour="quests"
          className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              Quests
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Study tasks
            </p>
          </div>
        </Link>

        <Link
          to="/timer"
          data-tour="timer"
          className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Timer className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              Timer
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pomodoro
            </p>
          </div>
        </Link>

        <Link
          to="/groups"
          data-tour="social"
          className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              Groups
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Study together
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No recent activity yet. Start studying to see your progress
                here!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card data-tour="pet">
          <CardHeader>
            <CardTitle>Your Study Pet</CardTitle>
          </CardHeader>
          <CardContent>
            <PetDashboardWidget userId={user?.id || ''} />
          </CardContent>
        </Card>
      </div>
      
      {/* Learning Recommendations */}
      <div className="mt-6">
        <LearningRecommendation 
          userId={user?.id || ''} 
          learningProfile={learningProfile}
          maxRecommendations={3}
          showActions={true}
          className="shadow-md"
        />
        <div className="mt-2 text-right">
          <Link 
            to="/learning-recommendations" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View detailed learning recommendations →
          </Link>
        </div>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Welcome Tour"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            This is a demo modal showcasing the new UI components! The modal
            includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Smooth animations with Framer Motion</li>
            <li>Dark mode support</li>
            <li>Keyboard navigation (try pressing Escape)</li>
            <li>Responsive design</li>
            <li>Accessible focus management</li>
          </ul>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button onClick={() => setShowModal(false)}>Got it!</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
