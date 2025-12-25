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
        "group relative flex items-start gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer",
        isActive
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]"
          : "border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md",
      )}
    >
      {isActive && (
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
      )}

      {/* Left Column: Icon */}
      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            "flex h-10 w-10 min-w-10 aspect-square items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border/50 transition-colors group-hover:border-primary/20",
            isActive ? "text-primary border-primary/20" : "text-muted-foreground group-hover:text-primary",
          )}
        >
          <Flag className="h-5 w-5" />
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="relative z-10 flex flex-1 flex-col gap-2 min-w-0">
        {/* Top: Title */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "font-bold text-lg leading-tight tracking-tight mt-0.5 truncate transition-colors",
              isActive ? "text-foreground" : "text-foreground/90",
            )}
          >
            {goal.name}
          </h3>
        </div>

        {/* Middle: Description */}
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}

        {/* Bottom: Status & Buttons */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-background/50 backdrop-blur border-border/50 text-xs font-medium text-muted-foreground px-2 py-0.5 h-6 hover:bg-background/80 transition-colors"
            >
              Focus Goal
            </Badge>

            {isActive && (
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary animate-pulse ml-1">
                Active
              </span>
            )}
          </div>

          <div className="flex gap-1 -mr-2" onClick={(e) => e.stopPropagation()}>
            <EditGoalDialog
              goal={goal}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              }
            />

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
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
