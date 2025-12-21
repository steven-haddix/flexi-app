"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LocationsList } from "@/components/locations-list";
import { WorkoutView } from "@/components/workout-view";
import { authClient } from "@/lib/auth/client";

export default function Dashboard() {
  const { data, isPending, error } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data?.session) {
      router.push("/");
    }
  }, [isPending, data, router]);

  if (isPending) {
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
        <LocationsList />

        <div className="w-full">
          <WorkoutView />
        </div>
      </main>
    </div>
  );
}
