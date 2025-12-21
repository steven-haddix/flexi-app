"use client";

import { Dumbbell, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocations } from "@/hooks/use-locations";
import { useAppStore } from "@/lib/store";
import { AddLocationDialog } from "./add-location-dialog";

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
          <Card
            key={location.id}
            className={`cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden group ${currentLocationId === location.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : ""
              }`}
            onClick={() => setCurrentLocation(location.id)}
          >
            <CardHeader className="p-3 pb-2">
              <div className="flex justify-between items-start gap-1">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{location.name}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(location.id);
                    if (currentLocationId === location.id)
                      setCurrentLocation(null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <Dumbbell className="h-3 w-3" />
                <span>{location.equipment?.length || 0} Tools</span>
              </div>
            </CardContent>
          </Card>
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
