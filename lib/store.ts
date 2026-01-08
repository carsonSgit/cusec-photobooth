import { create } from "zustand";

export type Screen = "landing" | "selection" | "camera" | "preview" | "save";
export type Orientation = "portrait" | "landscape";
export type UploadStatus = "idle" | "uploading" | "success" | "error";

interface PhotoboothState {
	currentScreen: Screen;
	orientation: Orientation;
	photos: string[];
	photoStrip: string | null;
	sessionId: string | null;
	uploadStatus: UploadStatus;
	uploadError: string | null;
	setCurrentScreen: (screen: Screen) => void;
	setOrientation: (orientation: Orientation) => void;
	addPhoto: (photo: string) => void;
	clearPhotos: () => void;
	setPhotoStrip: (photoStrip: string) => void;
	setSessionId: (sessionId: string) => void;
	setUploadStatus: (status: UploadStatus) => void;
	setUploadError: (error: string | null) => void;
	reset: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
	currentScreen: "landing",
	orientation: "portrait",
	photos: [],
	photoStrip: null,
	sessionId: null,
	uploadStatus: "idle",
	uploadError: null,
	setCurrentScreen: (screen) => set({ currentScreen: screen }),
	setOrientation: (orientation) => set({ orientation }),
	addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
	clearPhotos: () => set({ photos: [], photoStrip: null }),
	setPhotoStrip: (photoStrip) => set({ photoStrip }),
	setSessionId: (sessionId) => set({ sessionId }),
	setUploadStatus: (status) => set({ uploadStatus: status }),
	setUploadError: (error) => set({ uploadError: error }),
	reset: () =>
		set({
			currentScreen: "landing",
			orientation: "portrait",
			photos: [],
			photoStrip: null,
			sessionId: null,
			uploadStatus: "idle",
			uploadError: null,
		}),
}));
