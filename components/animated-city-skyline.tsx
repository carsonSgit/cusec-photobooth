"use client";

import { useEffect, useState } from "react";

export function AnimatedCitySkyline() {
	const [lights, setLights] = useState<
		Array<{ x: number; y: number; opacity: number; delay: number }>
	>([]);

	useEffect(() => {
		// Building definitions matching the SVG path geometry exactly
		// Extracted from: M0 475.514H50.408V220.677H81.7299V190.208H113.052V220.677H138.846H164.641V190.208H195.963V220.677H227.285V409.035H277.695V21.2401H364.548V471.359H391.264V100.184H490.757V490.748H531.297V208.451H564.46V162.749H683.295V204.296L714.517 206.827V490.748H784.328V0H891.191V406.259H974.714V480.126L1058.85 353.63L1146.68 485.668V169.89H1256V490.748H1345V564H0V475.514Z
		const buildings = [
			// Building 1: M0 475.514H50.408V220.677
			{ x: 0, xEnd: 50.408, yTop: 220.677, yBottom: 475.514 },
			// Building 2: H81.7299V190.208
			{ x: 50.408, xEnd: 81.73, yTop: 190.208, yBottom: 220.677 },
			// Building 3: H113.052V220.677
			{ x: 81.73, xEnd: 113.052, yTop: 190.208, yBottom: 220.677 },
			// Building 4: H138.846H164.641V190.208 (flat section at 220.677, then up)
			{ x: 113.052, xEnd: 138.846, yTop: 220.677, yBottom: 220.677 }, // Skip zero height
			{ x: 138.846, xEnd: 164.641, yTop: 190.208, yBottom: 220.677 },
			// Building 5: H195.963V220.677
			{ x: 164.641, xEnd: 195.963, yTop: 190.208, yBottom: 220.677 },
			// Building 6: H227.285V409.035
			{ x: 195.963, xEnd: 227.285, yTop: 220.677, yBottom: 220.677 }, // Skip zero height
			{ x: 227.285, xEnd: 277.695, yTop: 220.677, yBottom: 409.035 },
			// Building 7: H364.548V21.2401 (tall building)
			{ x: 277.695, xEnd: 364.548, yTop: 21.24, yBottom: 409.035 },
			// Building 8: H391.264V471.359
			{ x: 364.548, xEnd: 391.264, yTop: 21.24, yBottom: 471.359 },
			// Building 9: H490.757V100.184
			{ x: 391.264, xEnd: 490.757, yTop: 100.184, yBottom: 471.359 },
			// Building 10: H531.297V490.748
			{ x: 490.757, xEnd: 531.297, yTop: 100.184, yBottom: 490.748 },
			// Building 11: H564.46V208.451
			{ x: 531.297, xEnd: 564.46, yTop: 162.749, yBottom: 208.451 },
			// Building 12: H683.295V204.296
			{ x: 564.46, xEnd: 683.295, yTop: 162.749, yBottom: 204.296 },
			// Building 13: L714.517 206.827V490.748 (slanted top, use min y for top)
			{ x: 683.295, xEnd: 714.517, yTop: 204.296, yBottom: 206.827 }, // Skip very small
			{ x: 714.517, xEnd: 784.328, yTop: 206.827, yBottom: 490.748 },
			// Building 14: H891.191V0 (tall building)
			{ x: 784.328, xEnd: 891.191, yTop: 0, yBottom: 406.259 },
			// Building 15: H974.714V480.126 (slanted, use bottom y)
			{ x: 891.191, xEnd: 974.714, yTop: 406.259, yBottom: 480.126 },
			// Building 16: L1058.85 353.63 (slanted)
			{ x: 974.714, xEnd: 1058.85, yTop: 353.63, yBottom: 480.126 },
			// Building 17: L1146.68 485.668 (slanted)
			{ x: 1058.85, xEnd: 1146.68, yTop: 353.63, yBottom: 485.668 },
			// Building 18: H1256V169.89
			{ x: 1146.68, xEnd: 1256, yTop: 169.89, yBottom: 485.668 },
			// Building 19: H1345V490.748
			{ x: 1256, xEnd: 1345, yTop: 169.89, yBottom: 490.748 },
		];

		const newLights = buildings.flatMap((building) => {
			const width = building.xEnd - building.x;
			const height = building.yBottom - building.yTop;

			// Only skip buildings with zero or negative dimensions
			if (height <= 0 || width <= 0) return [];

			// Adjust window size based on building size for better fit
			const windowSize = Math.min(16, Math.max(8, width / 4));
			const windowGap = Math.max(4, windowSize * 0.4);
			const margin = Math.max(4, Math.min(8, width * 0.1));

			const availableWidth = width - 2 * margin;
			const availableHeight = height - 2 * margin;

			// Ensure we have space for at least one window
			if (availableWidth < windowSize || availableHeight < windowSize) {
				// For very small buildings, just add a single centered light
				if (width > 5 && height > 5) {
					return [
						{
							x: building.x + width / 2,
							y: building.yTop + height / 2,
							opacity: Math.random() * 0.3 + 0.5,
							delay: Math.random() * 3,
						},
					];
				}
				return [];
			}

			const numCols = Math.max(
				1,
				Math.floor((availableWidth + windowGap) / (windowSize + windowGap)),
			);
			const numRows = Math.max(
				1,
				Math.floor((availableHeight + windowGap) / (windowSize + windowGap)),
			);

			const totalWidth = numCols * windowSize + (numCols - 1) * windowGap;
			const totalHeight = numRows * windowSize + (numRows - 1) * windowGap;

			const offsetX = building.x + margin + (availableWidth - totalWidth) / 2;
			const offsetY =
				building.yTop + margin + (availableHeight - totalHeight) / 2;

			const lights: Array<{
				x: number;
				y: number;
				opacity: number;
				delay: number;
			}> = [];

			// Create lights in a grid pattern (windows)
			for (let row = 0; row < numRows; row++) {
				for (let col = 0; col < numCols; col++) {
					const x = offsetX + col * (windowSize + windowGap) + windowSize / 2;
					const y = offsetY + row * (windowSize + windowGap) + windowSize / 2;

					// Verify the light is within the building bounds
					if (
						x >= building.x + margin &&
						x <= building.xEnd - margin &&
						y >= building.yTop + margin &&
						y <= building.yBottom - margin
					) {
						lights.push({
							x,
							y,
							opacity: Math.random() * 0.3 + 0.5,
							delay: Math.random() * 3,
						});
					}
				}
			}

			return lights;
		});

		setLights(newLights);
	}, []);

	return (
		<div className="absolute bottom-0 left-0 right-0 h-[40%] min-h-[250px]">
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 1345 564"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				preserveAspectRatio="xMaxYMax meet"
				className="w-full h-full"
				role="img"
				aria-label="Montreal city skyline"
			>
				<defs>
					<clipPath id="building-clip">
						<path d="M0 475.514H50.408V220.677H81.7299V190.208H113.052V220.677H138.846H164.641V190.208H195.963V220.677H227.285V409.035H277.695V21.2401H364.548V471.359H391.264V100.184H490.757V490.748H531.297V208.451H564.46V162.749H683.295V204.296L714.517 206.827V490.748H784.328V0H891.191V406.259H974.714V480.126L1058.85 353.63L1146.68 485.668V169.89H1256V490.748H1345V564H0V475.514Z" />
					</clipPath>

					{/* Building gradient for depth */}
					<linearGradient
						id="building-gradient"
						x1="0%"
						y1="0%"
						x2="0%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#0B044D" stopOpacity="1" />
						<stop offset="50%" stopColor="#0D0555" stopOpacity="1" />
						<stop offset="100%" stopColor="#05022A" stopOpacity="1" />
					</linearGradient>

					{/* Noise pattern for texture - creates subtle grain */}
					<pattern
						id="noise-pattern"
						x="0"
						y="0"
						width="4"
						height="4"
						patternUnits="userSpaceOnUse"
					>
						<rect width="4" height="4" fill="#0B044D" />
						<circle cx="1" cy="1" r="0.3" fill="#150A5C" opacity="0.4" />
						<circle cx="3" cy="2" r="0.2" fill="#150A5C" opacity="0.3" />
						<circle cx="2" cy="3" r="0.25" fill="#150A5C" opacity="0.35" />
					</pattern>

					{/* Subtle shadow gradient for depth */}
					<linearGradient
						id="building-shadow"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="0%"
					>
						<stop offset="0%" stopColor="#0B044D" stopOpacity="1" />
						<stop offset="50%" stopColor="#0B044D" stopOpacity="0.95" />
						<stop offset="100%" stopColor="#05022A" stopOpacity="0.9" />
					</linearGradient>
				</defs>

				{/* Building fill with gradient, shadow, and texture */}
				<path
					d="M0 475.514H50.408V220.677H81.7299V190.208H113.052V220.677H138.846H164.641V190.208H195.963V220.677H227.285V409.035H277.695V21.2401H364.548V471.359H391.264V100.184H490.757V490.748H531.297V208.451H564.46V162.749H683.295V204.296L714.517 206.827V490.748H784.328V0H891.191V406.259H974.714V480.126L1058.85 353.63L1146.68 485.668V169.89H1256V490.748H1345V564H0V475.514Z"
					fill="url(#building-gradient)"
				/>
				<path
					d="M0 475.514H50.408V220.677H81.7299V190.208H113.052V220.677H138.846H164.641V190.208H195.963V220.677H227.285V409.035H277.695V21.2401H364.548V471.359H391.264V100.184H490.757V490.748H531.297V208.451H564.46V162.749H683.295V204.296L714.517 206.827V490.748H784.328V0H891.191V406.259H974.714V480.126L1058.85 353.63L1146.68 485.668V169.89H1256V490.748H1345V564H0V475.514Z"
					fill="url(#building-shadow)"
					opacity="0.3"
				/>
				<path
					d="M0 475.514H50.408V220.677H81.7299V190.208H113.052V220.677H138.846H164.641V190.208H195.963V220.677H227.285V409.035H277.695V21.2401H364.548V471.359H391.264V100.184H490.757V490.748H531.297V208.451H564.46V162.749H683.295V204.296L714.517 206.827V490.748H784.328V0H891.191V406.259H974.714V480.126L1058.85 353.63L1146.68 485.668V169.89H1256V490.748H1345V564H0V475.514Z"
					fill="url(#noise-pattern)"
					opacity="0.25"
				/>
				<g clipPath="url(#building-clip)">
					{lights.map((light) => (
						<circle
							key={`${light.x}-${light.y}`}
							cx={light.x}
							cy={light.y}
							r="2"
							fill="#FFD700"
							opacity={light.opacity}
						>
							<animate
								attributeName="opacity"
								values={`${light.opacity};${light.opacity * 0.3};${light.opacity}`}
								dur={`${2 + Math.random() * 2}s`}
								begin={`${light.delay}s`}
								repeatCount="indefinite"
							/>
						</circle>
					))}
				</g>
			</svg>
		</div>
	);
}
