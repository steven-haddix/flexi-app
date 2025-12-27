"use client";

import { useSyncPreferences } from "@/hooks/use-sync-preferences";
import { authClient } from "@/lib/auth/client";
import { useAppStore } from "@/lib/store";
import { Onboarding } from "./onboarding";

export function OnboardingWrapper() {
    const { data: session, isPending } = authClient.useSession();
    const { preferences, isLoading: isSyncing } = useSyncPreferences();
    const storeHasSeenOnboarding = useAppStore(
        (state) => state.hasSeenOnboarding,
    );

    const hasSeenOnboardingValue =
        preferences?.preferences?.hasSeenOnboarding ?? storeHasSeenOnboarding;

    // Don't show if we're checking session or if user is not logged in
    if (isPending || !session?.session) {
        return null;
    }

    // If we are still loading preferences, don't show yet to avoid flash
    // However, useSyncPreferences returns isLoading which is true while SWR is fetching
    if (isSyncing) {
        return null;
    }

    // If the store or preferences say we've seen it, don't show it
    if (hasSeenOnboardingValue) {
        return null;
    }

    return <Onboarding />;
}
