import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Heart, Star, Zap, Trophy, Target } from 'lucide-react';

// Floating particles effect
export const FloatingParticles: React.FC<{ count?: number; color?: string }> = ({ 
  count = 20, 
  color = 'blue' 
}) => {
  const particles = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(i => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 bg-${color}-400 rounded-full opacity-60`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: -10,
            x: Math.random() * window.innerW