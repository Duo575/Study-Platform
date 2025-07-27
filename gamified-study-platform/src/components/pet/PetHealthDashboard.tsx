import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { usePetStore } from '../../store/petStore';
import {
  petHealthMonitor,
  type HealthAlert,
} from '../../services/petHealthMonitor';
import type { PetNeed } from '../../types';

interface PetHealthDashboardProps {
  userId: string;
  className?: string;
  showTrends?: boolean;
  showAlerts?: boolean;
}

export const PetHealthDashboard: React.FC<PetHealthDashboardProps> = ({
  userId,
  className = '',
  showTrends = true,
  showAlerts = true,
}) => {
  const { pet, petStatus, petNeeds, updatePetStatus, checkPetNeeds } =
    usePetStore();

  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [recoveryPlan, setRecoveryPlan] = useState<any>(null);
  const [showRecoveryPlan, setShowRecoveryPlan] = useState(false);
  const [healthTrends, setHealthTrends] = useState<any[]>([]);

  // Initialize health monitoring
  useEffect(() => {
    if (pet) {
      // Start health monitoring
      petHealthMonitor.startHealthMonitoring(
        pet.id,
        (petId, healthData) => {
          // Update pet status when health data changes
          updatePetStatus(userId);
        },
        alert => {
          // Handle new health alerts
          setHealthAlerts(prev => [alert, ...prev.slice(0, 9)]);
        }
      );

      // Load existing alerts
      const existingAlerts = petHealthMonitor.getHealthAlerts(pet.id);
      setHealthAlerts(existingAlerts);

      return () => {
        petHealthMonitor.stopHealthMonitoring(pet.id);
      };
    }
  }, [pet, userId, updatePetStatus]);

  // Update recovery plan when pet status changes
  useEffect(() => {
    if (petStatus && pet) {
      const plan = petHealthMonitor.getHealthRecoveryPlan(pet.id, petStatus);
      setRecoveryPlan(plan);

      // Show recovery plan if priority is high or critical
      if (plan.priority === 'high' || plan.priority === 'critical') {
        setShowRecoveryPlan(true);
      }
    }
  }, [petStatus, pet]);

  // Load health trends
  useEffect(() => {
    if (pet) {
      const trends = petHealthMonitor.getHealthTrends(pet.id, 24);
      setHealthTrends(trends);
    }
  }, [pet]);

  const handleAcknowledgeAlert = (alertId: string) => {
    if (pet) {
      petHealthMonitor.acknowledgeAlert(pet.id, alertId);
      setHealthAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    }
  };

  const getHealthStatusColor = (health: number) => {
    if (health >= 80) return 'text-green-600';
    if (health >= 60) return 'text-yellow-600';
    if (health >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthStatusText = (health: number) => {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Fair';
    if (health >= 20) return 'Poor';
    return 'Critical';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  if (!pet) {
    return (
      <div className={`pet-health-dashboard ${className}`}>
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No pet to monitor</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pet-health-dashboard space-y-6 ${className}`}>
      {/* Health Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <HeartSolidIcon className="w-6 h-6 text-red-500" />
            <span>{pet.name}'s Health</span>
          </h3>
          {petStatus && (
            <div
              className={`text-sm font-medium ${getHealthStatusColor(petStatus.health)}`}
            >
              {getHealthStatusText(petStatus.health)}
            </div>
          )}
        </div>

        {petStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Health */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getHealthStatusColor(petStatus.health)}`}
              >
                {petStatus.health}
              </div>
              <div className="text-sm text-gray-600">Health</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    petStatus.health >= 70
                      ? 'bg-green-500'
                      : petStatus.health >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${petStatus.health}%` }}
                />
              </div>
            </div>

            {/* Happiness */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getHealthStatusColor(petStatus.happiness)}`}
              >
                {petStatus.happiness}
              </div>
              <div className="text-sm text-gray-600">Happiness</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    petStatus.happiness >= 70
                      ? 'bg-green-500'
                      : petStatus.happiness >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${petStatus.happiness}%` }}
                />
              </div>
            </div>

            {/* Hunger */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  petStatus.hunger >= 80
                    ? 'text-red-600'
                    : petStatus.hunger >= 60
                      ? 'text-orange-600'
                      : petStatus.hunger >= 40
                        ? 'text-yellow-600'
                        : 'text-green-600'
                }`}
              >
                {petStatus.hunger}
              </div>
              <div className="text-sm text-gray-600">Hunger</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    petStatus.hunger >= 80
                      ? 'bg-red-500'
                      : petStatus.hunger >= 60
                        ? 'bg-orange-500'
                        : petStatus.hunger >= 40
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
                  style={{ width: `${petStatus.hunger}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getHealthStatusColor(petStatus.energy)}`}
              >
                {petStatus.energy}
              </div>
              <div className="text-sm text-gray-600">Energy</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    petStatus.energy >= 70
                      ? 'bg-green-500'
                      : petStatus.energy >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${petStatus.energy}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Health Alerts */}
      {showAlerts && healthAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BellIcon className="w-6 h-6 text-orange-500" />
            <span>Health Alerts</span>
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {healthAlerts
              .filter(alert => !alert.acknowledged)
              .map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {alert.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </div>
                        {alert.actionRequired && (
                          <div className="text-sm font-medium text-blue-600 mt-2">
                            Action: {alert.actionRequired}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recovery Plan */}
      {recoveryPlan && showRecoveryPlan && recoveryPlan.actions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <ChartBarIcon className="w-6 h-6 text-blue-500" />
              <span>Recovery Plan</span>
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(recoveryPlan.priority)}`}
            >
              {recoveryPlan.priority} priority
            </div>
          </div>

          <div className="space-y-3">
            {recoveryPlan.actions.map((action: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    action.urgency === 'immediate'
                      ? 'bg-red-500'
                      : action.urgency === 'soon'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {action.action}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <span
                      className={`font-medium ${
                        action.urgency === 'immediate'
                          ? 'text-red-600'
                          : action.urgency === 'soon'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}
                    >
                      {action.urgency.replace('_', ' ')}
                    </span>
                    <span className="text-blue-600">
                      {action.estimatedEffect}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Estimated recovery time: {recoveryPlan.timeToRecovery}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowRecoveryPlan(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Hide recovery plan
          </button>
        </div>
      )}

      {/* Pet Needs */}
      {petNeeds.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Needs
          </h3>
          <div className="space-y-2">
            {petNeeds.map((need, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    need.urgency === 'critical'
                      ? 'bg-red-500'
                      : need.urgency === 'high'
                        ? 'bg-orange-500'
                        : need.urgency === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-900">
                    {need.description}
                  </span>
                  {need.timeRemaining && need.timeRemaining > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({need.timeRemaining}m)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Status Summary */}
      {petStatus && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Health Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Last fed:</span>
              <span className="ml-2 font-medium">
                {Math.floor(petStatus.timeSinceLastFed / 60)}h{' '}
                {petStatus.timeSinceLastFed % 60}m ago
              </span>
            </div>
            <div>
              <span className="text-gray-600">Last played:</span>
              <span className="ml-2 font-medium">
                {Math.floor(petStatus.timeSinceLastPlayed / 60)}h{' '}
                {petStatus.timeSinceLastPlayed % 60}m ago
              </span>
            </div>
            <div>
              <span className="text-gray-600">Overall status:</span>
              <span
                className={`ml-2 font-medium ${getHealthStatusColor(petStatus.health)}`}
              >
                {getHealthStatusText(petStatus.health)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Needs attention:</span>
              <span
                className={`ml-2 font-medium ${petStatus.needsAttention ? 'text-red-600' : 'text-green-600'}`}
              >
                {petStatus.needsAttention ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
