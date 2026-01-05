import { create } from "zustand";

export type Screen = "landing" | "camera" | "preview" | "save";

interface PhotoboothState {
	currentScreen: Screen;
	photos: string[];
	photoStrip: string | null;
	setCurrentScreen: (screen: Screen) => void;
	addPhoto: (photo: string) => void;
	clearPhotos: () => void;
	setPhotoStrip: (photoStrip: string) => void;
	reset: () => void;
}

export const usePhotoboothStore = create<PhotoboothState>((set) => ({
	currentScreen: "landing",
	photos: [],
	photoStrip: null,
	setCurrentScreen: (screen) => set({ currentScreen: screen }),
	addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
	clearPhotos: () => set({ photos: [], photoStrip: null }),
	setPhotoStrip: (photoStrip) => set({ photoStrip }),
	reset: () => set({ currentScreen: "landing", photos: [], photoStrip: null }),
}));
