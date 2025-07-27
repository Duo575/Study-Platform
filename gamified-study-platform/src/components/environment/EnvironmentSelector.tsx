import React, { useState } from 'react';
import {
  ChevronDownIcon,
  LockClosedIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnvironment } from './EnvironmentProvider';
import { useEnvironmentStore } from '../../store/environmentStore';
import {
  LoadingAnimation,
  HoverScale,
  StaggerAnimation,
} from '../ui/AnimationComponents';
import type { Environment } from '../../types';

interface EnvironmentSelectorProps {
  className?: string;
  showPreview?: boolean;
}

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  className = '',
  showPreview = true,
}) => {
  const {
    currentEnvironment,
    availableEnvironments,
    unlockedEnvironments,
    switchEnvironment,
    isLoading,
  } = useEnvironment();

  const { isSwitchingEnvironment } = useEnvironmentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [previewEnvironment, setPreviewEnvironment] =
    useState<Environment | null>(null);

  const handleEnvironmentSelect = async (environmentId: string) => {
    if (!unlockedEnvironments.includes(environmentId)) {
      return; // Can't select locked environments
    }

    try {
      await switchEnvironment(environmentId);
      setIsOpen(false);
      setPreviewEnvironment(null);
    } catch (error) {
      console.error('Failed to switch environment:', error);
    }
  };

  const handleEnvironmentHover = (environment: Environment) => {
    if (showPreview && unlockedEnvironments.includes(environment.id)) {
      setPreviewEnvironment(environment);
    }
  };

  const handleEnvironmentLeave = () => {
    if (showPreview) {
      setPreviewEnvironment(null);
    }
  };

  const isEnvironmentUnlocked = (environmentId: string) => {
    return unlockedEnvironments.includes(environmentId);
  };

  const getEnvironmentPreviewStyle = (environment: Environment) => {
    if (!showPreview || previewEnvironment?.id !== environment.id) {
      return {};
    }

    return {
      background: `linear-gradient(135deg, ${environment.theme.primaryColor}20, ${environment.theme.secondaryColor}20)`,
      borderColor: environment.theme.primaryColor,
    };
  };

  if (isLoading || availableEnvironments.length === 0) {
    return (
      <div className={`environment-selector loading ${className}`}>
        <LoadingAnimation
          isLoading={true}
          type="wave"
          message="Loading environments..."
          className="h-10"
        />
      </div>
    );
  }

  return (
    <div className={`environment-selector relative ${className}`}>
      {/* Current Environment Display */}
      <HoverScale scale={1.02}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitchingEnvironment}
          className={`
            w-full flex items-center justify-between px-4 py-2 
            bg-white border border-gray-300 rounded-lg shadow-sm
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
            ${isSwitchingEnvironment ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          style={{
            borderColor: currentEnvironment?.theme.primaryColor || '#D1D5DB',
            backgroundColor: currentEnvironment
              ? `${currentEnvironment.theme.primaryColor}10`
              : 'white',
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            borderColor: currentEnvironment?.theme.primaryColor || '#D1D5DB',
            backgroundColor: currentEnvironment
              ? `${currentEnvironment.theme.primaryColor}10`
              : 'white',
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            {/* Environment Icon/Preview */}
            <div
              className="w-6 h-6 rounded-full border-2"
              style={{
                backgroundColor:
                  currentEnvironment?.theme.primaryColor || '#6B7280',
                borderColor:
                  currentEnvironment?.theme.secondaryColor || '#9CA3AF',
              }}
            />

            <div className="text-left">
              <div className="font-medium text-gray-900">
                {currentEnvironment?.name || 'Select Environment'}
              </div>
              {currentEnvironment && (
                <div className="text-xs text-gray-500 capitalize">
                  {currentEnvironment.category}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {isSwitchingEnvironment && (
                <LoadingAnimation
                  isLoading={true}
                  type="spinner"
                  className="w-4 h-4"
                />
              )}
            </AnimatePresence>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </motion.button>
      </HoverScale>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            <StaggerAnimation staggerDelay={0.05}>
              {availableEnvironments.map(environment => {
                const isUnlocked = isEnvironmentUnlocked(environment.id);
                const isCurrent = currentEnvironment?.id === environment.id;

                return (
                  <motion.div
                    key={environment.id}
                    className={`
                      flex items-center justify-between px-4 py-3 
                      hover:bg-gray-50 cursor-pointer transition-colors duration-150
                      ${isCurrent ? 'bg-blue-50' : ''}
                      ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                    style={getEnvironmentPreviewStyle(environment)}
                    onClick={() =>
                      isUnlocked && handleEnvironmentSelect(environment.id)
                    }
                    onMouseEnter={() => handleEnvironmentHover(environment)}
                    onMouseLeave={handleEnvironmentLeave}
                    whileHover={isUnlocked ? { scale: 1.02, x: 4 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Environment Preview */}
                      <div
                        className="w-8 h-8 rounded-lg border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: `${environment.theme.primaryColor}20`,
                          borderColor: environment.theme.primaryColor,
                        }}
                      >
                        {!isUnlocked ? (
                          <LockClosedIcon className="w-4 h-4 text-gray-500" />
                        ) : isCurrent ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: environment.theme.primaryColor,
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{environment.name}</span>
                          {environment.category === 'premium' && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>

                        {!isUnlocked && environment.unlockRequirements && (
                          <div className="text-xs text-gray-500 mt-1">
                            {environment.unlockRequirements[0]?.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {isCurrent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </StaggerAnimation>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
