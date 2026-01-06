"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Smartphone } from "lucide-react";
import Image from "next/image";
import { CusecBackground } from "@/components/cusec-background";
import { Button } from "@/components/ui/button";
import { usePhotoboothStore } from "@/lib/store";
import type { Orientation } from "@/lib/store";

const cardVariants = {
	initial: { opacity: 0, y: 30, scale: 0.95 },
	animate: { opacity: 1, y: 0, scale: 1 },
	hover: { scale: 1.02, y: -4 },
	tap: { scale: 0.98 },
};

interface OrientationCardProps {
	orientation: Orientation;
	label: string;
	description: string;
	onClick: () => void;
	delay: number;
}

function PortraitCameraPreview() {
	return (
		<div className="relative flex items-center justify-center py-4">
			{/* Phone frame - portrait */}
			<div className="relative w-20 h-32 bg-gray-900 rounded-2xl border-4 border-gray-700 shadow-xl overflow-hidden">
				{/* Screen */}
				<div className="absolute inset-1 bg-gradient-to-br from-cusec-sky/40 to-cusec-navy/60 rounded-xl flex items-center justify-center">
					{/* Camera viewfinder indicator */}
					<div className="w-12 h-16 border-2 border-white/40 rounded-lg flex items-center justify-center">
						<motion.div
							className="w-8 h-10 border border-dashed border-white/60 rounded"
							animate={{ opacity: [0.4, 1, 0.4] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
					</div>
				</div>
				{/* Notch */}
				<div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gray-800 rounded-full" />
			</div>
			{/* Rotation indicator */}
			<div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
				<Smartphone className="w-5 h-5 text-white/60" />
			</div>
		</div>
	);
}

function LandscapeCameraPreview() {
	return (
		<div className="relative flex items-center justify-center py-4">
			{/* Phone frame - landscape (rotated) */}
			<div className="relative w-32 h-20 bg-gray-900 rounded-2xl border-4 border-gray-700 shadow-xl overflow-hidden">
				{/* Screen */}
				<div className="absolute inset-1 bg-gradient-to-br from-cusec-sky/40 to-cusec-navy/60 rounded-xl flex items-center justify-center">
					{/* Camera viewfinder indicator */}
					<div className="w-24 h-12 border-2 border-white/40 rounded-lg flex items-center justify-center">
						<motion.div
							className="w-16 h-8 border border-dashed border-white/60 rounded"
							animate={{ opacity: [0.4, 1, 0.4] }}
							transition={{ duration: 2, repeat: Infinity }}
						/>
					</div>
				</div>
				{/* Notch (on left side when landscape) */}
				<div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gray-800 rounded-full" />
			</div>
			{/* Rotation indicator */}
			<div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
				<Smartphone className="w-5 h-5 text-white/60 rotate-90" />
			</div>
		</div>
	);
}

function OrientationCard({
	orientation,
	label,
	description,
	onClick,
	delay,
}: OrientationCardProps) {
	return (
		<motion.button
			className="group relative w-full p-6 rounded-2xl glass-dark border border-white/10 hover:border-white/30 transition-colors cursor-pointer text-left"
			variants={cardVariants}
			initial="initial"
			animate="animate"
			whileHover="hover"
			whileTap="tap"
			transition={{ delay, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
			onClick={onClick}
		>
			{/* Glow effect on hover */}
			<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

			{/* Preview */}
			<div className="relative z-10 mb-4">
				{orientation === "portrait" ? (
					<PortraitCameraPreview />
				) : (
					<LandscapeCameraPreview />
				)}
			</div>

			{/* Label */}
			<div className="relative z-10 text-center">
				<h3 className="text-xl font-display font-bold text-white mb-1">
					{label}
				</h3>
				<p className="text-sm text-white/70 font-sans">{description}</p>
			</div>

			{/* Selection indicator */}
			<div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
				<svg
					className="w-4 h-4 text-white"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</div>
		</motion.button>
	);
}

export function OrientationSelection() {
	const { setCurrentScreen, setOrientation } = usePhotoboothStore();

	const handleSelect = (orientation: Orientation) => {
		setOrientation(orientation);
		setCurrentScreen("camera");
	};

	const handleBack = () => {
		setCurrentScreen("landing");
	};

	return (
		<motion.div
			className="min-h-screen relative overflow-y-auto flex flex-col items-center justify-center p-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<CusecBackground />

			<div className="relative z-10 w-full max-w-2xl">
				{/* Back button */}
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Button
						variant="ghost"
						className="text-white/80 hover:text-white hover:bg-white/10 gap-2"
						onClick={handleBack}
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>
				</motion.div>

				{/* Header */}
				<motion.div
					className="text-center mb-8"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<div className="w-16 h-16 mx-auto mb-4">
						<Image
							src="/logo.svg"
							alt="CUSEC Logo"
							width={64}
							height={64}
							priority
						/>
					</div>
					<h1 className="text-3xl font-display font-bold text-white mb-2">
						How do you want to shoot?
					</h1>
					<p className="text-white/80 font-sans">
						Choose how to hold your phone for the photos
					</p>
				</motion.div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<OrientationCard
						orientation="portrait"
						label="Portrait"
						description="Hold your phone upright"
						onClick={() => handleSelect("portrait")}
						delay={0.3}
					/>
					<OrientationCard
						orientation="landscape"
						label="Landscape"
						description="Hold your phone sideways"
						onClick={() => handleSelect("landscape")}
						delay={0.4}
					/>
				</div>

				{/* Hint */}
				<motion.p
					className="text-center text-white/50 text-sm mt-6 font-sans"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					Your photos will be captured in the orientation you choose
				</motion.p>
			</div>
		</motion.div>
	);
}
