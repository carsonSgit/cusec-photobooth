"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CusecBackground } from "@/components/cusec-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { pageVariants } from "@/lib/animations";
import { generatePhotoStrip } from "@/lib/canvas";
import { usePhotoboothStore } from "@/lib/store";
import { uploadPhotoSession, updateSessionEmail } from "@/lib/supabase";

export function SaveOptions() {
	const {
		photos,
		photoStrip,
		setPhotoStrip,
		reset,
		sessionId,
		uploadStatus,
		setUploadStatus,
	} = usePhotoboothStore();
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
		"idle",
	);
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloaded, setDownloaded] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	// Ref to prevent duplicate uploads (React Strict Mode double-render)
	const uploadInitiatedRef = useRef(false);

	const orientation = usePhotoboothStore((state) => state.orientation);

	useEffect(() => {
		if (photos.length === 3 && !photoStrip) {
			setIsGenerating(true);
			generatePhotoStrip(photos, orientation)
				.then((strip) => {
					setPhotoStrip(strip);
					setIsGenerating(false);

					// Trigger background upload to Supabase (with duplicate prevention)
					if (sessionId && uploadStatus === "idle" && !uploadInitiatedRef.current) {
						uploadInitiatedRef.current = true;
						setUploadStatus("uploading");
						uploadPhotoSession({
							sessionId,
							photos,
							photoStrip: strip,
							orientation,
						})
							.then((result) => {
								if (result.success) {
									setUploadStatus("success");
								} else {
									setUploadStatus("error");
								}
							})
							.catch((err) => {
								setUploadStatus("error");
								console.error("[Upload] Error:", err);
							});
					}
				})
				.catch((err) => {
					console.error("Error generating photo strip:", err);
					setError("Failed to generate photo strip. Please try again.");
					setIsGenerating(false);
				});
		}
	}, [photos, photoStrip, setPhotoStrip, orientation, sessionId, uploadStatus, setUploadStatus]);

	const handleDownload = async () => {
		if (!photoStrip) return;

		setIsDownloading(true);
		try {
			const isIOS =
				/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as Window & { MSStream?: unknown }).MSStream;

			if (isIOS && navigator.share) {
				const response = await fetch(photoStrip);
				const blob = await response.blob();
				const file = new File(
					[blob],
					`cusec-2026-photobooth-${Date.now()}.png`,
					{ type: "image/png" },
				);

				await navigator.share({
					files: [file],
					title: "CUSEC 2026 Photo Booth",
					text: "Check out my photo from CUSEC 2026! #CUSEC2026",
				});
			} else {
				const link = document.createElement("a");
				link.href = photoStrip;
				link.download = `cusec-2026-photobooth-${Date.now()}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			setDownloaded(true);
		} catch (error) {
			console.error("Download failed:", error);
			try {
				const link = document.createElement("a");
				link.href = photoStrip;
				link.download = `cusec-2026-photobooth-${Date.now()}.png`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				setDownloaded(true);
			} catch (fallbackError) {
				console.error("Fallback download also failed:", fallbackError);
			}
		} finally {
			setIsDownloading(false);
		}
	};

	const handleEmailSend = async () => {
		if (!email || !photoStrip) return;

		setIsSending(true);
		setSendStatus("idle");

		try {
			const response = await fetch("/api/send-email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, photoStrip }),
			});

			if (response.ok) {
				setSendStatus("success");
				setEmail("");

				// Update email in database if session was uploaded
				if (sessionId && uploadStatus === "success") {
					await updateSessionEmail(sessionId, email);
				}
			} else {
				setSendStatus("error");
			}
		} catch (error) {
			console.error("Email send failed:", error);
			setSendStatus("error");
		} finally {
			setIsSending(false);
		}
	};

	const handleStartOver = () => {
		reset();
	};

	if (isGenerating) {
		return (
			<motion.div
				className="min-h-screen bg-white relative overflow-y-auto flex items-center justify-center p-4"
				variants={pageVariants}
				initial="initial"
				animate="animate"
			>
				<CusecBackground />
				<Card className="glass-strong border-0 shadow-premium-lg p-8 text-center relative z-10">
					<div className="relative w-20 h-20 mx-auto mb-6">
						<motion.div
							className="absolute inset-0 border-4 border-transparent border-t-white"
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
				className="min-h-screen bg-white relative overflow-y-auto flex items-center justify-center p-4"
				variants={pageVariants}
				initial="initial"
				animate="animate"
			>
				<CusecBackground />
				<Card className="glass-strong border-0 shadow-premium-lg p-8 text-center max-w-md relative z-10">
					<p className="text-lg text-red-300 mb-4 font-display font-semibold">
						{error}
					</p>
					<Button
						onClick={handleStartOver}
						className="bg-white text-cusec-navy hover:bg-white/90"
					>
						Try Again
					</Button>
				</Card>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="min-h-screen bg-white relative overflow-y-auto"
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
		>
			<CusecBackground />
			<div className="relative z-10 flex flex-col lg:flex-row h-full">
				<div className="lg:w-2/5 flex items-center justify-center p-4 lg:p-6">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.4 }}
						className="relative h-full flex items-center"
					>
						{photoStrip && (
							<img
								src={photoStrip}
								alt="Your CUSEC 2026 memory strip"
								className="max-h-[calc(100vh-3rem)] w-auto shadow-2xl"
							/>
						)}
					</motion.div>
				</div>

				<div className="lg:w-3/5 flex items-center justify-center p-4 lg:p-8">
					<div className="w-full max-w-md space-y-4 glass-dark p-8">
						<div className="text-center lg:text-left">
							<h1 className="text-3xl lg:text-4xl font-display font-bold text-white mb-2">
								Looking good!
							</h1>
							<p className="text-white/80 text-base font-sans">
								Save your memories or share them with friends
							</p>
						</div>

						<Button
							size="lg"
							className={`w-full font-display font-semibold text-base h-12 transition-colors ${
								downloaded
									? "bg-emerald-500 hover:bg-emerald-600"
									: "bg-white text-cusec-navy hover:bg-white/90"
							}`}
							onClick={handleDownload}
							disabled={isDownloading}
						>
							{isDownloading ? (
								"Downloading..."
							) : downloaded ? (
								<>
									<CheckCircle2 className="mr-2 h-5 w-5" />
									Downloaded!
								</>
							) : (
								<>
									<Download className="mr-2 h-5 w-5" />
									Download Photo Strip
								</>
							)}
						</Button>

						<div className="space-y-2 pt-3 border-t border-white/20">
							<p className="text-white/80 text-sm font-sans">
								Or send to your email:
							</p>
							<div className="flex gap-2">
								<Input
									type="email"
									placeholder="your.email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isSending || sendStatus === "success"}
									className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20 font-sans"
								/>
								<Button
									className={`h-11 px-5 font-display font-semibold transition-colors ${
										sendStatus === "success"
											? "bg-emerald-500 hover:bg-emerald-600"
											: "bg-white/20 hover:bg-white/30 text-white"
									}`}
									onClick={handleEmailSend}
									disabled={!email || isSending || sendStatus === "success"}
								>
									{isSending
										? "Sending..."
										: sendStatus === "success"
											? "Sent!"
											: "Send"}
								</Button>
							</div>
							{sendStatus === "error" && (
								<p className="text-red-300 text-sm">
									Failed to send. Please try downloading instead.
								</p>
							)}
						</div>

						<div className="pt-3 space-y-3">
							<Button
								variant="ghost"
								className="w-full h-10 text-white/70 hover:text-white hover:bg-white/10 font-sans text-sm"
								onClick={handleStartOver}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Take New Photos
							</Button>

							<p className="text-center text-white/50 text-xs font-sans">
								Share on social with{" "}
								<span className="font-semibold">#CUSEC2026</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
