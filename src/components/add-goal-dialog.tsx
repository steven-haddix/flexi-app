"use client";

import { Flag, Loader2, Sparkles } from "lucide-react";
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
import posthog from "posthog-js";

interface AddGoalDialogProps {
  customTrigger?: React.ReactNode;
}

export function AddGoalDialog({ customTrigger }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addGoal } = useGoals();

  const resetState = () => {
    setPrompt("");
    setName("");
    setDescription("");
    setIsGenerating(false);
    setIsSaving(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/goals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to generate goal");
      const data = await res.json();
      setName(data.name || "");
      setDescription(data.description || "");
      posthog.capture("goal_generated", {
        prompt_length: prompt.trim().length,
      });
      toast.success("Goal drafted with AI.");
    } catch (error) {
      console.error(error);
      posthog.captureException(error);
      toast.error("Failed to generate goal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await addGoal({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      posthog.capture("goal_added", {
        goal_name: name.trim(),
        has_description: description.trim().length > 0,
      });
      setOpen(false);
      resetState();
      toast.success("Goal added.");
    } catch (error) {
      console.error(error);
      posthog.captureException(error);
      toast.error("Failed to add goal.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
      }}
    >
      <DialogTrigger asChild>
        {customTrigger || (
          <Button>
            <Flag className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
          <DialogDescription>
            Describe what you want to achieve or draft it with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="goal-prompt">AI Draft Prompt</Label>
            <Textarea
              id="goal-prompt"
              placeholder="e.g. I want to build stronger fingers for rock climbing this off-season."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[90px]"
              disabled={isGenerating || isSaving}
            />
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Off-season climbing strength"
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details that will help the AI stay on track."
                className="min-h-[80px]"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
