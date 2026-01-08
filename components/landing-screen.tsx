"use client";

import { motion } from "framer-motion";
import { Camera, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { CusecBackground } from "@/components/cusec-background";
import { Button } from "@/components/ui/button";
import { usePhotoboothStore } from "@/lib/store";

export function LandingScreen() {
	const setCurrentScreen = usePhotoboothStore(
		(state) => state.setCurrentScreen,
	);

	return (
		<div className="min-h-screen relative overflow-y-auto flex flex-col items-center justify-center p-4">
			<CusecBackground />

			<div className="relative z-10 max-w-md max-lg:landscape:max-w-3xl w-full">
				<div className="glass-dark p-8 max-lg:landscape:p-4 text-center">
					<div className="w-32 h-32 max-lg:landscape:w-20 max-lg:landscape:h-20 mx-auto mb-4 max-lg:landscape:mb-2 relative">
						<div className="w-full h-full p-1">
							<motion.div
								className="w-full h-full flex items-center justify-center"
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								transition={{ duration: 0.4 }}
							>
								<Image
									src="/logo.svg"
									alt="CUSEC Logo"
									width={100}
									height={100}
									priority
								/>
							</motion.div>
						</div>
					</div>

					<h1 className="text-4xl max-lg:landscape:text-2xl font-bold text-white mb-2 max-lg:landscape:mb-1 font-display">
						Photobooth
					</h1>
					<p className="text-lg max-lg:landscape:text-base text-white/90 mb-6 max-lg:landscape:mb-3 font-sans">
						Capture your CUSEC 2026 memories
					</p>

					<div>
						<Button
							size="lg"
							className="w-full mb-6 max-lg:landscape:mb-3 text-lg max-lg:landscape:text-base h-14 max-lg:landscape:h-10 bg-white text-cusec-navy font-display font-semibold hover:bg-white/90"
							onClick={() => setCurrentScreen("selection")}
						>
							Take Photos
						</Button>
					</div>

					<div className="space-y-4 max-lg:landscape:space-y-2 text-left">
						<div className="border-t border-white/20 pt-4 max-lg:landscape:pt-2">
							<p className="text-sm max-lg:landscape:text-xs text-white/80 mb-4 max-lg:landscape:mb-2 font-display font-medium">
								What you'll get:
							</p>
							<ul className="space-y-2 max-lg:landscape:space-y-1 max-lg:landscape:flex max-lg:landscape:flex-wrap max-lg:landscape:gap-x-4 max-lg:landscape:gap-y-1">
								{[
									{ icon: Camera, text: "3 awesome photos" },
									{ icon: Download, text: "Download to your device" },
									{ icon: Share2, text: "Share via email" },
								].map((item) => (
								<li key={item.text} className="flex items-center gap-3 max-lg:landscape:gap-2">
									<div className="w-8 h-8 max-lg:landscape:w-6 max-lg:landscape:h-6 bg-white/10 flex items-center justify-center backdrop-blur-sm">
										<item.icon className="h-4 w-4 max-lg:landscape:h-3 max-lg:landscape:w-3 text-white" />
									</div>
									<span className="text-sm max-lg:landscape:text-xs font-sans text-white/90">
											{item.text}
										</span>
									</li>
								))}
							</ul>
						</div>

						<div className="border-t border-white/20 pt-4 max-lg:landscape:pt-2 text-center">
							<p className="text-sm max-lg:landscape:text-xs font-semibold text-white font-display">
								CUSEC 2026 - 25th Anniversary
							</p>
							<p className="text-xs text-white/70 mt-1 max-lg:landscape:mt-0 font-sans">
								January 8-10, 2026 • Montreal, Canada
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
