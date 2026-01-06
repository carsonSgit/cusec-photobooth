import { useCallback, useRef, useState } from "react";

export function useCamera() {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const orientationQueryRef = useRef<MediaQueryList | null>(null);
	const orientationHandlerRef = useRef<(() => void) | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

	const getVideoConstraints = useCallback((currentFacingMode: "user" | "environment") => {
		const isLandscape = window.matchMedia("(orientation: landscape)").matches;

		// Request high resolution but don't force aspect ratio
		// Let the camera use its native ratio to minimize cropping on various device screens
		return {
			facingMode: currentFacingMode,
			width: { ideal: isLandscape ? 1920 : 1080, min: 640 },
			height: { ideal: isLandscape ? 1080 : 1920, min: 480 },
		};
	}, []);

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

						// Set up orientation change listener
						if (!orientationQueryRef.current) {
							const orientationQuery = window.matchMedia("(orientation: landscape)");
							const handleOrientationChange = () => {
								stopCamera();
								setTimeout(() => {
									startCamera();
								}, 100);
							};

							// Store handler reference for proper cleanup
							orientationHandlerRef.current = handleOrientationChange;
							orientationQuery.addEventListener("change", handleOrientationChange);
							orientationQueryRef.current = orientationQuery;
						}
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

		// Clean up orientation listener
		if (orientationQueryRef.current && orientationHandlerRef.current) {
			orientationQueryRef.current.removeEventListener("change", orientationHandlerRef.current);
			orientationQueryRef.current = null;
			orientationHandlerRef.current = null;
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
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext("2d");
		if (!ctx) return null;

		// Flip horizontally if using front camera
		if (facingMode === "user") {
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
		}

		ctx.drawImage(video, 0, 0);
		return canvas.toDataURL("image/jpeg", 0.9);
	}, [isStreaming, facingMode]);

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
