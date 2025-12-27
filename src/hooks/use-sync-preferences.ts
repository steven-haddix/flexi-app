import { useEffect } from "react";
import useSWR from "swr";
import { useAppStore } from "@/lib/store";
import { authClient } from "@/lib/auth/client";
import { fetcher } from "@/lib/fetcher";

type PreferenceFields = {
    activeGoalIds?: string[];
    [key: string]: unknown;
};

type UserPreferences = {
    selectedGymId?: string | null;
    preferences?: PreferenceFields;
};

type PreferencesUpdate = {
    selectedGymId?: string | null;
    preferences?: PreferenceFields;
};

function mergePreferences(
    current: UserPreferences | undefined,
    updates: PreferencesUpdate
): UserPreferences {
    return {
        ...current,
        ...(updates.selectedGymId !== undefined
            ? { selectedGymId: updates.selectedGymId }
            : {}),
        ...(updates.preferences !== undefined
            ? {
                preferences: {
                    ...current?.preferences,
                    ...updates.preferences,
                },
            }
            : {}),
    };
}

export function useSyncPreferences() {
    const { data: sessionData } = authClient.useSession();
    const {
        setCurrentLocation,
        setActiveGoals,
    } = useAppStore();

    const preferencesKey = sessionData?.session ? "/api/user/preferences" : null;

    const { data: preferences, mutate: mutatePreferences, isLoading } = useSWR<UserPreferences>(
        preferencesKey,
        fetcher
    );

    // Sync preferences to store when they change/load
    useEffect(() => {
        if (!preferences) return;

        setCurrentLocation(preferences.selectedGymId ?? null);

        const activeGoalIds = Array.isArray(preferences.preferences?.activeGoalIds)
            ? preferences.preferences.activeGoalIds
            : [];
        setActiveGoals(activeGoalIds);
    }, [preferences, setCurrentLocation, setActiveGoals]);

    const savePreferences = async (
        updates: PreferencesUpdate
    ) => {
        if (!preferencesKey) return;

        try {
            await mutatePreferences(
                async () => {
                    const response = await fetch("/api/user/preferences", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(updates),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to save preferences");
                    }

                    return (await response.json()) as UserPreferences;
                },
                {
                    optimisticData: (current) => mergePreferences(current, updates),
                    rollbackOnError: true,
                    populateCache: true,
                    revalidate: false,
                }
            );
        } catch (error) {
            console.error("Failed to save preferences", error);
        }
    };

    return { savePreferences, isLoading };
}
