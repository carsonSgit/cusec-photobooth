import type { Metadata, Viewport } from "next";
import { Jost, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-space-grotesk",
	display: "swap",
});

const jost = Jost({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
	variable: "--font-jost",
	display: "swap",
});

export const metadata: Metadata = {
	title: "CUSEC 2026 Photobooth",
	description: "Capture and share your CUSEC 2026 conference memories",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "CUSEC Photobooth",
	},
	icons: {
		icon: "/icon-192x192.png",
		apple: "/icon-192x192.png",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#000072",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className={`${spaceGrotesk.variable} ${jost.variable} antialiased bg-cusec-navy`}
			>
				{children}
			</body>
		</html>
	);
}
