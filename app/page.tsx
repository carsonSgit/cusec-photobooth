"use client";

import { AnimatePresence } from "framer-motion";
import { CameraCapture } from "@/components/camera-capture";
import { LandingScreen } from "@/components/landing-screen";
import { PhotoPreview } from "@/components/photo-preview";
import { SaveOptions } from "@/components/save-options";
import { usePhotoboothStore } from "@/lib/store";

export default function Home() {
	const currentScreen = usePhotoboothStore((state) => state.currentScreen);

	return (
		<main className="min-h-screen bg-cusec-navy">
			<AnimatePresence mode="wait">
				{currentScreen === "landing" && <LandingScreen key="landing" />}
				{currentScreen === "camera" && <CameraCapture key="camera" />}
				{currentScreen === "preview" && <PhotoPreview key="preview" />}
				{currentScreen === "save" && <SaveOptions key="save" />}
			</AnimatePresence>
		</main>
	);
}
