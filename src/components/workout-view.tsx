"use client";

import { useAppStore } from "@/lib/store";
import { useLocations } from "@/hooks/use-locations";
import { useWorkouts } from "@/hooks/use-workouts";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Sparkles, Play, Trash2, Calendar, ClipboardList } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkoutView() {
    const { locations } = useLocations();
    const { workouts, deleteWorkout, refresh } = useWorkouts();
    const { currentLocationId } = useAppStore();
    const currentLocation = locations.find((l) => l.id === currentLocationId);

    const [goals, setGoals] = useState("");
    const [logInput, setLogInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    const filteredWorkouts = workouts
        .filter((w) => w.gymId === currentLocationId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!currentLocation) {
        return (
            <Card className="opacity-50 border-dashed">
                <CardHeader>
                    <CardTitle>Workout Creator</CardTitle>
                    <CardDescription>
                        Select a gym above to start generating or logging workouts.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const handleGenerateWorkout = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate-workout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    equipment: currentLocation.equipment || [],
                    prompt: goals,
                    experienceLevel: "Intermediate",
                    gymId: currentLocation.id,
                }),
            });
            if (!res.ok) throw new Error("Failed to generate workout");

            toast.success("Workout generated and saved as draft!");
            setGoals("");
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
            refresh();
        } catch (err) {
            console.error(err);
            toast.error("Failed to log workout");
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-background/50 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Create Workout
                    </CardTitle>
                    <CardDescription>
                        Design a new routine or log what you just did at <strong>{currentLocation.name}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="generate" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="generate">Generate with AI</TabsTrigger>
                            <TabsTrigger value="log">Log Past Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="generate" className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                    Focus / Goals (Optional)
                                </label>
                                <Textarea
                                    placeholder="e.g. Chest day, HIIT, Recovery..."
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                    className="resize-none h-24"
                                    disabled={isGenerating}
                                />
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
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
                                <label className="text-sm font-medium">
                                    Describe your workout
                                </label>
                                <Textarea
                                    placeholder="e.g. Today I did 3 sets of 10 bench press at 135lbs..."
                                    value={logInput}
                                    onChange={(e) => setLogInput(e.target.value)}
                                    className="resize-none h-24"
                                    disabled={isLogging}
                                />
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleLogWorkout}
                                disabled={isLogging || !logInput.trim()}
                            >
                                {isLogging ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
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
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight px-1">Recent Workouts</h2>
                {filteredWorkouts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <p className="text-muted-foreground">No workouts found for this location yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredWorkouts.map((workout) => (
                            <Card key={workout.id} className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                                <CardHeader className="bg-muted/30 pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-xl">{workout.name}</CardTitle>
                                                {workout.status === "draft" && (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(workout.date).toLocaleDateString(undefined, {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteWorkout(workout.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="prose dark:prose-invert max-w-none pt-4">
                                    <Message from="assistant">
                                        <MessageContent>
                                            <MessageResponse>
                                                {workout.description || ""}
                                            </MessageResponse>
                                        </MessageContent>
                                    </Message>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
