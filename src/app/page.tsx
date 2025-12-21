"use client";

import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (data?.session) {
      router.push("/dashboard");
    }
  }, [data, router]);

  if (isPending || data?.session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Flexi
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sign in to access your workouts.
          </p>
        </div>
        <div className="mt-8">
          <AuthView path="signin" />
        </div>
      </div>
    </div>
  );
}
