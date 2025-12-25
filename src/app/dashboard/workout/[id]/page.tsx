"use client";

import { use } from "react";
import { WorkoutDetails } from "@/components/workout-details";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function WorkoutPage({ params }: PageProps) {
    const resolvedParams = use(params);
    return (
        <div className="min-h-screen bg-background p-4 md:p-6 font-sans">
            <main className="mx-auto max-w-4xl">
                <WorkoutDetails workoutId={resolvedParams.id} />
            </main>
        </div>
    );
}
