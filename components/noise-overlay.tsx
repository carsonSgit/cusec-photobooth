'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateNoise();
    };

    const generateNoise = () => {
      if (!ctx) return;
      
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Generate noise with slight offset for movement
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          // Use offset for movement effect - creates shifting grain
          const noiseX = Math.floor((x + offsetXRef.current) % width);
          const noiseY = Math.floor((y + offsetYRef.current) % height);
          // Use seeded random based on position for consistent noise pattern
          const seed = (noiseX * 73856093) ^ (noiseY * 19349663);
          const value = ((Math.sin(seed) * 10000) % 1 + 1) * 127.5;
          
          data[index] = value;     // R
          data[index + 1] = value; // G
          data[index + 2] = value; // B
          data[index + 3] = 25;    // Alpha (increased for better visibility)
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animate noise movement
    let animationFrame: number;
    const animate = () => {
      offsetXRef.current = (offsetXRef.current + 0.5) % 1000;
      offsetYRef.current = (offsetYRef.current + 0.3) % 1000;
      generateNoise();
      animationFrame = requestAnimationFrame(animate);
    };
    
    // Update less frequently for performance
    const interval = setInterval(() => {
      generateNoise();
    }, 150);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(interval);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ 
        imageRendering: 'pixelated',
        mixBlendMode: 'overlay',
        zIndex: 1
      }}
      animate={{
        opacity: [0.35, 0.45, 0.35],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

