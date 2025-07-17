import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '../../../store/gamificationStore';

interface XPAnimationProps {
  position?: 'top-right' | 'bottom-right' | 'center';
  maxItems?: number;
}

export function XPAnimation({
  position = 'top-right',
  maxItems = 3,
}: XPAnimationProps) {
  const { xpAnimationQueue, removeXPAnimation } = useGamificationStore();
  
  // Only show the most recent animations up to maxItems
  const visibleAnimations = xpAnimationQueue.slice(-maxItems);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} flex flex-col items-end gap-2`}>
      <AnimatePresence>
        {visibleAnimations.map((animation) => (
          <motion.div
            key={animation.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="bg-indigo-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center"
            onAnimationComplete={() => {
              // Auto-remove after animation completes
              setTimeout(() => removeXPAnimation(animation.id), 2000);
            }}
          >
            <span className="text-yellow-300 font-bold mr-1">+{animation.amount}</span>
            <span className="text-sm">XP</span>
            <span className="text-xs ml-2 opacity-80">
              {animation.source}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}