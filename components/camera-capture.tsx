"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SwitchCamera, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
	const [isCountingDown, setIsCountingDown] = useState(false);
	const [flash, setFlash] = useState(false);
	const [statusText, setStatusText] = useState("Get ready!");

	// Generate session ID on mount
	useEffect(() => {
		if (!sessionId) {
			const newSessionId = generateSessionId();
			setSessionId(newSessionId);
			console.log("[Session] Generated session ID:", newSessionId);
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
		<div className="h-screen-safe bg-black relative overflow-hidden overflow-locked landscape:flex landscape:items-center landscape:justify-center">
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

			<div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start landscape:top-2 landscape:left-2 landscape:right-2">
				<motion.div
					className="glass-dark text-white px-4 py-2 rounded-full shadow-premium font-display font-semibold"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					Photo {Math.min(photos.length + 1, 3)} of 3
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
				<div className="absolute top-20 left-4 right-4 z-30 flex gap-2 overflow-x-auto landscape:top-2 landscape:left-20 landscape:right-auto landscape:flex-col landscape:max-h-[calc(100vh-8rem)]">
					{photos.map((photo, index) => (
						<motion.div
							key={photo}
							variants={photoThumbnailVariants}
							initial="initial"
							animate="animate"
							className="relative shrink-0"
						>
							<div className="w-20 h-20 rounded-xl overflow-hidden shadow-premium-lg border-2 border-white/50 landscape:w-16 landscape:h-16">
								<img
									src={photo}
									alt={`Captured ${index + 1} of 3`}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
								<svg
									className="w-4 h-4 text-white"
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

			<div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center gap-4 landscape:bottom-2 landscape:left-auto landscape:right-2">
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
