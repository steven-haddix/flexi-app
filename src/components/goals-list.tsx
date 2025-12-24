"use client";

import { useEffect, useState } from "react";
import { useGoals } from "@/hooks/use-goals";
import { useAppStore } from "@/lib/store";
import { AddGoalDialog } from "./add-goal-dialog";
import { GoalCard } from "./goal-card";

export function GoalsList() {
  const { goals, removeGoal, isLoading, error } = useGoals();
  const { activeGoalIds, toggleGoal, removeActiveGoal } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading goals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load goals.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">Your Goals</h2>
        <AddGoalDialog />
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isActive={activeGoalIds.includes(goal.id)}
            onToggle={() => toggleGoal(goal.id)}
            onDelete={() => {
              removeGoal(goal.id);
              if (activeGoalIds.includes(goal.id)) removeActiveGoal(goal.id);
            }}
          />
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No goals yet. Add one to guide your workouts.
          </div>
        )}
      </div>
    </div>
  );
}
