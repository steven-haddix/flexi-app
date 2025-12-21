import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Location, Workout } from './schemas';

interface AppState {
    locations: Location[];
    workouts: Workout[];
    currentLocationId: string | null;

    // Actions
    addLocation: (location: Location) => void;
    removeLocation: (id: string) => void;
    updateLocation: (id: string, updates: Partial<Location>) => void;

    addWorkout: (workout: Workout) => void;
    setCurrentLocation: (id: string | null) => void;

    // Selectors/Helpers could be here or derived in components
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            locations: [],
            workouts: [],
            currentLocationId: null,

            addLocation: (location) =>
                set((state) => ({ locations: [...state.locations, location] })),

            removeLocation: (id) =>
                set((state) => ({
                    locations: state.locations.filter((l) => l.id !== id),
                    workouts: state.workouts.filter((w) => w.locationId !== id) // Cascade delete?
                })),

            updateLocation: (id, updates) =>
                set((state) => ({
                    locations: state.locations.map((l) =>
                        l.id === id ? { ...l, ...updates } : l
                    ),
                })),

            addWorkout: (workout) =>
                set((state) => ({ workouts: [workout, ...state.workouts] })),

            setCurrentLocation: (id) =>
                set({ currentLocationId: id }),
        }),
        {
            name: 'flexi-workout-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
