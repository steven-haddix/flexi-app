"use client";

import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGoals } from "@/hooks/use-goals";
import type { Goal } from "@/lib/schemas";

interface EditGoalDialogProps {
  goal: Goal;
  trigger?: React.ReactNode;
}

export function EditGoalDialog({ goal, trigger }: EditGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const { updateGoal } = useGoals();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateGoal(goal.id, {
        name: name.trim(),
        description: description.trim(),
      });
      setOpen(false);
      toast.success("Goal updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update goal.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the goal details that guide your workouts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Build finger strength"
              disabled={isSaving}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-description">Description</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details that keep your training focused."
              className="min-h-[90px]"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
