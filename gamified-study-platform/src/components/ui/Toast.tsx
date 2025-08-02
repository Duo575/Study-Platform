import React, { useState, useEffect } from 'react';

interface ToastProps {
  children: React.ReactNode;
  visible?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  duration?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
}

export const Toast: React.FC<ToastProps> = ({
  children,
  visible = true,
  isOpen,
  onClose,
  duration = 5000,
  variant = 'default',
  title,
}) => {
  const [isVisible, setIsVisible] = useState(
    isOpen !== undefined ? isOpen : visible
  );

  useEffect(() => {
    setIsVisible(isOpen !== undefined ? isOpen : visible);
  }, [visible, isOpen]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const variantClasses = {
    default: 'bg-white border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div
        className={`rounded-lg shadow-lg border p-4 ${variantClasses[variant]}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">{children}</div>
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
