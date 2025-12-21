"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarPlus, Check, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ParsedWorkout {
  title: string;
  content: string;
  date: string;
}

export function LogWorkoutView() {
  const { addWorkout, currentLocationId } = useAppStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedWorkout | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setPreview(null);

    try {
      const response = await fetch("/api/log-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          clientDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process workout");
      }

      const data = await response.json();
      setPreview(data);
    } catch (error) {
      toast.error("Failed to process workout. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) return;

    addWorkout({
      id: crypto.randomUUID(),
      title: preview.title,
      content: preview.content,
      locationId: currentLocationId || "unknown", // Fallback or handle null better
      createdAt: new Date(preview.date),
    });

    toast.success("Workout logged successfully!");
    setInput("");
    setPreview(null);
  };

  const handleCancel = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-background/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Log Past Workout
          </CardTitle>
          <CardDescription>
            Type your workout details (e.g., "Yesterday I did 5x5 squats") and
            AI will format it for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Textarea
              placeholder="Describe your workout..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading || !!preview}
            />
          </div>

          {!preview && (
            <Button
              className="w-full sm:w-auto"
              onClick={handleProcess}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Entry"
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {preview && (
        <Card className="border-2 border-primary/20 shadow-lg animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{preview.title}</CardTitle>
                <CardDescription>
                  Date:{" "}
                  {new Date(preview.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-6 bg-card">
            <ReactMarkdown>{preview.content}</ReactMarkdown>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end bg-muted/10 p-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              Save Workout
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
