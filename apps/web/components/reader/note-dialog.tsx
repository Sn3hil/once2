"use client";

import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { noteSchema } from "@once/shared/schemas";
import { storiesApi } from "@/lib/api";

interface NoteDialogProps {
    open: boolean;
    onClose: () => void;
    storyId: string;
    storyTitle: string;
}

export function NoteDialog({ open, onClose, storyId, storyTitle }: NoteDialogProps) {
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        const result = noteSchema.safeParse({ content, isPublic: false })

        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }

        setIsLoading(true);

        const response = await storiesApi.addNote(storyId, content)

        if (response.error) {
            toast.error(response.error.message)
        } else {
            toast.success("Note sent to author");
            setContent("");
            onClose();
        }

        setIsLoading(false);
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
                        className="relative z-10 w-full max-w-md border border-line bg-surface p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-muted hover:text-foreground cursor-pointer"
                        >
                            <X className="size-4" />
                        </button>

                        <h2 className="text-lg text-foreground">Send a Note</h2>
                        <p className="mt-1 text-sm text-muted">
                            Private feedback for the author of <span className="text-foreground">{storyTitle}</span>
                        </p>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What did you think of this story?"
                            className="mt-4 w-full h-24 border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !content.trim()}
                            className={cn(
                                "mt-4 w-full flex items-center justify-center gap-2 border border-line py-2 text-foreground transition-colors cursor-pointer",
                                "hover:border-foreground hover:bg-surface",
                                "disabled:cursor-not-allowed disabled:opacity-40"
                            )}
                        >
                            <Send className="size-4" />
                            Send Note
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}