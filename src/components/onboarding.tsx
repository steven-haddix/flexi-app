"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Flag, Wand2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useSyncPreferences } from "@/hooks/use-sync-preferences";
import { useAppStore } from "@/lib/store";

const steps = [
    {
        title: "Welcome to Flexi",
        description: "Let's make working out easy and efficient.",
        icon: null,
    },
    {
        title: "Step 1: Capture",
        description: "Take a picture of your gym's equipment. We'll identify what's available.",
        icon: MapPin,
        color: "text-blue-500",
    },
    {
        title: "Step 2: Goal",
        description: "Tell us your long-term goals—like getting better at skiing or staying strong for next spring's climbing season. We'll tailor every workout to get you there.",
        icon: Flag,
        color: "text-red-500",
    },
    {
        title: "Step 3: Generate",
        description: "Hit generate and get a personalized workout in seconds. No more wandering around.",
        icon: Wand2,
        color: "text-yellow-500",
    },
    {
        title: "Flexi Coach",
        description: "The coach is available during workouts to make edits and ask for clarifications on workouts and movements.",
        icon: Sparkles,
        color: "text-purple-500",
    },
];

export function Onboarding() {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const { savePreferences, isLoading } = useSyncPreferences();

    // We check the preferences from the store or hook to see if we should show onboarding
    // For simplicity, we'll let the parent layout handle the conditional rendering
    // But we need to know if it's already been seen to avoid showing it after refresh

    React.useEffect(() => {
        // This is a bit tricky since we need to wait for preferences to load
        // We'll expose this component and let layout.tsx handle the "should show" logic
        setOpen(true);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        await savePreferences({
            preferences: { hasSeenOnboarding: true },
        });
        setOpen(false);
    };

    const handleSkip = async () => {
        await savePreferences({
            preferences: { hasSeenOnboarding: true },
        });
        setOpen(false);
    };

    const step = steps[currentStep];
    const Icon = step.icon;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleSkip()}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden bg-background/80 backdrop-blur-xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight">Onboarding</DialogTitle>
                </DialogHeader>

                <div className="relative h-[300px] flex flex-col items-center justify-center text-center p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex flex-col items-center gap-6"
                        >
                            {Icon ? (
                                <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${step.color}`}>
                                    <Icon size={48} strokeWidth={1.5} />
                                </div>
                            ) : (
                                <div className="text-6xl mb-2">💪</div>
                            )}

                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground text-balance">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        onClick={handleNext}
                        className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 transition-all active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                    </Button>

                    <div className="flex justify-center gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "w-8 bg-primary" : "w-1.5 bg-white/10"
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="link"
                        onClick={handleSkip}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Skip for now
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
