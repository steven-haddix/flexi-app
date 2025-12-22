"use client";

import { useEffect, useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { useAppStore } from "@/lib/store";
import { AddLocationDialog } from "./add-location-dialog";
import { LocationCard } from "./location-card";

export function LocationsList() {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const { locations, removeLocation, isLoading, error } = useLocations();
  const { currentLocationId, setCurrentLocation } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading gyms...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Failed to load gyms.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold tracking-tight">Your Gyms</h2>
        <AddLocationDialog />
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isActive={currentLocationId === location.id}
            onSelect={() => setCurrentLocation(location.id)}
            onDelete={() => {
              removeLocation(location.id);
              if (currentLocationId === location.id) setCurrentLocation(null);
            }}
          />
        ))}

        {locations.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No gyms added yet. Scan your first gym to get started!
          </div>
        )}
      </div>
    </div>
  );
}
