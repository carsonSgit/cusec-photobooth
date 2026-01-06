import { create } from "zustand";

export type Screen = "landing" | "selection" | "camera" | "preview" | "save";
export type Orientation = "portrait" | "landscape";

interface PhotoboothState {
	currentScreen: Screen;
	orientation: Orientation;
	photos: string[];
	photoStrip: string | null;
	setCurrentScreen: (screen: Screen) => void;
	setOrientation: (orientation: Orientation) => void;
	addPhoto: (photo: string) => void;
	clearPhotos: () => void;
	setPhotoStrip: (photoStrip: string) => void;
	reset: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
	currentScreen: "landing",
	orientation: "portrait",
	photos: [],
	photoStrip: null,
	setCurrentScreen: (screen) => set({ currentScreen: screen }),
	setOrientation: (orientation) => set({ orientation }),
	addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
	clearPhotos: () => set({ photos: [], photoStrip: null }),
	setPhotoStrip: (photoStrip) => set({ photoStrip }),
	reset: () => set({ currentScreen: "landing", orientation: "portrait", photos: [], photoStrip: null }),
}));
