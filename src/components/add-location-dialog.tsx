"use client";

import { Camera, Check, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
// In step 100 view, line 27 uses useAppStore. But I want useLocations.
// I will just use useLocations and remove useAppStore if not needed.
// addLocation is from useLocations.
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
import { useLocations } from "@/hooks/use-locations"; // Correct import
import { useAppStore } from "@/lib/store"; // Keep if needed for something else, but we replaced usage. Actually verify.

interface AddLocationDialogProps {
  customTrigger?: React.ReactNode;
}

export function AddLocationDialog({ customTrigger }: AddLocationDialogProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLocation } = useLocations();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) return;

    setScanning(true);
    try {
      const response = await fetch("/api/ai/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });

      if (!response.ok) throw new Error("Scan failed");

      const data = await response.json();
      setScanResult(data);
      toast.success("Gym scanned successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image. Try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleSave = () => {
    if (!scanResult) return;

    // Convert equipment objects to string array if needed, or if scanResult already has strings
    // Based on previous code: scanResult.equipment?.map((item: any) => ...)
    // So it seems it is an array of objects.
    const equipmentList =
      scanResult.equipment?.map((item: any) => item.name || item) || [];

    addLocation({
      name: scanResult.name,
      location: scanResult.location || "Unspecified Location", // Fallback
      equipment: equipmentList, // string[]
    });

    setOpen(false);
    resetState();
  };

  const resetState = () => {
    setImagePreview(null);
    setScanResult(null);
    setScanning(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
      }}
    >
      <DialogTrigger asChild>
        {customTrigger || (
          <Button>
            <Camera className="mr-2 h-4 w-4" />
            Add Gym
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Upload a photo of your gym or equipment. AI will detect what you
            have.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 gap-4 flex flex-col">
          {!imagePreview ? (
            <div
              className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors h-48"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Tap to upload or take photo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              </div>

              {!scanResult ? (
                <Button
                  className="w-full"
                  onClick={handleScan}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Scan Gym"
                  )}
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={scanResult.name}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>
                      Equipment Found ({scanResult.equipment?.length || 0})
                    </Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      <ul className="space-y-1 text-sm">
                        {scanResult.equipment?.map((item: any, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {scanResult && (
            <Button onClick={handleSave} className="w-full">
              Save Location
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
