'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { usePhotoboothStore } from '@/lib/store';
import { CountdownTimer } from '@/components/countdown-timer';
import { photoThumbnailVariants, flashVariants } from '@/lib/animations';

export function CameraCapture() {
  const { videoRef, isStreaming, error, facingMode, startCamera, stopCamera, switchCamera, capturePhoto } = useCamera();
  const { photos, addPhoto, setCurrentScreen, clearPhotos } = usePhotoboothStore();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [flash, setFlash] = useState(false);
  const [statusText, setStatusText] = useState('Get ready!');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (photos.length === 0) {
      setTimeout(() => {
        startCountdown();
      }, 2000);
    } else if (photos.length < 3) {
      setStatusText('Great! Next photo coming...');
      setTimeout(() => {
        startCountdown();
      }, 1500);
    } else if (photos.length === 3) {
      setStatusText('All done! Processing...');
      setTimeout(() => {
        stopCamera();
        setCurrentScreen('save');
      }, 1000);
    }
  }, [photos.length]);

  const startCountdown = useCallback(() => {
    setIsCountingDown(true);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setIsCountingDown(false);
    const photo = capturePhoto();
    if (photo) {
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
      addPhoto(photo);
    }
  }, [capturePhoto, addPhoto]);

  const handleCancel = () => {
    stopCamera();
    clearPhotos();
    setCurrentScreen('landing');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-xl mb-4 font-display">{error}</p>
          <Button onClick={handleCancel}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden overflow-locked">
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          facingMode === 'user' ? 'scale-x-[-1]' : ''
        }`}
        playsInline
        muted
      />

      <AnimatePresence>
        {flash && (
          <motion.div 
            className="absolute inset-0 z-40"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)' }}
            variants={flashVariants}
            initial="initial"
            animate="animate"
            exit="initial"
          />
        )}
      </AnimatePresence>

      {isCountingDown && (
        <CountdownTimer onComplete={handleCountdownComplete} />
      )}

      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start">
        <motion.div 
          className="glass-dark text-white px-4 py-2 rounded-full shadow-premium font-display font-semibold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Photo {photos.length + 1} of 3
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          className="glass-dark text-white hover:bg-white/20"
          onClick={handleCancel}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="absolute top-20 left-4 right-4 z-30 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              variants={photoThumbnailVariants}
              initial="initial"
              animate="animate"
              className="relative shrink-0"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden shadow-premium-lg border-2 border-white/50">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.p 
            key={statusText}
            className="glass-dark text-white text-lg font-display font-semibold px-6 py-3 rounded-full shadow-premium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          className="glass-dark text-white hover:bg-white/20"
          onClick={switchCamera}
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
