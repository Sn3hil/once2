"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpvoteDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    storyTitle: string;
}

export function UpvoteDialog({ open, onClose, onSubmit, storyTitle }: UpvoteDialogProps) {
    const [comment, setComment] = React.useState("");

    if (!open) return null;

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment);
            setComment("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/80" onClick={onClose} />

            <div className="relative z-10 w-full max-w-md border border-line bg-surface p-6">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted hover:text-foreground cursor-pointer"
                >
                    <X className="size-4" />
                </button>

                <h2 className="text-lg text-foreground">Leave a note</h2>
                <p className="mt-1 text-sm text-muted">
                    Tell the author what you liked about <span className="text-foreground">{storyTitle}</span>
                </p>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What resonated with you?"
                    className="mt-4 w-full h-24 border border-line bg-transparent p-3 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                />

                <button
                    onClick={handleSubmit}
                    disabled={!comment.trim()}
                    className={cn(
                        "mt-4 w-full border border-line py-2 text-foreground transition-colors",
                        "hover:border-foreground hover:bg-surface",
                        "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                >
                    Upvote & Comment
                </button>
            </div>
        </div>
    );
}