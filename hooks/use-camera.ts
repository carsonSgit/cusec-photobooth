import { useCallback, useRef, useState } from "react";
import type { Orientation } from "@/lib/store";

export function useCamera(orientation: Orientation) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

	const getVideoConstraints = useCallback((currentFacingMode: "user" | "environment") => {
		// Use the user-selected orientation instead of auto-detecting
		const isLandscape = orientation === "landscape";

		return {
			facingMode: currentFacingMode,
			width: { ideal: isLandscape ? 1920 : 1080, min: 640 },
			height: { ideal: isLandscape ? 1080 : 1920, min: 480 },
		};
	}, [orientation]);

	const startCamera = useCallback(async () => {
		// Cancel any previous camera start attempt
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		try {
			setError(null);
			const stream = await navigator.mediaDevices.getUserMedia({
				video: getVideoConstraints(facingMode),
				audio: false,
			});

			// Check if this request was aborted while waiting for camera
			if (abortController.signal.aborted) {
				for (const track of stream.getTracks()) {
					track.stop();
				}
				return;
			}

			streamRef.current = stream;

			if (videoRef.current) {
				videoRef.current.srcObject = stream;

				try {
					await videoRef.current.play();
					// Only set streaming if not aborted
					if (!abortController.signal.aborted) {
						setIsStreaming(true);
					}
				} catch (playError) {
					// AbortError is expected when component unmounts or camera restarts
					if (playError instanceof Error && playError.name === "AbortError") {
						console.log(
							"Camera play() aborted - this is expected during cleanup",
						);
						return;
					}
					throw playError;
				}
			}
		} catch (err) {
			// Don't set error state if this was an intentional abort
			if (abortController.signal.aborted) {
				return;
			}
			console.error("Error accessing camera:", err);
			setError("Failed to access camera. Please grant camera permissions.");
			setIsStreaming(false);
		}
	}, [facingMode, getVideoConstraints]);

	const stopCamera = useCallback(() => {
		// Abort any pending camera start
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
		setIsStreaming(false);
	}, []);

	const switchCamera = useCallback(() => {
		stopCamera();
		setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
	}, [stopCamera]);

	const capturePhoto = useCallback((): string | null => {
		if (!videoRef.current || !isStreaming) return null;

		const video = videoRef.current;
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;
		
		// Determine if video is landscape or portrait based on actual dimensions
		const videoIsLandscape = videoWidth > videoHeight;
		const wantLandscape = orientation === "landscape";
		
		// Calculate the target crop dimensions based on user's orientation selection
		let cropWidth: number;
		let cropHeight: number;
		let cropX: number;
		let cropY: number;
		
		if (wantLandscape) {
			// User wants landscape (16:9 aspect ratio)
			const targetAspect = 16 / 9;
			if (videoIsLandscape) {
				// Video is already landscape - crop to 16:9
				const currentAspect = videoWidth / videoHeight;
				if (currentAspect > targetAspect) {
					// Video is wider than 16:9, crop width
					cropHeight = videoHeight;
					cropWidth = Math.round(videoHeight * targetAspect);
				} else {
					// Video is taller than 16:9, crop height
					cropWidth = videoWidth;
					cropHeight = Math.round(videoWidth / targetAspect);
				}
			} else {
				// Video is portrait but user wants landscape - crop center to 16:9
				// Use full width and calculate height for 16:9
				cropWidth = videoWidth;
				cropHeight = Math.round(videoWidth / targetAspect);
				// Make sure we don't exceed video height
				if (cropHeight > videoHeight) {
					cropHeight = videoHeight;
					cropWidth = Math.round(videoHeight * targetAspect);
				}
			}
		} else {
			// User wants portrait (9:16 aspect ratio)
			const targetAspect = 9 / 16;
			if (!videoIsLandscape) {
				// Video is already portrait - crop to 9:16
				const currentAspect = videoWidth / videoHeight;
				if (currentAspect > targetAspect) {
					// Video is wider than 9:16, crop width
					cropHeight = videoHeight;
					cropWidth = Math.round(videoHeight * targetAspect);
				} else {
					// Video is taller than 9:16, crop height
					cropWidth = videoWidth;
					cropHeight = Math.round(videoWidth / targetAspect);
				}
			} else {
				// Video is landscape but user wants portrait - crop center to 9:16
				// Use full height and calculate width for 9:16
				cropHeight = videoHeight;
				cropWidth = Math.round(videoHeight * targetAspect);
				// Make sure we don't exceed video width
				if (cropWidth > videoWidth) {
					cropWidth = videoWidth;
					cropHeight = Math.round(videoWidth / targetAspect);
				}
			}
		}
		
		// Center the crop
		cropX = Math.round((videoWidth - cropWidth) / 2);
		cropY = Math.round((videoHeight - cropHeight) / 2);

		const canvas = document.createElement("canvas");
		canvas.width = cropWidth;
		canvas.height = cropHeight;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		// Flip horizontally if using front camera
		if (facingMode === "user") {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}

		// Draw the cropped region
		ctx.drawImage(
			video,
			cropX, cropY, cropWidth, cropHeight,  // Source rectangle
			0, 0, cropWidth, cropHeight            // Destination rectangle
		);
		
		return canvas.toDataURL("image/jpeg", 0.9);
	}, [isStreaming, facingMode, orientation]);

	return {
		videoRef,
		isStreaming,
		error,
		facingMode,
		startCamera,
		stopCamera,
		switchCamera,
		capturePhoto,
	};
}
