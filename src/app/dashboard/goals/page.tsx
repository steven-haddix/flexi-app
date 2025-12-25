"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { GoalsList } from "@/components/goals-list";
import { Button } from "@/components/ui/button";

export default function GoalsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 font-sans">
            <main className="mx-auto max-w-5xl space-y-8">
                <div className="flex items-center gap-2">
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
                <GoalsList />
            </main>
        </div>
    );
}
