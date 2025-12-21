"use client";

import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocations } from "@/hooks/use-locations";
import { useWorkouts } from "@/hooks/use-workouts";
import { useAppStore } from "@/lib/store";

export function WorkoutView() {
  const { locations } = useLocations();
  const { workouts, deleteWorkout, refresh } = useWorkouts();
  const { currentLocationId } = useAppStore();
  const currentLocation = locations.find((l) => l.id === currentLocationId);

  const [goals, setGoals] = useState("");
  const [logInput, setLogInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Set<string>>(
    new Set(),
  );

  const filteredWorkouts = workouts
    .filter((w) => !currentLocationId || w.gymId === currentLocationId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment: currentLocation?.equipment || [],
          prompt: goals,
          experienceLevel: "Intermediate",
          gymId: currentLocation?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate workout");

      toast.success("Workout generated and saved as draft!");
      setGoals("");
      setIsOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate workout");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogWorkout = async () => {
    if (!logInput.trim()) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/log-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: logInput,
          clientDate: new Date().toISOString(),
          gymId: currentLocationId,
        }),
      });
      if (!res.ok) throw new Error("Failed to log workout");

      toast.success("Workout logged successfully!");
      setLogInput("");
      setIsOpen(false);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to log workout");
    } finally {
      setIsLogging(false);
    }
  };

  const toggleWorkout = (id: string) => {
    const next = new Set(expandedWorkoutIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedWorkoutIds(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">Recent Workouts</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {currentLocation ? "Create Workout" : "Log Global Workout"}
              </DialogTitle>
              <DialogDescription>
                {currentLocation ? (
                  <>
                    Design a new routine or log what you just did at{" "}
                    <strong>{currentLocation.name}</strong>
                  </>
                ) : (
                  <>
                    Log a workout or generate a routine based on general goals.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="generate" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="generate">Generate</TabsTrigger>
                <TabsTrigger value="log">Log</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Focus / Goals
                  </label>
                  <Textarea
                    placeholder="e.g. Chest day, HIIT..."
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="resize-none h-28 bg-muted/20 border-muted-foreground/20 focus:border-primary"
                    disabled={isGenerating}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleGenerateWorkout}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Designing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="log" className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    placeholder="e.g. 3 sets of 10 bench press..."
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    className="resize-none h-28 bg-muted/20 border-muted-foreground/20 focus:border-primary"
                    disabled={isLogging}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleLogWorkout}
                  disabled={isLogging || !logInput.trim()}
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Log Workout
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
            <p className="text-muted-foreground">
              No workouts found for this location yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWorkouts.map((workout) => {
              const isExpanded = expandedWorkoutIds.has(workout.id);
              return (
                <Card
                  key={workout.id}
                  className="overflow-hidden border-2 hover:border-primary/20 transition-colors"
                >
                  <CardHeader
                    className="bg-muted/10 py-3 px-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => toggleWorkout(workout.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base truncate">
                              {workout.name}
                            </CardTitle>
                            {workout.status === "draft" && (
                              <Badge
                                variant="secondary"
                                className="bg-amber-100/50 text-amber-700 hover:bg-amber-100/50 border-amber-200/50 text-[10px] h-4 px-1"
                              >
                                Draft
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-1 text-[11px]">
                            <Calendar className="h-3 w-3" />
                            {new Date(workout.date).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkout(workout.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="prose dark:prose-invert max-w-none pt-4 pb-4 bg-background">
                      <Message from="assistant">
                        <MessageContent>
                          <MessageResponse>
                            {workout.description || ""}
                          </MessageResponse>
                        </MessageContent>
                      </Message>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
