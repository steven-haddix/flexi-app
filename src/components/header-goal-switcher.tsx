"use client";

import { Check, Flag, Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGoals } from "@/hooks/use-goals";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddGoalDialog } from "./add-goal-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { authClient } from "@/lib/auth/client";
import posthog from "posthog-js";

export function HeaderGoalSwitcher() {
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const { goals, removeGoal, isLoading } = useGoals();
  const { activeGoalIds, toggleGoal, removeActiveGoal } = useAppStore();
  const [open, setOpen] = useState(false);

  if (!isSessionPending && !sessionData?.session) return null;

  const activeCount = activeGoalIds.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-9 bg-background/50 backdrop-blur border-border/60 hover:bg-accent/50 transition-all relative"
        >
          <Flag
            className={cn(
              "h-4 w-4 transition-colors",
              activeCount > 0 ? "opacity-100 text-foreground" : "opacity-70",
            )}
          />
          {activeCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {activeCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="max-h-[320px] overflow-y-auto p-1 space-y-1">
          {goals.length === 0 && !isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No goals yet. Add one below.
            </div>
          )}

          {goals.map((goal) => {
            const isActive = activeGoalIds.includes(goal.id);
            return (
              <div
                key={goal.id}
                className={cn(
                  "group flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent cursor-pointer transition-colors",
                  isActive ? "bg-accent/50 font-medium" : "",
                )}
                onClick={() => {
                  const wasActive = activeGoalIds.includes(goal.id);
                  toggleGoal(goal.id);
                  posthog.capture("goal_toggled", {
                    goal_id: goal.id,
                    goal_name: goal.name,
                    action: wasActive ? "deactivated" : "activated",
                  });
                }}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-2">
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 text-primary",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="truncate">
                    <span className="truncate block">{goal.name}</span>
                    {goal.description && (
                      <span className="truncate text-xs text-muted-foreground block">
                        {goal.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditGoalDialog
                      goal={goal}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      }
                    />
                  </div>
                  <ConfirmDialog
                    title="Delete goal?"
                    description="This will remove the goal from your list."
                    confirmLabel="Delete"
                    confirmVariant="destructive"
                    onConfirm={() => {
                      removeGoal(goal.id);
                      removeActiveGoal(goal.id);
                      posthog.capture("goal_deleted", {
                        goal_id: goal.id,
                        goal_name: goal.name,
                      });
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-2 border-t border-border/50 bg-muted/20">
          <AddGoalDialog
            customTrigger={
              <Button
                size="sm"
                className="w-full justify-start font-normal"
                variant="ghost"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
