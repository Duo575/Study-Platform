import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useNetworkAwareLoading,
  useLazyLoading,
} from '../../hooks/usePerformanceOptimization';
import { assetOptimizer } from '../../services/assetOptimizationService';
import { LoadingAnimation } from './AnimationComponents';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  width?: number;
  height?: number;
  priority?: 'high' | 'medium' | 'low';
  quality?: number;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  width,
  height,
  priority = 'medium',
  quality = 80,
  lazy = true,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);

  const { getOptimalImageQuality, shouldLoadAsset } = useNetworkAwareLoading();
  const { elementRef, isVisible } = useLazyLoading(0.1);
  const imageRef = useRef<HTMLImageElement>(null);

  // Determine if image should load
  const shouldLoad = !lazy || isVisible;
  const optimalQuality = getOptimalImageQuality(quality);

  // Get optimized image URL
  const optimizedSrc = assetOptimizer.getOptimizedImageUrl(src, {
    width,
    height,
    quality: optimalQuality,
    format: 'webp', // Prefer WebP for better compression
  });

  useEffect(() => {
    if (!shouldLoad) return;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Load placeholder first if provided
        if (placeholderSrc && !placeholderLoaded) {
          try {
            await assetOptimizer.loadImage(placeholderSrc, 'high');
            setCurrentSrc(placeholderSrc);
            setPlaceholderLoaded(true);
          } catch (error) {
            console.warn('Failed to load placeholder:', error);
          }
        }

        // Check if we should load the full image based on network conditions
        const estimatedSize = (width || 800) * (height || 600) * 0.1; // Rough estimate
        if (!shouldLoadAsset(estimatedSize, priority)) {
          // Use placeholder or low-quality version
          if (placeholderSrc) {
            setCurrentSrc(placeholderSrc);
            setIsLoading(false);
            return;
          }
        }

        // Load the full image
        const img = await assetOptimizer.loadImage(optimizedSrc, priority);
        setCurrentSrc(optimizedSrc);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        console.error('Failed to load image:', error);
        setHasError(true);
        setIsLoading(false);
        onError?.(error as Error);
      }
    };

    loadImage();
  }, [
    shouldLoad,
    optimizedSrc,
    placeholderSrc,
    priority,
    width,
    height,
    onLoad,
    onError,
    shouldLoadAsset,
    placeholderLoaded,
  ]);

  // Preload image on hover for better UX
  const handleMouseEnter = () => {
    if (!currentSrc && priority !== 'high') {
      assetOptimizer.preloadAssets([
        { src: optimizedSrc, type: 'image', priority: 'medium' },
      ]);
    }
  };

  if (hasError) {
    return (
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className={`flex items-center justify-center bg-gray-200 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      onMouseEnter={handleMouseEnter}
    >
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <LoadingAnimation
              isLoading={true}
              type="pulse"
              className="w-8 h-8"
            />
          </motion.div>
        )}

        {currentSrc && (
          <motion.img
            key={currentSrc}
            ref={imageRef}
            src={currentSrc}
            alt={alt}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
          />
        )}
      </AnimatePresence>

      {/* Progressive enhancement: Show quality indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Q: {optimalQuality}%
        </div>
      )}
    </div>
  );
};

// Optimized background image component
interface OptimizedBackgroundProps {
  src: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
  priority?: 'high' | 'medium' | 'low';
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  className = '',
  children,
  overlay = false,
  overlayOpacity = 0.3,
  priority = 'low',
}) => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const { getOptimalImageQuality } = useNetworkAwareLoading();

  const optimalQuality = getOptimalImageQuality(60); // Lower quality for backgrounds
  const optimizedSrc = assetOptimizer.getOptimizedImageUrl(src, {
    quality: optimalQuality,
    format: 'webp',
  });

  useEffect(() => {
    assetOptimizer
      .loadImage(optimizedSrc, priority)
      .then(() => setBackgroundLoaded(true))
      .catch(error => console.warn('Failed to load background:', error));
  }, [optimizedSrc, priority]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {backgroundLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${optimizedSrc})` }}
          />
        )}
      </AnimatePresence>

      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Image gallery with progressive loading
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    thumbnail?: string;
  }>;
  className?: string;
  itemClassName?: string;
}

export const OptimizedImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  itemClassName = '',
}) => {
  const [loadedCount, setLoadedCount] = useState(0);

  const handleImageLoad = () => {
    setLoadedCount(prev => prev + 1);
  };

  return (
    <div className={`grid gap-4 ${className}`}>
      {/* Progress indicator */}
      {loadedCount < images.length && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Loading images...</span>
            <span>
              {loadedCount}/{images.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(loadedCount / images.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <OptimizedImage
            key={image.src}
            src={image.src}
            alt={image.alt}
            placeholderSrc={image.thumbnail}
            className={`aspect-square ${itemClassName}`}
            priority={index < 4 ? 'high' : 'low'} // Prioritize first 4 images
            onLoad={handleImageLoad}
          />
        ))}
      </div>
    </div>
  );
};
