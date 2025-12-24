"use client";

import { Edit, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useLocations } from "@/hooks/use-locations";
import type { Location } from "@/lib/schemas";

interface EditLocationDialogProps {
    location: Location;
    trigger?: React.ReactNode;
}

export function EditLocationDialog({ location, trigger }: EditLocationDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(location.name);
    const [equipment, setEquipment] = useState<string[]>(
        location.equipment || [],
    );
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateLocation } = useLocations();

    const handleAiUpdate = async () => {
        if (!aiPrompt.trim()) return;

        setIsAiLoading(true);
        try {
            const response = await fetch(`/api/ai/locations/${location.id}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    currentEquipment: equipment,
                }),
            });

            if (!response.ok) throw new Error("AI update failed");

            const data = await response.json();
            setEquipment(data.equipment);
            setAiPrompt("");
            toast.success("Equipment updated by AI!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update equipment with AI.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateLocation(location.id, {
                name,
                equipment,
            });
            setOpen(false);
            toast.success("Gym updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update gym.");
        } finally {
            setIsSaving(false);
        }
    };

    const removeEquipment = (itemToRemove: string) => {
        setEquipment(equipment.filter((item) => item !== itemToRemove));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Gym</DialogTitle>
                    <DialogDescription>
                        Update gym details or use AI to manage equipment.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Gym Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Home Gym"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>AI Equipment Manager</Label>
                        <div className="space-y-2">
                            <Textarea
                                placeholder="e.g. 'Add a bench press and remove the hex bar'"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="min-h-[80px] text-sm"
                            />
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={handleAiUpdate}
                                disabled={isAiLoading || !aiPrompt.trim()}
                            >
                                {isAiLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-3 w-3" />
                                        Process with AI
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Current Equipment ({equipment.length})</Label>
                        <ScrollArea className="h-[150px] w-full rounded-md border p-3">
                            <div className="flex flex-wrap gap-2">
                                {equipment.length > 0 ? (
                                    equipment.map((item, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="pl-2 pr-1 py-0.5 gap-1"
                                        >
                                            {item}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-3.5 w-3.5 p-0 hover:bg-transparent hover:text-destructive"
                                                onClick={() => removeEquipment(item)}
                                            >
                                                <X className="h-2.5 w-2.5" />
                                            </Button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        No equipment listed yet.
                                    </p>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
