import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPAnimationProps {
  xpAmount: number;
  onComplete?: () => void;
  position?: 'top-right' | 'bottom-right' | 'center';
}

/**
 * Component that displays animated XP gain notifications
 */
export const XPAnimation: React.FC<XPAnimationProps> = ({
  xpAmount,
  onComplete,
  position = 'top-right',
}) => {
  // Position classes based on the position prop
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none`}>
      <AnimatePresence>
        <motion.div
          className="flex items-center bg-blue-600/90 text-white px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm"
          initial={{ 
            opacity: 0, 
            y: position.includes('top') ? -20 : 20,
            x: position === 'center' ? 0 : 20,
            scale: 0.8
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            x: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: position.includes('top') ? -10 : 10,
            scale: 0.8
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
        >
          <div className="mr-3">
            <motion.div
              className="text-yellow-300 font-bold text-lg"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              +{xpAmount}
            </motion.div>
            <div className="text-xs text-center">XP</div>
          </div>
          <div className="text-sm font-medium">Todo Completed!</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default XPAnimation;