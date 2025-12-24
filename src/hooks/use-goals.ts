import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Goal } from "@/lib/schemas";

export function useGoals() {
  const { data, error, isLoading } = useSWR<Goal[]>("/api/goals", fetcher);
  const { mutate } = useSWRConfig();

  const addGoal = async (goalData: Partial<Goal>) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error("Failed to add goal");
      mutate("/api/goals");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      mutate("/api/goals");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateGoal = async (id: string, goalData: Partial<Goal>) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      mutate("/api/goals");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    goals: data || [],
    isLoading,
    error,
    addGoal,
    removeGoal,
    updateGoal,
  };
}
