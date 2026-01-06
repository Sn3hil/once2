"use client";

import React from "react";
import { X, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Scene } from "@once/shared";

interface ForkDialogProps {
    open: boolean;
    onClose: () => void;
    onFork: (sceneNumber: number) => void;
    scenes: Scene[];
    storyTitle: string;
}

export function ForkDialog({ open, onClose, onFork, scenes, storyTitle }: ForkDialogProps) {
    const [selectedScene, setSelectedScene] = React.useState<number | null>(null);

    const handleFork = () => {
        if (selectedScene !== null) {
            onFork(selectedScene);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="relative z-10 w-full max-w-lg border border-line bg-surface p-6 max-h-[80vh] flex flex-col">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-muted hover:text-foreground cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <GitFork className="size-5 text-accent" />
                            <h2 className="text-lg text-foreground">Fork Story</h2>
                        </div>
                        <p className="text-sm text-muted mb-4">
                            Choose a scene to branch from. Your fork continues from this point.
                        </p>

                        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                            {scenes.map((scene) => (
                                <button
                                    key={scene.turnNumber}
                                    onClick={() => setSelectedScene(scene.turnNumber)}
                                    className={cn(
                                        "w-full text-left p-3 border transition-colors cursor-pointer",
                                        selectedScene === scene.turnNumber
                                            ? "border-accent bg-accent/10"
                                            : "border-line hover:border-foreground/50"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted">Scene {scene.turnNumber}</span>
                                        {scene.userAction !== "[STORY_START]" && (
                                            <span className="text-xs text-accent italic truncate max-w-[200px]">
                                                "{scene.userAction}"
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted line-clamp-2">
                                        {scene.narration.slice(0, 100)}...
                                    </p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleFork}
                            disabled={selectedScene === null}
                            className={cn(
                                "w-full border border-line py-2 text-foreground transition-colors",
                                "hover:border-accent hover:bg-accent/10",
                                "disabled:cursor-not-allowed disabled:opacity-40"
                            )}
                        >
                            Fork from Scene {selectedScene || "..."}
                        </button>
                    </motion.div>
                </div>
            )
            }
        </AnimatePresence >
    );
}