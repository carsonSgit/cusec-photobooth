"use client";

import { motion } from "framer-motion";
import { RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buttonVariants, pageVariants } from "@/lib/animations";
import { generatePhotoStrip } from "@/lib/canvas";
import { usePhotoboothStore } from "@/lib/store";

export function PhotoPreview() {
	const { photos, photoStrip, setPhotoStrip, setCurrentScreen, clearPhotos } =
		usePhotoboothStore();
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (photos.length === 3 && !photoStrip) {
			setIsGenerating(true);
			generatePhotoStrip(photos)
				.then((strip) => {
					setPhotoStrip(strip);
					setIsGenerating(false);
				})
				.catch((err) => {
					console.error("Error generating photo strip:", err);
					setError("Failed to generate photo strip. Please try again.");
					setIsGenerating(false);
				});
		}
	}, [photos, photoStrip, setPhotoStrip]);

	const handleRetake = () => {
		clearPhotos();
		setCurrentScreen("camera");
	};

	const handleSave = () => {
		setCurrentScreen("save");
	};

	if (isGenerating) {
		return (
			<motion.div
				className="min-h-screen bg-gradient-brand flex items-center justify-center p-4"
				variants={pageVariants}
				initial="initial"
				animate="animate"
			>
				<Card className="glass-strong border-0 shadow-premium-lg p-8 text-center">
					<div className="relative w-20 h-20 mx-auto mb-6">
						<motion.div
							className="absolute inset-0 rounded-full border-4 border-transparent border-t-cusec-red"
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						/>
					</div>
					<p className="text-lg font-display font-semibold text-white">
						Creating your photo strip...
					</p>
				</Card>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				className="min-h-screen bg-gradient-brand flex items-center justify-center p-4"
				variants={pageVariants}
				initial="initial"
				animate="animate"
			>
				<Card className="glass-strong border-0 shadow-premium-lg p-8 text-center max-w-md">
					<p className="text-lg text-cusec-red mb-4 font-display font-semibold">
						{error}
					</p>
					<Button onClick={handleRetake}>Try Again</Button>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="min-h-screen bg-gradient-brand flex flex-col items-center py-8 px-4 overflow-y-auto"
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		>
			<div className="max-w-2xl w-full">
				<motion.h2
					className="text-4xl font-display font-bold text-center text-white mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					Looking Great! 🌟
				</motion.h2>

				<Card className="glass-strong border-0 shadow-premium-lg p-4 mb-6">
					{photoStrip && (
						<motion.img
							src={photoStrip}
							alt="Your CUSEC 2026 memory strip"
							className="w-full h-auto rounded-xl"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
						/>
					)}
				</Card>

				<div className="flex gap-4 mb-4">
					<motion.div
						className="flex-1"
						variants={buttonVariants}
						whileHover="hover"
						whileTap="tap"
					>
						<Button
							variant="outline"
							size="lg"
							className="w-full bg-white/10 border-2 border-white text-white hover:bg-white hover:text-cusec-navy font-display font-semibold"
							onClick={handleRetake}
						>
							<RotateCcw className="mr-2 h-5 w-5" />
							Retake Photos
						</Button>
					</motion.div>
					<motion.div
						className="flex-1"
						variants={buttonVariants}
						whileHover="hover"
						whileTap="tap"
					>
						<Button
							size="lg"
							className="w-full bg-gradient-accent border-0 shadow-premium font-display font-semibold relative overflow-hidden group"
							onClick={handleSave}
						>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
							<Save className="mr-2 h-5 w-5 relative z-10" />
							<span className="relative z-10">Save & Share</span>
						</Button>
					</motion.div>
				</div>

				<motion.p
					className="text-center text-white/90 text-sm font-sans"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					Love your photos? Save them to your device or share via email!
				</motion.p>
			</div>
		</motion.div>
	);
}
