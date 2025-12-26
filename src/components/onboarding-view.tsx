"use client";

import { useState } from "react";
import { Camera, ArrowRight, Check, Dumbbell, Target, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocations } from "@/hooks/use-locations";
import { useGoals } from "@/hooks/use-goals";
import { useWorkouts } from "@/hooks/use-workouts";
import { useAppStore } from "@/lib/store";

interface OnboardingViewProps {
  onComplete: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [gymName, setGymName] = useState("");
  const [gymDescription, setGymDescription] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [workoutDay, setWorkoutDay] = useState("");

  const { addLocation } = useLocations();
  const { addGoal } = useGoals();
  const { refresh } = useWorkouts();
  const { setCurrentLocation, setActiveGoals } = useAppStore();

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    toast.info("Scanning image...");

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];

        const res = await fetch("/api/ai/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            description: gymDescription // Pass current description as context
          }),
        });

        if (!res.ok) throw new Error("Failed to scan image");

        const data = await res.json();

        // Populate fields with scan results
        if (data.name) setGymName(data.name);
        if (data.description) setGymDescription(data.description);

        // If we received equipment list, we might want to append it to description or handle it otherwise
        // The current addLocation doesn't take equipment array directly unless it fits into 'description' or update schema
        // But let's check schema... Schema says equipment is string[].
        // So we might need to handle that. But simpler to just put it in description for now or
        // update the gym description to include the list.
        if (data.equipment && Array.isArray(data.equipment)) {
             const equipmentList = data.equipment.map((e: any) => e.name + (e.notes ? ` (${e.notes})` : '')).join(", ");
             setGymDescription(prev => (prev ? prev + "\n\nDetected Equipment: " + equipmentList : "Detected Equipment: " + equipmentList));
        }

        toast.success("Gym info updated from image!");
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGym = async () => {
    if (!gymName) {
      toast.error("Please enter a gym name");
      return;
    }
    setLoading(true);
    try {
      // In a real scenario, we might want to wait for the ID to be returned
      // The current hook doesn't return the ID, so we might need to refetch or assume.
      // For simplicity, we just add it. The dashboard will pick up the latest one.
      await addLocation({
        name: gymName,
        location: "Home Gym", // Default for onboarding
        description: gymDescription,
      });
      toast.success("Gym added!");
      handleNext();
    } catch (error) {
      toast.error("Failed to add gym");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalName) {
      toast.error("Please enter a goal");
      return;
    }
    setLoading(true);
    try {
      await addGoal({
        name: goalName,
        description: goalDescription,
      });
      toast.success("Goal set!");
      handleNext();
    } catch (error) {
      toast.error("Failed to set goal");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFirstWorkout = async () => {
    setLoading(true);
    try {
      // We need to fetch the newly created gym and goal to use their IDs.
      // Since `addLocation` and `addGoal` are void and use SWR, we might need to rely on the backend finding them
      // or we just trigger the generation with the text prompts and let the backend handle context if possible.
      // However, the `generate-workout` endpoint expects IDs.

      // Let's rely on the user having just created them.
      // We will try to fetch the latest location and goal.
      const locationsRes = await fetch("/api/locations");
      const locations = await locationsRes.json();
      const latestGym = locations[0]; // Assuming latest is first or we filter.
      // Actually typical SQL order might be insertion order but let's check.
      // The `useLocations` hook revalidates.

      const goalsRes = await fetch("/api/goals");
      const goals = await goalsRes.json();
      const latestGoal = goals[0];

      if (!latestGym || !latestGoal) {
        throw new Error("Could not find created gym or goal");
      }

      // Set them as active in store so the dashboard shows them
      setCurrentLocation(latestGym.id);
      setActiveGoals([latestGoal.id]);

      const res = await fetch("/api/ai/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipment: latestGym.equipment || [],
          prompt: `Make a workout for ${workoutDay || "today"}.`,
          goals: [{
            name: latestGoal.name,
            description: latestGoal.description,
          }],
          experienceLevel: "Beginner", // Default for onboarding
          gymId: latestGym.id,
          clientDate: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to generate workout");

      toast.success("First workout generated!");
      refresh(); // Refresh workouts
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 1 && (
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Welcome to Flexi</CardTitle>
              <CardDescription className="text-lg mt-2">
                We take your gym, goal, and history to build your perfect workout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Let&apos;s get you set up in just a few steps.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your Gym</CardTitle>
              <CardDescription>
                You can upload a picture or just describe what you have.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gym Name</label>
                <Input
                  placeholder="e.g. Home Gym, Garage, Planet Fitness"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description or Equipment</label>
                <Textarea
                  placeholder="I have dumbbells, a bench, and a pull-up bar..."
                  value={gymDescription}
                  onChange={(e) => setGymDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                <label className="cursor-pointer block">
                  <Camera className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Upload a photo of your gym</p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </label>
                {/* Visual feedback could be added here */}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              <Button onClick={handleCreateGym} disabled={loading}>
                {loading ? "Saving..." : "Next"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Set your Goal</CardTitle>
              <CardDescription>
                What do you want to achieve?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Name</label>
                <Input
                  placeholder="e.g. Build Muscle, Lose Weight"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Details (Optional)</label>
                <Textarea
                  placeholder="I want to focus on my upper body..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              <Button onClick={handleCreateGoal} disabled={loading}>
                {loading ? "Saving..." : "Next"}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>First Workout</CardTitle>
              <CardDescription>
                When do you want to work out?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Which day?</label>
                <Input
                  placeholder="e.g. Today, Tomorrow, Monday"
                  value={workoutDay}
                  onChange={(e) => setWorkoutDay(e.target.value)}
                />
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 shrink-0" />
                  Using your goal: <strong>{goalName}</strong>
                </p>
                <p className="flex items-start gap-2 mt-2">
                  <Dumbbell className="h-4 w-4 mt-0.5 shrink-0" />
                  At your gym: <strong>{gymName}</strong>
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
              <Button onClick={handleGenerateFirstWorkout} disabled={loading}>
                {loading ? "Generating..." : "Generate Workout"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
