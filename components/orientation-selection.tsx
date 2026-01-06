"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

const stripVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
};

interface OrientationCardProps {
	orientation: Orientation;
	label: string;
	description: string;
	isSelected?: boolean;
	onClick: () => void;
	delay: number;
}

function PortraitStripPreview() {
	return (
		<div className="relative w-full aspect-[9/16] max-w-[120px] mx-auto">
			{/* Strip container */}
			<div className="absolute inset-0 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
				{/* Header */}
				<div className="h-[15%] bg-white flex items-center justify-center px-2 border-b border-gray-100">
					<div className="flex items-center gap-1">
						<div className="w-4 h-4 rounded-full bg-cusec-navy/20" />
						<div className="text-[6px] font-bold text-cusec-navy leading-tight">
							CUSEC
						</div>
					</div>
				</div>

				{/* Photos */}
				<div className="h-[70%] flex flex-col gap-[2px] p-1">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="flex-1 bg-gradient-to-br from-cusec-sky/30 to-cusec-navy/30 rounded-sm flex items-center justify-center"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3 + i * 0.1 }}
						>
							<div className="w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center">
								<span className="text-[8px] text-white font-bold">{i + 1}</span>
							</div>
						</motion.div>
					))}
				</div>

				{/* Footer */}
				<div className="h-[15%] bg-white flex items-center justify-center border-t border-gray-100">
					<div className="text-[5px] font-semibold text-cusec-navy tracking-wider">
						CUSEC 2026
					</div>
				</div>
			</div>
		</div>
	);
}

function LandscapeStripPreview() {
	return (
		<div className="relative w-full aspect-[16/9] max-w-[200px] mx-auto">
			{/* Strip container */}
			<div className="absolute inset-0 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
				{/* Header */}
				<div className="h-[20%] bg-white flex items-center px-3 border-b border-gray-100">
					<div className="flex items-center gap-1">
						<div className="w-3 h-3 rounded-full bg-cusec-navy/20" />
						<div className="text-[5px] font-bold text-cusec-navy">
							CUSEC 2026
						</div>
					</div>
				</div>

				{/* Photos row */}
				<div className="h-[80%] flex gap-[2px] p-1">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className="flex-1 bg-gradient-to-br from-cusec-sky/30 to-cusec-navy/30 rounded-sm flex items-center justify-center"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3 + i * 0.1 }}
						>
							<div className="w-5 h-5 rounded-full border-2 border-white/50 flex items-center justify-center">
								<span className="text-[7px] text-white font-bold">{i + 1}</span>
							</div>
						</motion.div>
					))}
				</div>
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
			<motion.div
				className="relative z-10 mb-4"
				variants={stripVariants}
				initial="initial"
				animate="animate"
				transition={{ delay: delay + 0.2 }}
			>
				{orientation === "portrait" ? (
					<PortraitStripPreview />
				) : (
					<LandscapeStripPreview />
				)}
			</motion.div>

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
						Choose Your Style
					</h1>
					<p className="text-white/80 font-sans">
						Select how you want your photostrip to look
					</p>
				</motion.div>

				{/* Cards grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<OrientationCard
						orientation="portrait"
						label="Portrait"
						description="Classic vertical strip"
						onClick={() => handleSelect("portrait")}
						delay={0.3}
					/>
					<OrientationCard
						orientation="landscape"
						label="Landscape"
						description="Wide horizontal strip"
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
					Tip: Portrait works great for printing, Landscape for sharing
				</motion.p>
			</div>
		</motion.div>
	);
}
