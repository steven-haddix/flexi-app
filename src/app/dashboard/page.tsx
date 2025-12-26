"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


import { WorkoutView } from "@/components/workout-view";
import { OnboardingView } from "@/components/onboarding-view";
import { authClient } from "@/lib/auth/client";
import { useLocations } from "@/hooks/use-locations";
import { useGoals } from "@/hooks/use-goals";

export default function Dashboard() {
  const { data, isPending, error } = authClient.useSession();
  const router = useRouter();

  const { locations, isLoading: isLoadingLocations } = useLocations();
  const { goals, isLoading: isLoadingGoals } = useGoals();

  // State to track if onboarding is active.
  // default to false, we set it to true only if we confirm they are new.
  // once set to false (completed), it shouldn't flip back during the session.
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/");
    }
  }, [isPending, data, router]);

  // Determine onboarding status once data is loaded
  useEffect(() => {
    if (!isLoadingLocations && !isLoadingGoals && showOnboarding === null) {
      // Only set to true if they really have no data.
      if (locations.length === 0 || goals.length === 0) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    }
  }, [isLoadingLocations, isLoadingGoals, locations.length, goals.length, showOnboarding]);

  if (isPending || isLoadingLocations || isLoadingGoals || showOnboarding === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data?.session) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 font-sans">
      <main className="mx-auto max-w-5xl space-y-8">
        <div className="w-full">
          {showOnboarding ? (
            <OnboardingView onComplete={() => setShowOnboarding(false)} />
          ) : (
            <WorkoutView />
          )}
        </div>
      </main>
    </div>
  );
}
