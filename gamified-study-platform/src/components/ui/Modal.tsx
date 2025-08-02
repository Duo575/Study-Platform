import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useFocusTrap } from '../../hooks/useAccessibility';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocus,
  'aria-describedby': ariaDescribedBy,
  'aria-labelledby': ariaLabelledBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(
    `modal-title-${Math.random().toString(36).substr(2, 9)}`
  );
  const descriptionId = useRef(
    `modal-description-${Math.random().toString(36).substr(2, 9)}`
  );
  const focusTrapRef = useFocusTrap(isOpen);
  const { settings, announce } = useAccessibility();

  // Close on escape key and manage focus
  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    // Focus management
    const focusElement =
      initialFocus?.current ||
      (modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement);
    if (focusElement) {
      focusElement.focus();
    }

    // Announce modal opening to screen readers
    if (title) {
      announce(`Dialog opened: ${title}`, 'assertive');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Return focus to previous element
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === 'function'
      ) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onClose, closeOnEscape, initialFocus, title, announce]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // Animation settings based on reduced motion preference
  const animationProps = settings.reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.2 },
      };

  const backdropAnimationProps = settings.reducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          <motion.div
            {...backdropAnimationProps}
            className="fixed inset-0 bg-black bg-opacity-50"
            aria-hidden="true"
          />
          <motion.div
            ref={node => {
              if (modalRef.current !== node) {
                modalRef.current = node;
              }
              if (focusTrapRef.current !== node) {
                focusTrapRef.current = node;
              }
            }}
            {...animationProps}
            className={clsx(
              'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full',
              sizeClasses[size]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={
              ariaLabelledBy || (title ? titleId.current : undefined)
            }
            aria-describedby={ariaDescribedBy || descriptionId.current}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3
                  id={titleId.current}
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-1"
                    onClick={onClose}
                    aria-label="Close dialog"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
            )}

            {/* Content */}
            <div
              className="p-4 text-gray-900 dark:text-white"
              id={descriptionId.current}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
