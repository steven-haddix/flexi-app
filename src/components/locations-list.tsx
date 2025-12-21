"use client";

import { useAppStore } from "@/lib/store";
import { useLocations } from "@/hooks/use-locations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Dumbbell } from "lucide-react";
import { AddLocationDialog } from "./add-location-dialog";
import { useEffect, useState } from "react";

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
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading gyms...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-destructive">Failed to load gyms.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Your Gyms</h2>
        <AddLocationDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card
            key={location.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${currentLocationId === location.id
              ? "border-primary ring-1 ring-primary"
              : ""
              }`}
            onClick={() => setCurrentLocation(location.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {location.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(location.id);
                    if (currentLocationId === location.id)
                      setCurrentLocation(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {location.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Dumbbell className="h-4 w-4" />
                {/* Check if equipment is array of strings or objects, for now it is strings per schema choice */}
                <span>{location.equipment?.length || 0} pieces of equipment</span>
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
