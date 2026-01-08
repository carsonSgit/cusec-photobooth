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
		console.warn(
			"[Supabase] Missing credentials. Upload functionality disabled.",
		);
		return null;
	}

	try {
		supabaseClient = createClient(url, key);
		return supabaseClient;
	} catch (error) {
		console.error("[Supabase] Failed to initialize client:", error);
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

	console.log(`[Supabase] Uploading to bucket "${bucket}" at path "${path}"...`);

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			// Upload file
			const { data, error } = await supabase.storage
				.from(bucket)
				.upload(path, blob, {
					contentType: blob.type,
					upsert: true, // Overwrite if exists
				});

			if (error) {
				console.error(`[Supabase] ❌ Storage upload error:`, error);
				throw new Error(`Upload failed: ${error.message}`);
			}

			// Get public URL
			const {
				data: { publicUrl },
			} = supabase.storage.from(bucket).getPublicUrl(path);

			console.log(`[Supabase] ✅ Uploaded: ${path}`);
			return publicUrl;
		} catch (error) {
			lastError = error as Error;
			console.warn(
				`[Supabase] ⚠️  Upload attempt ${attempt + 1}/${maxRetries} failed for ${path}:`,
				error,
			);

			if (attempt < maxRetries - 1) {
				const delay = Math.pow(2, attempt) * 1000;
				console.log(`[Supabase] Retrying in ${delay}ms...`);
				await sleep(delay);
			}
		}
	}

	console.error(`[Supabase] ❌ All upload attempts failed for ${path}`);
	throw lastError || new Error("Upload failed after retries");
}

// Main upload function
export async function uploadPhotoSession(
	params: UploadParams,
): Promise<UploadResult> {
	const { sessionId, photos, photoStrip, orientation, email } = params;

	console.log("[Supabase] Starting upload for session:", sessionId);
	console.log("[Supabase] Orientation:", orientation);
	console.log("[Supabase] Photos count:", photos.length);

	// Get Supabase client
	const supabase = createSupabaseClient();
	if (!supabase) {
		console.error("[Supabase] ERROR: Client not initialized - check environment variables");
		console.error("[Supabase] NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
		console.error("[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING");
		return {
			success: false,
			sessionId,
			error: "Supabase client not initialized",
		};
	}

	try {
		// Generate folder path: YYYY-MM-DD/session-{id}/
		const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
		const folderPath = `${date}/session-${sessionId}`;

		// Convert base64 to blobs
		const photoBlobs = photos.map((photo) => base64ToBlob(photo, "image/jpeg"));
		const photostripBlob = base64ToBlob(photoStrip, "image/png");

		console.log("[Supabase] Uploading files...");

		// Upload all files with retry logic
		const [photo1Url, photo2Url, photo3Url, photostripUrl] =
			await Promise.all([
				uploadFileWithRetry(
					supabase,
					"photobooth-images",
					`${folderPath}/photo-1.jpg`,
					photoBlobs[0],
				),
				uploadFileWithRetry(
					supabase,
					"photobooth-images",
					`${folderPath}/photo-2.jpg`,
					photoBlobs[1],
				),
				uploadFileWithRetry(
					supabase,
					"photobooth-images",
					`${folderPath}/photo-3.jpg`,
					photoBlobs[2],
				),
				uploadFileWithRetry(
					supabase,
					"photobooth-images",
					`${folderPath}/photostrip.png`,
					photostripBlob,
				),
			]);

		console.log("[Supabase] ✅ Files uploaded successfully");
		console.log("[Supabase] Photo 1 URL:", photo1Url);
		console.log("[Supabase] Photo 2 URL:", photo2Url);
		console.log("[Supabase] Photo 3 URL:", photo3Url);
		console.log("[Supabase] Photostrip URL:", photostripUrl);

		// Insert database record
		console.log("[Supabase] Inserting database record...");
		const { data: insertData, error: dbError } = await supabase.from("photo_sessions").insert({
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
			console.error("[Supabase] ❌ Database insert failed:", dbError);
			console.error("[Supabase] Error code:", dbError.code);
			console.error("[Supabase] Error details:", dbError.details);
			console.error("[Supabase] Error hint:", dbError.hint);
			// Files are uploaded but DB failed - still consider it a partial success
			return {
				success: false,
				sessionId,
				error: `Database error: ${dbError.message}`,
			};
		}

		console.log("[Supabase] ✅ Database record created");
		console.log("[Supabase] 🎉 Upload completed successfully");

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
		console.error("[Supabase] Upload failed:", error);
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
	if (!supabase) {
		console.warn("[Supabase] Cannot update email - client not initialized");
		return false;
	}

	try {
		const { error } = await supabase
			.from("photo_sessions")
			.update({ email })
			.eq("session_id", sessionId);

		if (error) {
			console.error("[Supabase] Email update failed:", error);
			return false;
		}

		console.log("[Supabase] Email updated successfully");
		return true;
	} catch (error) {
		console.error("[Supabase] Email update error:", error);
		return false;
	}
}
