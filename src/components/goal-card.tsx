"use client";

import { Flag, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/schemas";
import { EditGoalDialog } from "./edit-goal-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface GoalCardProps {
  goal: Goal;
  isActive: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function GoalCard({
  goal,
  isActive,
  onToggle,
  onDelete,
}: GoalCardProps) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 cursor-pointer",
        isActive
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]"
          : "border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md",
      )}
    >
      {isActive && (
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
      )}

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border/50",
                isActive ? "text-primary border-primary/20" : "",
              )}
            >
              <Flag className="h-4 w-4" />
            </div>
          </div>

          <div className="flex gap-1">
            <div onClick={(e) => e.stopPropagation()}>
              <EditGoalDialog
                goal={goal}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </div>

            <ConfirmDialog
              title="Delete goal?"
              description="This will remove the goal from your list."
              confirmLabel="Delete"
              confirmVariant="destructive"
              onConfirm={onDelete}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>

        <div className="space-y-2">
          <h3
            className={cn(
              "font-bold text-lg leading-tight tracking-tight transition-colors",
              isActive ? "text-foreground" : "text-foreground/90",
            )}
          >
            {goal.name}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Badge
            variant="secondary"
            className="bg-background/50 backdrop-blur border-border/50 text-xs font-medium text-muted-foreground px-2 py-1 h-6 gap-1.5 hover:bg-background/80 transition-colors"
          >
            Focus Goal
          </Badge>

          {isActive && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary animate-pulse">
              Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
