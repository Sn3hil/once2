"use client";

import React from "react";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
}

// Mock comments
const mockComments: Comment[] = [
    {
        id: "1",
        author: "Alex R.",
        content: "The atmosphere in this is incredible. I could feel the fog closing in.",
        createdAt: "2 hours ago",
    },
    {
        id: "2",
        author: "Sam K.",
        content: "That figure on the rocks gave me chills. Brilliant pacing.",
        createdAt: "5 hours ago",
    },
    {
        id: "3",
        author: "Jordan M.",
        content: "The lighthouse as a metaphor for isolation... chef's kiss.",
        createdAt: "1 day ago",
    },
];

interface CommentsPanelProps {
    open: boolean;
    onClose: () => void;
    storyTitle: string;
}

export function CommentsPanel({ open, onClose, storyTitle }: CommentsPanelProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-background/60"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-line bg-surface flex flex-col">
                        <div className="flex items-center justify-between p-4 dotted-border-b">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="size-4 text-muted" />
                                <span className="text-sm text-foreground">Comments</span>
                                <span className="text-xs text-muted">({mockComments.length})</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-muted hover:text-foreground cursor-pointer"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {mockComments.map((comment) => (
                                <div key={comment.id} className="border border-line p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-foreground">{comment.author}</span>
                                        <span className="text-xs text-muted">{comment.createdAt}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-muted">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}