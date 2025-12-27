"use client";

import { Fragment, useState } from "react";
import { Calendar as CalendarIcon, Check, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Message,
    MessageContent,
    MessageResponse,
} from "@/components/ai-elements/message";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { WorkoutCoach } from "@/components/workout-coach";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkouts } from "@/hooks/use-workouts";
import { cn } from "@/lib/utils";

interface WorkoutDetailsProps {
    workoutId: string;
}

export function WorkoutDetails({ workoutId }: WorkoutDetailsProps) {
    const router = useRouter();
    const { workouts, updateWorkout, deleteWorkout, isLoading, refresh } = useWorkouts();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Find the workout from the loaded list
    // In a real app with large data this might be a direct fetch,
    // but we are using the hook's SWR data which should be primed or load quickly
    const workout = workouts.find((w) => w.id === workoutId);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 text-muted-foreground hover:text-foreground"
                        disabled
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/40 pb-6">
                    <div className="space-y-3 w-full">
                        <Skeleton className="h-10 w-1/3" />
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </div>
        );
    }

    if (!workout) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-muted-foreground">Workout not found</div>
                <Button variant="link" onClick={() => router.push("/dashboard")}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const handleDelete = async () => {
        try {
            await deleteWorkout(workout.id);
            toast.success("Workout deleted");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to delete workout");
        }
    };

    const handleComplete = async () => {
        try {
            await updateWorkout(workout.id, { status: "completed" });
            toast.success("Workout marked as complete");
        } catch (error) {
            toast.error("Failed to update workout");
        }
    };
    const handleDateSelect = async (newDate: Date | undefined) => {
        if (!newDate) return;
        try {
            await updateWorkout(workout.id, { date: newDate.toISOString() });
            toast.success("Workout date updated");
            setIsCalendarOpen(false);
        } catch (error) {
            toast.error("Failed to update workout date");
        }
    };


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {workout.name}
                    </h1>
                    <div className="flex items-center gap-3">
                        {workout.status === "draft" ? (
                            <Badge
                                variant="secondary"
                                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            >
                                Draft
                            </Badge>
                        ) : (
                            <Badge
                                variant="secondary"
                                className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            >
                                Completed
                            </Badge>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 hover:bg-transparent hover:text-foreground font-normal"
                                    >
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        <span>
                                            {new Date(workout.date).toLocaleDateString(undefined, {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(workout.date)}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {workout.status !== "completed" && (
                        <Button
                            onClick={handleComplete}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Complete
                        </Button>
                    )}

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Ask Coach
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="p-0 sm:max-w-[400px] w-full">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Ask Coach</SheetTitle>
                            </SheetHeader>
                            <WorkoutCoach workoutId={workout.id} workout={workout} onWorkoutChange={refresh} />
                        </SheetContent>
                    </Sheet>

                    <ConfirmDialog
                        title="Delete workout?"
                        description="This will permanently remove the workout."
                        confirmLabel="Delete"
                        confirmVariant="destructive"
                        onConfirm={handleDelete}
                    >
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </ConfirmDialog>
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <div className="prose dark:prose-invert max-w-none">
                    <Message from="assistant">
                        <MessageContent>
                            <MessageResponse>
                                {workout.description || "No details available."}
                            </MessageResponse>
                        </MessageContent>
                    </Message>
                </div>
            </div>
        </div>
    );
}
