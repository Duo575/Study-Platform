import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AIProvider } from './contexts/AIContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { FeedbackProvider } from './components/feedback/FeedbackSystem';
import {
  SystemIntegration,
  MicroInteractions,
} from './components/integration/SystemIntegration';
import { ErrorIntegration } from './components/integration/ErrorIntegration';
import {
  FinalPolish,
  PerformanceMonitor,
  UXEnhancements,
  AccessibilityEnhancements,
} from './components/integration/FinalPolish';
import PerformanceDashboard from './components/admin/PerformanceDashboard';
import { AuthDebugPanel } from './components/debug/AuthDebugPanel';

// Lazy load pages for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() =>
  import('./pages/LoginPage').then(module => ({ default: module.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import('./pages/RegisterPage').then(module => ({
    default: module.RegisterPage,
  }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('./pages/ForgotPasswordPage').then(module => ({
    default: module.ForgotPasswordPage,
  }))
);
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then(module => ({
    default: module.DashboardPage,
  }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then(module => ({
    default: module.ProfilePage,
  }))
);
const UIShowcasePage = React.lazy(() =>
  import('./pages/UIShowcasePage').then(module => ({
    default: module.UIShowcasePage,
  }))
);
const CoursesPage = React.lazy(() => import('./pages/CoursesPage'));
const CourseFormPage = React.lazy(() => import('./pages/CourseFormPage'));
const CourseDetailPage = React.lazy(() => import('./pages/CourseDetailPage'));
const TodoPage = React.lazy(() =>
  import('./pages/TodoPage').then(module => ({ default: module.TodoPage }))
);
const PomodoroPage = React.lazy(() =>
  import('./pages/PomodoroPage').then(module => ({
    default: module.PomodoroPage,
  }))
);
const RoutinePage = React.lazy(() =>
  import('./pages/RoutinePage').then(module => ({
    default: module.RoutinePage,
  }))
);
const ProgressPage = React.lazy(() =>
  import('./pages/ProgressPage').then(module => ({
    default: module.ProgressPage,
  }))
);
const AIAssistantPage = React.lazy(() => import('./pages/AIAssistantPage'));
const StudyGroupsPage = React.lazy(() => import('./pages/StudyGroupsPage'));
const RecommendationsPage = React.lazy(
  () => import('./pages/RecommendationsPage')
);
const DataExportPage = React.lazy(() => import('./pages/DataExportPage'));
const QuestsPage = React.lazy(() => import('./pages/QuestsPage'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AccessibilityProvider>
          <FeedbackProvider>
            <AuthProvider>
              <AIProvider>
                <Router>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route
                        path="/login"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <LoginPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <RegisterPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/forgot-password"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <ForgotPasswordPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Protected routes with layout */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <DashboardPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <ProfilePage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Course routes */}
                      <Route
                        path="/courses"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CoursesPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/new"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CourseFormPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/edit/:id"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CourseFormPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/courses/:id"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <CourseDetailPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/quests"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <QuestsPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/todos"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <TodoPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/timer"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <PomodoroPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/routine"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <RoutinePage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/progress"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <ProgressPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/pet"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <div className="text-center py-12">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  Study Pet
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                  Coming soon...
                                </p>
                              </div>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/groups"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <StudyGroupsPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/recommendations"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                              <RecommendationsPage />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ai-assistant"
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<LoadingSpinner />}>
                              <AIAssistantPage />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/ui-showcase"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <UIShowcasePage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/data-export"
                        element={
                          <ProtectedRoute>
                            <AppLayout>
                              <Suspense fallback={<LoadingSpinner />}>
                                <DataExportPage />
                              </Suspense>
                            </AppLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>

                  {/* System Integration Components */}
                  <SystemIntegration />
                  <ErrorIntegration />
                  <MicroInteractions />

                  {/* Final Polish Components */}
                  <FinalPolish />
                  <PerformanceMonitor />
                  <UXEnhancements />
                  <AccessibilityEnhancements />

                  {/* Performance Dashboard - only visible in development or when enabled */}
                  <PerformanceDashboard />

                  {/* Auth Debug Panel - only in development */}
                  {process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
                </Router>
              </AIProvider>
            </AuthProvider>
          </FeedbackProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
