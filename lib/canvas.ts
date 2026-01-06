import type { Orientation } from "./store";

export async function generatePhotoStrip(photos: string[], orientation: Orientation = "portrait"): Promise<string> {
	if (photos.length !== 3) {
		throw new Error("Exactly 3 photos are required");
	}

	// Wait for fonts to be loaded (especially Jost)
	await document.fonts.ready;

	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		if (!ctx) {
			reject(new Error("Could not get canvas context"));
			return;
		}

		// Thermal printer paper: 57mm wide at 300 DPI
		// 57mm = 57/25.4 * 300 ≈ 673 pixels
		const DPI = 300;
		const PAPER_WIDTH_MM = 57;
		const canvasWidth = Math.round((PAPER_WIDTH_MM / 25.4) * DPI);

		const headerHeight = 160;
		const footerHeight = 90;
		const photoGap = 20; // White gaps between photos
		const borderWidth = 1; // Thin black border
		const photoPaddingHorizontal = 30; // Horizontal padding for photos
		
		// Target aspect ratios based on orientation
		const targetAspectRatio = orientation === "landscape" ? 16 / 9 : 9 / 16;

		let loadedImages = 0;
		const photoImages: HTMLImageElement[] = [];
		let headerImage: HTMLImageElement | null = null;
		let footerImage: HTMLImageElement | null = null;

		const checkAllLoaded = () => {
			// Need 3 photos + header + footer = 5 images total
			if (loadedImages === 5) {
				calculateAndDraw();
			}
		};

		const loadImage = (
			src: string,
			onLoad: (img: HTMLImageElement) => void,
			onError: (error: Error) => void,
		) => {
			const img = new Image();
			img.onload = () => {
				onLoad(img);
				loadedImages++;
				checkAllLoaded();
			};
			img.onerror = () => {
				onError(new Error(`Failed to load image: ${src}`));
			};
			img.src = src;
		};

		const calculateAndDraw = () => {
			if (!headerImage || !footerImage) {
				reject(new Error("Header or footer image failed to load"));
				return;
			}

			const photoWidth = canvasWidth - photoPaddingHorizontal * 2;
			// Use the target aspect ratio for consistent photo heights
			// This ensures all photos have the same height regardless of minor variations
			const photoHeight = Math.round(photoWidth / targetAspectRatio);
			const photoHeights = photoImages.map(() => photoHeight);

			const totalPhotoHeight = photoHeights.reduce((sum, h) => sum + h, 0);
			const totalGaps = photoGap * 2;
			const canvasHeight =
				headerHeight + totalPhotoHeight + totalGaps + footerHeight;

			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			// Fill white background
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw border
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = borderWidth;
			ctx.strokeRect(
				borderWidth / 2,
				borderWidth / 2,
				canvas.width - borderWidth,
				canvas.height - borderWidth,
			);

			// Draw header with bear logo and text
			const headerPadding = 10;
			const bearLogoSize = headerHeight / 2;
			const bearLogoX = headerPadding + 20;
			const bearLogoY = headerPadding + 25;

			// Draw bear logo
			ctx.drawImage(
				headerImage,
				bearLogoX,
				bearLogoY,
				bearLogoSize,
				bearLogoSize,
			);

			// Draw conference text next to bear logo - wrap to exactly 2 lines
			const textX = bearLogoX + bearLogoSize + 40;
			const maxTextWidth = canvasWidth - textX - headerPadding;

			ctx.fillStyle = "#000000";
			ctx.font = "600 32px Jost, sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";

			// Text should wrap to exactly 2 lines
			const text = "Canadian University Software Engineering Conference";
			const words = text.split(" ");

			// Find the best split point for 2 lines
			let firstLine = "";
			let secondLine = "";
			let bestSplit = Math.ceil(words.length / 2);

			// Try to find a good split point
			for (
				let split = Math.floor(words.length / 2) - 1;
				split <= Math.ceil(words.length / 2) + 1;
				split++
			) {
				if (split <= 0 || split >= words.length) continue;

				const testFirstLine = words.slice(0, split).join(" ");
				const testSecondLine = words.slice(split).join(" ");
				const firstWidth = ctx.measureText(testFirstLine).width;
				const secondWidth = ctx.measureText(testSecondLine).width;

				if (firstWidth <= maxTextWidth && secondWidth <= maxTextWidth) {
					firstLine = testFirstLine;
					secondLine = testSecondLine;
					break;
				}
			}

			// If no perfect split found, use middle split
			if (!firstLine) {
				bestSplit = Math.ceil(words.length / 2);
				firstLine = words.slice(0, bestSplit).join(" ");
				secondLine = words.slice(bestSplit).join(" ");
			}

			const lineHeight = 40;
			// Center the two lines vertically in the header
			const totalTextHeight = lineHeight * 2;
			const textStartY = (headerHeight - totalTextHeight) / 2;
			ctx.fillText(firstLine, textX, textStartY);
			ctx.fillText(secondLine, textX, textStartY + lineHeight);

			// Draw photos with horizontal padding (using cover-fit to handle aspect ratio differences)
			let currentY = headerHeight;
			photoImages.forEach((img, index) => {
				const targetHeight = photoHeights[index];
				
				// Calculate cover-fit dimensions
				const imgAspect = img.width / img.height;
				const targetAspect = photoWidth / targetHeight;
				
				let srcX = 0;
				let srcY = 0;
				let srcWidth = img.width;
				let srcHeight = img.height;
				
				if (imgAspect > targetAspect) {
					// Image is wider than target - crop sides
					srcWidth = img.height * targetAspect;
					srcX = (img.width - srcWidth) / 2;
				} else if (imgAspect < targetAspect) {
					// Image is taller than target - crop top/bottom
					srcHeight = img.width / targetAspect;
					srcY = (img.height - srcHeight) / 2;
				}
				
				ctx.drawImage(
					img,
					srcX, srcY, srcWidth, srcHeight,  // Source rectangle (cropped)
					photoPaddingHorizontal, currentY, photoWidth, targetHeight,  // Destination rectangle
				);
				currentY += targetHeight + photoGap;
			});

			// Draw footer with CUSEC2026.png - centered
			const footerY = canvasHeight - footerHeight;
			const footerPadding = 10;
			const footerImageWidth = canvasWidth - footerPadding * 2;
			const footerImageHeight = footerHeight - footerPadding * 6;
			const footerAspectRatio = footerImage.height / footerImage.width;

			// Scale footer to fit within available space while maintaining aspect ratio
			let drawFooterWidth = footerImageWidth;
			let drawFooterHeight = footerImageWidth * footerAspectRatio;

			// Scale footer to fit height if needed
			if (drawFooterHeight > footerImageHeight) {
				drawFooterHeight = footerImageHeight;
				drawFooterWidth = footerImageHeight / footerAspectRatio;
			}

			const footerX = (canvasWidth - drawFooterWidth) / 2;
			const footerDrawY = footerY + (footerHeight - drawFooterHeight) / 2;

			ctx.drawImage(
				footerImage,
				footerX,
				footerDrawY,
				drawFooterWidth,
				drawFooterHeight,
			);

			resolve(canvas.toDataURL("image/png"));
		};

		// Load header image (CUBEAR.png)
		loadImage(
			"/CUBEAR.png",
			(img) => {
				headerImage = img;
			},
			(err) => reject(err),
		);

		// Load footer image (CUSEC2026.png)
		loadImage(
			"/CUSEC2026.png",
			(img) => {
				footerImage = img;
			},
			(err) => reject(err),
		);

		// Load photo images
		photos.forEach((photoData, index) => {
			loadImage(
				photoData,
				(img) => {
					photoImages[index] = img;
				},
				() => reject(new Error(`Failed to load photo ${index + 1}`)),
			);
		});
	});
}
