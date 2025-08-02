import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'warning'
    | 'success'
    | 'outline'
    | 'ghost'
    | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  loadingText,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 min-h-[44px] min-w-[44px]';

  const variantStyles = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    warning:
      'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-300',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
    info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    outline:
      'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-300 disabled:border-primary-300',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500 disabled:text-gray-400',
  };

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const actualLoading = isLoading || loading;
  const disabledStyles =
    disabled || actualLoading ? 'cursor-not-allowed' : 'cursor-pointer';

  // Generate accessible label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (actualLoading && loadingText) return loadingText;
    if (actualLoading) return 'Loading';
    return undefined;
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        disabledStyles,
        className
      )}
      disabled={disabled || actualLoading}
      aria-label={getAriaLabel()}
      aria-busy={actualLoading}
      {...props}
    >
      {actualLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="sr-only">Loading</span>
        </>
      )}
      {!actualLoading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span>{actualLoading && loadingText ? loadingText : children}</span>
      {!actualLoading && rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
