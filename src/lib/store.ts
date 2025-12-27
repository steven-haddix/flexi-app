import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Location, Workout } from "./schemas";

interface AppState {
  currentLocationId: string | null;
  setCurrentLocation: (id: string | null) => void;
  activeGoalIds: string[];
  setActiveGoals: (ids: string[]) => void;
  toggleGoal: (id: string) => void;
  removeActiveGoal: (id: string) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (hasSeen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentLocationId: null,
      setCurrentLocation: (id) => set({ currentLocationId: id }),
      activeGoalIds: [],
      setActiveGoals: (ids) => set({ activeGoalIds: Array.from(new Set(ids)) }),
      toggleGoal: (id) =>
        set((state) => {
          const exists = state.activeGoalIds.includes(id);
          return {
            activeGoalIds: exists
              ? state.activeGoalIds.filter((goalId) => goalId !== id)
              : [...state.activeGoalIds, id],
          };
        }),
      removeActiveGoal: (id) =>
        set((state) => ({
          activeGoalIds: state.activeGoalIds.filter((goalId) => goalId !== id),
        })),
      hasSeenOnboarding: true, // Default to true to avoid flash, useSyncPreferences will set it
      setHasSeenOnboarding: (hasSeen) => set({ hasSeenOnboarding: hasSeen }),
    }),
    {
      name: "flexi-app-ui-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
