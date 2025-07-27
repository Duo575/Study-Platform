import React, { Suspense, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { LoadingAnimation } from './AnimationComponents';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingMessage?: string;
  className?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  loadingMessage = 'Loading...',
  className = '',
}) => {
  const defaultFallback = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center justify-center min-h-[200px] ${className}`}
    >
      <LoadingAnimation
        isLoading={true}
        type="orbit"
        message={loadingMessage}
        className="text-center"
      />
    </motion.div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

// Higher-order component for lazy loading with error boundary
interface LazyComponentProps {
  component: ComponentType<any>;
  loadingMessage?: string;
  errorMessage?: string;
  className?: string;
}

export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  options: {
    loadingMessage?: string;
    errorMessage?: string;
    className?: string;
  } = {}
) => {
  const LazyComponent: React.FC<P> = props => {
    return (
      <LazyWrapper
        loadingMessage={options.loadingMessage}
        className={options.className}
      >
        <Component {...props} />
      </LazyWrapper>
    );
  };

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent;
};

// Preloader for critical components
export const preloadComponent = (componentImport: () => Promise<any>) => {
  // Preload the component in the background
  componentImport().catch(error => {
    console.warn('Failed to preload component:', error);
  });
};

// Batch preloader for multiple components
export const preloadComponents = (componentImports: (() => Promise<any>)[]) => {
  componentImports.forEach(importFn => {
    preloadComponent(importFn);
  });
};

// Hook for conditional preloading
export const useConditionalPreload = (
  condition: boolean,
  componentImport: () => Promise<any>
) => {
  React.useEffect(() => {
    if (condition) {
      preloadComponent(componentImport);
    }
  }, [condition, componentImport]);
};

// Progressive loading component
interface ProgressiveLoaderProps {
  stages: Array<{
    component: () => Promise<any>;
    name: string;
    priority: number;
  }>;
  onStageLoaded?: (stageName: string) => void;
  onAllLoaded?: () => void;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  stages,
  onStageLoaded,
  onAllLoaded,
}) => {
  const [loadedStages, setLoadedStages] = React.useState<string[]>([]);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const sortedStages = [...stages].sort((a, b) => a.priority - b.priority);

    const loadStages = async () => {
      for (const stage of sortedStages) {
        try {
          await stage.component();
          setLoadedStages(prev => [...prev, stage.name]);
          setProgress(prev => prev + 100 / stages.length);
          onStageLoaded?.(stage.name);
        } catch (error) {
          console.warn(`Failed to load stage ${stage.name}:`, error);
        }
      }
      onAllLoaded?.();
    };

    loadStages();
  }, [stages, onStageLoaded, onAllLoaded]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="progressive-loader p-4 bg-white rounded-lg shadow-sm"
    >
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Loading components...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Loaded: {loadedStages.join(', ')}
      </div>
    </motion.div>
  );
};
