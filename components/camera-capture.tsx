"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SwitchCamera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CountdownTimer } from "@/components/countdown-timer";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/use-camera";
import { flashVariants, photoThumbnailVariants } from "@/lib/animations";
import { usePhotoboothStore } from "@/lib/store";
import { generateSessionId } from "@/lib/supabase";

export function CameraCapture() {
	const orientation = usePhotoboothStore((state) => state.orientation);
	const {
		videoRef,
		error,
		facingMode,
		startCamera,
		stopCamera,
		switchCamera,
		capturePhoto,
	} = useCamera(orientation);
	const { photos, addPhoto, setCurrentScreen, clearPhotos, sessionId, setSessionId } =
		usePhotoboothStore();
	const sessionIdGeneratedRef = useRef(false);
	const [isCountingDown, setIsCountingDown] = useState(false);
	const [flash, setFlash] = useState(false);
	const [statusText, setStatusText] = useState("Get ready!");

	// Generate session ID on mount (with duplicate prevention for React Strict Mode)
	useEffect(() => {
		if (!sessionId && !sessionIdGeneratedRef.current) {
			sessionIdGeneratedRef.current = true;
			setSessionId(generateSessionId());
		}
	}, [sessionId, setSessionId]);

	// Safari-compatible viewport height fix
	useEffect(() => {
		const updateVh = () => {
			document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
		};
		updateVh();
		window.addEventListener('resize', updateVh);
		window.addEventListener('orientationchange', updateVh);
		return () => {
			window.removeEventListener('resize', updateVh);
			window.removeEventListener('orientationchange', updateVh);
		};
	}, []);

	useEffect(() => {
		startCamera();
		return () => {
			stopCamera();
		};
	}, [startCamera, stopCamera]);

	const startCountdown = useCallback(() => {
		setIsCountingDown(true);
	}, []);

	useEffect(() => {
		if (photos.length === 0) {
			setTimeout(() => {
				startCountdown();
			}, 2000);
		} else if (photos.length < 3) {
			setStatusText("Great! Next photo coming...");
			setTimeout(() => {
				startCountdown();
			}, 1500);
		} else if (photos.length === 3) {
			setStatusText("All done! Processing...");
			setTimeout(() => {
				stopCamera();
				setCurrentScreen("save");
			}, 1000);
		}
	}, [photos.length, startCountdown, stopCamera, setCurrentScreen]);

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
		setCurrentScreen("landing");
	};

	if (error) {
		return (
			<div className="h-screen-safe bg-black flex items-center justify-center p-4">
				<div className="text-center text-white">
					<p className="text-xl mb-4 font-display">{error}</p>
					<Button onClick={handleCancel}>Go Back</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen-safe bg-black relative overflow-hidden overflow-locked">
			<video
				ref={videoRef}
				className={`absolute inset-0 w-full h-full object-cover ${
					facingMode === "user" ? "scale-x-[-1]" : ""
				}`}
				playsInline
				muted
			/>

			<AnimatePresence>
				{flash && (
					<motion.div
						className="absolute inset-0 z-40"
						style={{
							background:
								"radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)",
						}}
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

			{/* Top bar - photo count and close button */}
			<div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start landscape:top-2">
				<motion.div
					className="glass-dark text-white px-4 py-2 rounded-full shadow-premium font-display font-semibold landscape:px-3 landscape:py-1.5 landscape:text-sm"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					Photo {Math.min(photos.length + 1, 3)} of 3
				</motion.div>
				<Button
					variant="ghost"
					size="icon"
					className="glass-dark text-white hover:bg-white/20 w-10 h-10 landscape:w-8 landscape:h-8"
					onClick={handleCancel}
				>
					<X className="h-6 w-6 landscape:h-5 landscape:w-5" />
				</Button>
			</div>

			{/* Photo thumbnails */}
			{photos.length > 0 && (
				<div className="absolute top-20 left-4 right-4 z-30 flex gap-2 overflow-x-auto landscape:top-12">
					{photos.map((photo, index) => (
						<motion.div
							key={photo}
							variants={photoThumbnailVariants}
							initial="initial"
							animate="animate"
							className="relative shrink-0"
						>
							<div className="w-16 h-16 landscape:w-12 landscape:h-12 rounded-xl overflow-hidden shadow-premium-lg border-2 border-white/50">
								<img
									src={photo}
									alt={`Captured ${index + 1} of 3`}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -top-1 -right-1 w-5 h-5 landscape:w-4 landscape:h-4 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
								<svg
									className="w-3 h-3 landscape:w-2.5 landscape:h-2.5 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									role="img"
									aria-label="Checkmark"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
						</motion.div>
					))}
				</div>
			)}

			{/* Bottom controls - status and camera switch */}
			<div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center gap-3 landscape:bottom-2 landscape:gap-2">
				<AnimatePresence mode="wait">
					<motion.p
						key={statusText}
						className="glass-dark text-white text-base font-display font-semibold px-5 py-2.5 rounded-full shadow-premium landscape:text-sm landscape:px-4 landscape:py-2"
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
					className="glass-dark text-white hover:bg-white/20 w-11 h-11 landscape:w-9 landscape:h-9"
					onClick={switchCamera}
				>
					<SwitchCamera className="h-5 w-5 landscape:h-4 landscape:w-4" />
				</Button>
			</div>
		</div>
	);
}
