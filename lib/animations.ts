import { Variants } from 'framer-motion';

export const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 1.05, 
    filter: 'blur(10px)',
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
  }
};

export const buttonVariants = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 }
};

export const countdownVariants: Variants = {
  initial: { scale: 0.5, opacity: 0, rotate: -10 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  exit: { 
    scale: 1.5, 
    opacity: 0, 
    rotate: 10, 
    transition: { duration: 0.3 } 
  }
};

export const photoThumbnailVariants: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -5 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  }
};

export const flashVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: [0, 1, 0], 
    transition: { duration: 0.4 } 
  }
};
