import React, { useState } from 'react';
import { clsx } from 'clsx';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  placeholder?: string | React.ReactNode;
  fallback?: string | React.ReactNode;
  className?: string;
  imageClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  // Accessibility props
  role?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  longDesc?: string;
  // Decorative images
  decorative?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes = '100vw',
  width,
  height,
  aspectRatio = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  placeholder,
  fallback,
  className = '',
  imageClassName = '',
  onLoad,
  onError,
  priority = false,
  role,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
  longDesc,
  decorative = false,
  ...props
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '3:2': 'aspect-[3/2]',
    auto: '',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const containerClasses = clsx(
    'relative overflow-hidden',
    aspectRatio !== 'auto' && aspectRatioClasses[aspectRatio],
    className
  );

  const imageClasses = clsx(
    'transition-opacity duration-300',
    aspectRatio !== 'auto' ? 'absolute inset-0 w-full h-full' : 'w-full h-auto',
    objectFitClasses[objectFit],
    isLoading && 'opacity-0',
    !isLoading && 'opacity-100',
    imageClassName
  );

  // Show fallback if there's an error
  if (hasError && fallback) {
    return (
      <div className={containerClasses}>
        {typeof fallback === 'string' ? (
          <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {fallback}
          </div>
        ) : (
          fallback
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {/* Placeholder while loading */}
      {isLoading && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {typeof placeholder === 'string' ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {placeholder}
            </div>
          ) : (
            placeholder
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !placeholder && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Main image */}
      <img
        src={src}
        alt={decorative ? '' : alt}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        className={imageClasses}
        onLoad={handleLoad}
        onError={handleError}
        role={decorative ? 'presentation' : role}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={decorative}
        {...props}
      />
    </div>
  );
}
// Specialized image components
export function HeroImage({
  className = '',
  aspectRatio = '16:9',
  objectFit = 'cover',
  priority = true,
  ...props
}: Omit<ResponsiveImageProps, 'aspectRatio' | 'objectFit' | 'priority'> & {
  aspectRatio?: ResponsiveImageProps['aspectRatio'];
  objectFit?: ResponsiveImageProps['objectFit'];
  priority?: ResponsiveImageProps['priority'];
}) {
  return (
    <ResponsiveImage
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      priority={priority}
      className={clsx('w-full', className)}
      {...props}
    />
  );
}

export function LazyImage({
  loading = 'lazy',
  placeholder = 'Loading image...',
  ...props
}: Omit<ResponsiveImageProps, 'loading' | 'placeholder'> & {
  loading?: ResponsiveImageProps['loading'];
  placeholder?: ResponsiveImageProps['placeholder'];
}) {
  return (
    <ResponsiveImage loading={loading} placeholder={placeholder} {...props} />
  );
}

export function AvatarImage({
  className = '',
  aspectRatio = 'square',
  objectFit = 'cover',
  fallback,
  alt,
  ...props
}: Omit<ResponsiveImageProps, 'aspectRatio' | 'objectFit'> & {
  aspectRatio?: ResponsiveImageProps['aspectRatio'];
  objectFit?: ResponsiveImageProps['objectFit'];
}) {
  const defaultFallback = (
    <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
      <svg
        className="w-1/2 h-1/2"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );

  return (
    <ResponsiveImage
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      fallback={fallback || defaultFallback}
      className={clsx('rounded-full', className)}
      alt={alt}
      {...props}
    />
  );
}
