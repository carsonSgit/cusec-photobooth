'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { countdownVariants } from '@/lib/animations';

interface CountdownTimerProps {
  onComplete: () => void;
  duration?: number;
}

export function CountdownTimer({ onComplete, duration = 3 }: CountdownTimerProps) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    setCount(duration);
  }, [duration]);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-50 flex items-center justify-center">
          <div className="w-64 h-64 bg-cusec-red rounded-full"></div>
        </div>

        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              variants={countdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative"
            >
              <div className="text-[200px] font-display font-bold bg-gradient-to-br from-cusec-red via-white to-cusec-navy bg-clip-text text-transparent leading-none">
                {count}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="smile" 
              variants={countdownVariants}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div className="text-8xl font-display font-bold bg-gradient-to-br from-cusec-red via-white to-cusec-navy bg-clip-text text-transparent px-8">
                Smile! 📸
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
