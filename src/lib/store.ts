import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Location, Workout } from "./schemas";

interface AppState {
  currentLocationId: string | null;
  setCurrentLocation: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentLocationId: null,
      setCurrentLocation: (id) => set({ currentLocationId: id }),
    }),
    {
      name: "flexi-app-ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
