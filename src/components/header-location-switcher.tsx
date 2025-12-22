"use client";

import { Check, ChevronsUpDown, MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useLocations } from "@/hooks/use-locations";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddLocationDialog } from "./add-location-dialog"; // Assume same folder or adjust import
import { EditLocationDialog } from "./edit-location-dialog";

import { authClient } from "@/lib/auth/client";

export function HeaderLocationSwitcher() {
    const { data: sessionData, isPending: isSessionPending } = authClient.useSession();
    const { locations, removeLocation, isLoading } = useLocations();
    const { currentLocationId, setCurrentLocation } = useAppStore();
    const [open, setOpen] = useState(false);

    // If not logged in, don't show the switcher
    if (!isSessionPending && !sessionData?.session) return null;

    // Find current location object
    const currentLocation = locations.find((l) => l.id === currentLocationId);

    // If we are loading, we might show a skeleton or loading state
    // But for header we can just show "Select Gym" until loaded.

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    role="combobox"
                    aria-expanded={open}
                    className="h-9 w-9 bg-background/50 backdrop-blur border-border/60 hover:bg-accent/50 transition-all relative"
                >
                    <MapPin className={cn("h-4 w-4 transition-colors", currentLocation ? "opacity-100 text-foreground" : "opacity-70")} />
                    {currentLocation && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto p-1 space-y-1">
                    {locations.length === 0 && !isLoading && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No gyms found. Add one below.
                        </div>
                    )}

                    {locations.map((location) => (
                        <div
                            key={location.id}
                            className={cn(
                                "group flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent cursor-pointer transition-colors",
                                currentLocationId === location.id ? "bg-accent/50 font-medium" : ""
                            )}
                            onClick={() => {
                                setCurrentLocation(location.id);
                                setOpen(false);
                            }}
                        >
                            <div className="flex items-center gap-2 truncate flex-1 mr-2">
                                <Check
                                    className={cn(
                                        "h-4 w-4 shrink-0 text-primary",
                                        currentLocationId === location.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="truncate">{location.name}</span>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <EditLocationDialog
                                        location={location}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                                <Edit2 className="h-3 w-3" />
                                            </Button>
                                        }
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Optional confirm? The previous card didn't confirm I think.
                                        removeLocation(location.id);
                                        if (currentLocationId === location.id) setCurrentLocation(null);
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-2 border-t border-border/50 bg-muted/20">
                    {/* We map the AddLocationDialog to use a custom trigger button full width */}
                    <CustomAddLocationDialog onOpenChange={(isOpen) => !isOpen && setOpen(false)} />
                </div>
            </PopoverContent>
        </Popover>
    );
}

// Wrapper to customize trigger efficiently without modifying AddLocationDialog too much if not needed,
// but AddLocationDialog controls its own state. 
// We can just import and use it if it allows custom trigger.
// Looking at AddLocationDialog, it renders <DialogTrigger><Button>...</Button></DialogTrigger>.
// I should probably update AddLocationDialog to accept a `trigger` prop to override the default button.
// For now I'll modify AddLocationDialog quickly to support `trigger` prop or `children` as trigger.

function CustomAddLocationDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    // This is a placeholder. I need to modify AddLocationDialog to accept a custom trigger
    // or just assume I will modify it.
    // Actually, I can just include the Dialog here if I export the inner content, but reusing the component is better.
    // I will refactor AddLocationDialog in next step to accept `trigger` prop.
    return (
        <AddLocationDialog customTrigger={
            <Button size="sm" className="w-full justify-start font-normal" variant="ghost">
                <Plus className="mr-2 h-4 w-4" />
                Add New Location
            </Button>
        } />
    )
}
