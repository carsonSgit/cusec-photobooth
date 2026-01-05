"use client";

import { motion } from "framer-motion";
import { AnimatedCitySkyline } from "./animated-city-skyline";
import { NoiseOverlay } from "./noise-overlay";

export function CusecBackground() {
	return (
		<div className="absolute inset-0 overflow-hidden">
			<div className="absolute inset-0 bg-cusec-navy" />

			<motion.div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(circle at 20% 50%, rgba(65, 87, 140, 0.6) 0%, transparent 50%)",
				}}
				animate={{
					x: ["-5%", "5%", "-5%"],
					y: ["-3%", "3%", "-3%"],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<motion.div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(circle at 80% 50%, rgba(164, 11, 13, 0.2) 0%, transparent 50%)",
				}}
				animate={{
					x: ["5%", "-5%", "5%"],
					y: ["3%", "-3%", "3%"],
					scale: [1, 1.15, 1],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<motion.div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(circle at 50% 30%, rgba(65, 87, 140, 0.4) 0%, transparent 60%)",
				}}
				animate={{
					x: ["0%", "3%", "0%"],
					y: ["0%", "-5%", "0%"],
					scale: [1, 1.05, 1],
				}}
				transition={{
					duration: 22,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			<div className="absolute inset-0 bg-gradient-to-b from-cusec-navy/70 via-transparent to-cusec-navy/90" />

			<AnimatedCitySkyline />

			<motion.div
				className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10"
				animate={{
					opacity: [0.2, 0.3, 0.2],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Noise overlay - above background but behind card (z-index handled in component) */}
			<div className="absolute inset-0" style={{ zIndex: 1 }}>
				<NoiseOverlay />
			</div>
		</div>
	);
}
