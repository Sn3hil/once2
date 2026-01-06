"use client";

import React, { useState } from "react";
import { ArrowBigUp, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
// import { GitFork } from "lucide-react";
import { useUpvote } from "@/hooks/use-upvote";

interface PublicStory {
    id: string;
    title: string;
    author: string;
    genre: string;
    wordCount: number;
    upvotes: number;
    excerpt: string;
}

export function PublicStoryCard({ story }: { story: PublicStory }) {

    const { hasUpvoted, upvoteCount, isUpvoting, toggleUpvote } = useUpvote({
        storyId: story.id,
        initialUpvotes: story.upvotes,
    });

    return (
        <div className="group h-full border border-line bg-surface p-5 flex flex-col">
            <Link href={`/read/${story.id}`}>
                <h2 className="text-lg text-foreground hover:underline cursor-pointer">
                    {story.title}
                </h2>
            </Link>
            <p className="mt-1 text-sm text-muted flex items-center gap-1">
                <User className="size-3" />
                {story.author}
            </p>
            <p className="mt-3 text-sm text-muted/80 line-clamp-2">{story.excerpt}</p>
            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <BookOpen className="size-3" />
                        {story.wordCount.toLocaleString()}
                    </span>
                    <span>{story.genre}</span>
                </div>
                <button
                    onClick={toggleUpvote}
                    disabled={isUpvoting}
                    className={cn(
                        "flex items-center border rounded-lg overflow-hidden transition-colors cursor-pointer",
                        hasUpvoted ? "border-accent" : "border-line hover:border-foreground/50"
                    )}
                >
                    <span className={cn(
                        "px-2 py-1 transition-colors",
                        hasUpvoted ? "text-accent" : "text-muted hover:text-foreground"
                    )}>
                        <ArrowBigUp className={cn("size-4", hasUpvoted && "fill-accent")} />
                    </span>
                    <span className={cn(
                        "px-2 py-1 text-xs border-l transition-colors",
                        hasUpvoted ? "border-accent text-accent" : "border-line text-muted"
                    )}>
                        {upvoteCount}
                    </span>
                </button>
            </div>
        </div>
    );
}