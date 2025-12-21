import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import type { Location } from "@/lib/schemas";

export function useLocations() {
  const { data, error, isLoading } = useSWR<Location[]>(
    "/api/locations",
    fetcher,
  );
  const { mutate } = useSWRConfig();

  const addLocation = async (locationData: Partial<Location>) => {
    // Optimistic update could be added here, but simple revalidation is fine for now
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      });
      if (!res.ok) throw new Error("Failed to add location");
      // Revalidate
      mutate("/api/locations");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeLocation = async (id: string) => {
    try {
      await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });
      mutate("/api/locations");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    locations: data || [],
    isLoading,
    error,
    addLocation,
    removeLocation,
  };
}
