"use client";

import { Dumbbell, MapPin, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Location } from "@/lib/schemas";
import { EditLocationDialog } from "./edit-location-dialog";

interface LocationCardProps {
    location: Location;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

export function LocationCard({
    location,
    isActive,
    onSelect,
    onDelete,
}: LocationCardProps) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-5 transition-all duration-300 cursor-pointer",
                isActive
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)]"
                    : "border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md"
            )}
        >
            {/* Active Indicator Glow */}
            {isActive && (
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
            )}

            <div className="relative z-10 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border/50",
                            isActive ? "text-primary border-primary/20" : ""
                        )}>
                            <MapPin className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Actions - visible on hover or active */}
                    <div className={cn(
                        "flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                        // Keep actions visible on mobile touch or if active? Maybe just group-hover is cleaner for desktop.
                        // Let's keep it clean.
                    )}>
                        <div onClick={(e) => e.stopPropagation()}>
                            <EditLocationDialog
                                location={location}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <h3 className={cn(
                        "font-bold text-lg leading-tight tracking-tight transition-colors",
                        isActive ? "text-foreground" : "text-foreground/90"
                    )}>
                        {location.name}
                    </h3>

                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary" className="bg-background/50 backdrop-blur border-border/50 text-xs font-medium text-muted-foreground px-2 py-1 h-6 gap-1.5 hover:bg-background/80 transition-colors">
                        <Dumbbell className="h-3 w-3" />
                        <span>{location.equipment?.length || 0} Tools</span>
                    </Badge>

                    {isActive && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-primary animate-pulse">
                            Active
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
