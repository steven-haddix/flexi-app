import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Workout } from "@/lib/schemas";
import { useSWRConfig } from "swr";

export function useWorkouts() {
    const { data, error, isLoading } = useSWR<Workout[]>("/api/workouts", fetcher);
    const { mutate } = useSWRConfig();

    const addWorkout = async (workoutData: Partial<Workout>) => {
        try {
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(workoutData),
            });
            if (!res.ok) throw new Error("Failed to add workout");
            mutate("/api/workouts");
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteWorkout = async (id: string) => {
        try {
            const res = await fetch(`/api/workouts/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete workout");
            mutate("/api/workouts");
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    return {
        workouts: data || [],
        isLoading,
        error,
        addWorkout,
        deleteWorkout,
        refresh: () => mutate("/api/workouts"),
    };
}
