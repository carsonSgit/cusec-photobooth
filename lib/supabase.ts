import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Orientation } from "./store";

// Types
export interface UploadParams {
	sessionId: string;
	photos: string[];
	photoStrip: string;
	orientation: Orientation;
	email?: string | null;
}

export interface UploadResult {
	success: boolean;
	sessionId: string;
	urls?: {
		photo1: string;
		photo2: string;
		photo3: string;
		photostrip: string;
	};
	error?: string;
}

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient | null {
	if (supabaseClient) {
		return supabaseClient;
	}

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !key) {
		return null;
	}

	try {
		supabaseClient = createClient(url, key);
		return supabaseClient;
	} catch {
		return null;
	}
}

// Generate unique session ID
export function generateSessionId(): string {
	const timestamp = Date.now();
	const random = crypto.randomUUID().slice(0, 8);
	return `${timestamp}-${random}`;
}

// Convert base64 to Blob
export function base64ToBlob(base64: string, mimeType: string): Blob {
	// Remove data URL prefix if present
	const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

	// Decode base64
	const byteCharacters = atob(base64Data);
	const byteNumbers = new Array(byteCharacters.length);

	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}

	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], { type: mimeType });
}

// Helper: Sleep for retry logic
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: Upload single file with retry
async function uploadFileWithRetry(
	supabase: SupabaseClient,
	bucket: string,
	path: string,
	blob: Blob,
	maxRetries = 3,
): Promise<string> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const { error } = await supabase.storage
				.from(bucket)
				.upload(path, blob, {
					contentType: blob.type,
					upsert: true,
				});

			if (error) {
				throw new Error(`Upload failed: ${error.message}`);
			}

			const {
				data: { publicUrl },
			} = supabase.storage.from(bucket).getPublicUrl(path);

			return publicUrl;
		} catch (error) {
			lastError = error as Error;

			if (attempt < maxRetries - 1) {
				const delay = Math.pow(2, attempt) * 1000;
				await sleep(delay);
			}
		}
	}

	throw lastError || new Error("Upload failed after retries");
}

// Main upload function
export async function uploadPhotoSession(
	params: UploadParams,
): Promise<UploadResult> {
	const { sessionId, photos, photoStrip, orientation, email } = params;

	const supabase = createSupabaseClient();
	if (!supabase) {
		return {
			success: false,
			sessionId,
			error: "Supabase client not initialized",
		};
	}

	try {
		const date = new Date().toISOString().split("T")[0];
		const folderPath = `${date}/session-${sessionId}`;

		const photoBlobs = photos.map((photo) => base64ToBlob(photo, "image/jpeg"));
		const photostripBlob = base64ToBlob(photoStrip, "image/png");

		const [photo1Url, photo2Url, photo3Url, photostripUrl] =
			await Promise.all([
				uploadFileWithRetry(
					supabase,
					"images",
					`${folderPath}/photo-1.jpg`,
					photoBlobs[0],
				),
				uploadFileWithRetry(
					supabase,
					"images",
					`${folderPath}/photo-2.jpg`,
					photoBlobs[1],
				),
				uploadFileWithRetry(
					supabase,
					"images",
					`${folderPath}/photo-3.jpg`,
					photoBlobs[2],
				),
				uploadFileWithRetry(
					supabase,
					"images",
					`${folderPath}/photostrip.png`,
					photostripBlob,
				),
			]);

		const { error: dbError } = await supabase.from("photo_sessions").insert({
			session_id: sessionId,
			orientation,
			photo_1_url: photo1Url,
			photo_2_url: photo2Url,
			photo_3_url: photo3Url,
			photostrip_url: photostripUrl,
			email: email || null,
			upload_status: "completed",
		});

		if (dbError) {
			return {
				success: false,
				sessionId,
				error: `Database error: ${dbError.message}`,
			};
		}

		return {
			success: true,
			sessionId,
			urls: {
				photo1: photo1Url,
				photo2: photo2Url,
				photo3: photo3Url,
				photostrip: photostripUrl,
			},
		};
	} catch (error) {
		return {
			success: false,
			sessionId,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// Update email for existing session
export async function updateSessionEmail(
	sessionId: string,
	email: string,
): Promise<boolean> {
	const supabase = createSupabaseClient();
	if (!supabase) return false;

	try {
		const { data, error } = await supabase
			.from("photo_sessions")
			.update({ email })
			.eq("session_id", sessionId)
			.select();

		return !error && data && data.length > 0;
	} catch {
		return false;
	}
}
