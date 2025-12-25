"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Dumbbell,
  ArrowRight
} from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

export function WorkoutView() {
  const router = useRouter();
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
          clientDate: new Date().toISOString(),
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

  const handleWorkoutClick = (id: string) => {
    router.push(`/dashboard/workout/${id}`);
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
                    placeholder="e.g. Keep it short and powerful next Wednesday"
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
                      return (
                        <tr
                          key={workout.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer group"
                          onClick={() => handleWorkoutClick(workout.id)}
                        >
                          <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">
                            <div className="flex items-center gap-2">
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
                            <div className="flex items-center justify-end gap-1">
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
                              <ArrowRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all ml-2" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (Updated to match GoalCard) */}
            <div className="grid gap-3 md:hidden">
              {filteredWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  onClick={() => handleWorkoutClick(workout.id)}
                  className={cn(
                    "group relative flex items-start gap-4 overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md"
                  )}
                >
                  {/* Left Column: Icon */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className="flex h-10 w-10 min-w-10 aspect-square items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary"
                    >
                      <Dumbbell className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="relative z-10 flex flex-1 flex-col gap-2 min-w-0">
                    {/* Top: Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg leading-tight tracking-tight mt-0.5 line-clamp-2 transition-colors text-foreground/90 group-hover:text-foreground">
                        {workout.name}
                      </h3>
                    </div>

                    {/* Middle: Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(workout.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    {/* Bottom: Status & Buttons */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {workout.status === "draft" ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50 text-xs font-medium px-2 py-0.5 h-6"
                          >
                            Draft
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50 text-xs font-medium px-2 py-0.5 h-6"
                          >
                            Completed
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1 -mr-2" onClick={(e) => e.stopPropagation()}>
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
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
