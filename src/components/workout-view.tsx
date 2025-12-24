"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Fragment, useState } from "react";
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
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLocations } from "@/hooks/use-locations";
import { useGoals } from "@/hooks/use-goals";
import { useWorkouts } from "@/hooks/use-workouts";
import { useAppStore } from "@/lib/store";

export function WorkoutView() {
  const { locations } = useLocations();
  const { goals } = useGoals();
  const { workouts, deleteWorkout, updateWorkout, refresh } = useWorkouts();
  const { currentLocationId, activeGoalIds } = useAppStore();
  const currentLocation = locations.find((l) => l.id === currentLocationId);
  const activeGoals = goals.filter((goal) => activeGoalIds.includes(goal.id));

  const [goalNotes, setGoalNotes] = useState("");
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
      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment: currentLocation?.equipment || [],
          prompt: goalNotes,
          goals: activeGoals.map((goal) => ({
            name: goal.name,
            description: goal.description,
          })),
          experienceLevel: "Intermediate",
          gymId: currentLocation?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate workout");

      toast.success("Workout generated and saved as draft!");
      setGoalNotes("");
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
      <div className="flex items-end justify-between pb-6 border-b border-border/40 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Recent Workouts
            </h2>
            <Badge
              variant="outline"
              className="ml-2 font-normal text-muted-foreground border-border/50"
            >
              {filteredWorkouts.length} Total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your progress and access your workout history.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-4 w-4 mr-2" />
              New Session
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
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Goals
                  </div>
                  {activeGoals.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeGoals.map((goal) => (
                        <Badge key={goal.id} variant="secondary">
                          {goal.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No active goals selected. Use the flag menu to pick
                      multiple goals.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="focus-input"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Additional Focus
                  </label>
                  <Textarea
                    id="focus-input"
                    placeholder="e.g. Keep it short and powerful today"
                    value={goalNotes}
                    onChange={(e) => setGoalNotes(e.target.value)}
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
                  <label
                    htmlFor="workout-log"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Description
                  </label>
                  <Textarea
                    id="workout-log"
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
          <div className="text-center py-16 border border-dashed rounded-xl bg-muted/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">
              No workouts yet
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Generate your first workout or log a session to get started
              tracking your progress.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[40%]">
                        Workout
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                        Date
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                        Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredWorkouts.map((workout) => {
                      const isExpanded = expandedWorkoutIds.has(workout.id);
                      return (
                        <Fragment key={workout.id}>
                          <tr
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer group"
                            onClick={() => toggleWorkout(workout.id)}
                          >
                            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="truncate">{workout.name}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-muted-foreground">
                              {new Date(workout.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                              {workout.status === "draft" ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-200 dark:border-amber-800"
                                >
                                  Draft
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-800"
                                >
                                  Completed
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 mr-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateWorkout(workout.id, {
                                    status: "completed",
                                  });
                                }}
                                disabled={workout.status === "completed"}
                                title="Mark as Complete"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <ConfirmDialog
                                title="Delete workout?"
                                description="This will permanently remove the workout."
                                confirmLabel="Delete"
                                confirmVariant="destructive"
                                onConfirm={() => deleteWorkout(workout.id)}
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
                            </td>
                          </tr>
                          <tr className="border-0 p-0">
                            <td colSpan={4} className="p-0 border-0">
                              <Collapsible open={isExpanded}>
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                  <div className="p-4 bg-muted/30">
                                    <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground">
                                      <Message from="assistant">
                                        <MessageContent>
                                          <MessageResponse>
                                            {workout.description ||
                                              "No details available."}
                                          </MessageResponse>
                                        </MessageContent>
                                      </Message>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {filteredWorkouts.map((workout) => {
                const isExpanded = expandedWorkoutIds.has(workout.id);
                return (
                  <Card
                    key={workout.id}
                    className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-muted/60 gap-0"
                  >
                    <CardHeader
                      className="p-4 cursor-pointer select-none space-y-0"
                      onClick={() => toggleWorkout(workout.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold leading-none">
                              {workout.name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3 w-3" />
                            {new Date(workout.date).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {workout.status === "draft" && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border-amber-200 dark:border-amber-800 text-[10px] px-1.5 h-5"
                            >
                              Draft
                            </Badge>
                          )}
                          <div
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <ChevronDown className="h-4 w-4 text-muted-foreground/70" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <div className="border-t">
                          <CardContent className="p-4 prose dark:prose-invert max-w-none text-sm">
                            <Message from="assistant">
                              <MessageContent>
                                <MessageResponse>
                                  {workout.description || ""}
                                </MessageResponse>
                              </MessageContent>
                            </Message>
                            <div className="flex justify-end mt-4 pt-4 border-t border-border/50">
                              <ConfirmDialog
                                title="Delete workout?"
                                description="This will permanently remove the workout."
                                confirmLabel="Delete"
                                confirmVariant="destructive"
                                onConfirm={() => deleteWorkout(workout.id)}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 mr-1.5" />
                                  Delete Workout
                                </Button>
                              </ConfirmDialog>
                            </div>
                          </CardContent>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
