'use client';

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useCompletion } from '@ai-sdk/react'; // Use useCompletion for text streaming
import { Loader2, Sparkles, Play, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function WorkoutView() {
    const { locations, currentLocationId } = useAppStore();
    const currentLocation = locations.find(l => l.id === currentLocationId);
    const [goals, setGoals] = useState('');

    const { completion, complete, isLoading, setInput } = useCompletion({
        api: '/api/generate-workout',
    });

    if (!currentLocation) {
        return (
            <Card className="opacity-50 border-dashed">
                <CardHeader>
                    <CardTitle>Workout Generator</CardTitle>
                    <CardDescription>Select a gym above to start generating workouts.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Wrapper to handle submit with extra data if needed, or just rely on useCompletion's body
    // useCompletion sends 'prompt' as the main input. We are sending body alongside.
    // Actually useCompletion sends { prompt } in the body.
    // My API expects { equipment, goals ... }. 
    // Let's adjust: I will likely need to pass the custom body via `handleSubmit` or just ignore `input` and trigger it manually?
    // `useCompletion` allows passing `body` in the hook config, but it's static there.
    // Better approach: use `complete` function from `useCompletion` which accepts options.

    const generateWorkout = () => {
        complete(goals, {
            body: {
                equipment: currentLocation.equipment || [],
                experienceLevel: 'Intermediate',
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-background/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generate Workout
                    </CardTitle>
                    <CardDescription>
                        Creating a routine for <strong>{currentLocation.name}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Focus / Goals (Optional)</label>
                        <Textarea
                            placeholder="e.g. Chest day, HIIT, Recovery..."
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <Button
                        className="w-full sm:w-auto"
                        size="lg"
                        onClick={generateWorkout}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Designing Workout...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {(completion || isLoading) && (
                <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle>Your Workout</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none p-6">
                        <ReactMarkdown>{completion}</ReactMarkdown>
                        {isLoading && <span className="animate-pulse">▍</span>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
