"use client";

import React, { useEffect, useState } from "react";
import { StoryCard } from "./story-card";
import { cn } from "@/lib/utils";
import { NavHeader } from "../nav-header";
import { storiesApi } from "@/lib/api";
import type { Story } from "@once/shared";
import { toast } from "sonner";


export function Library() {
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            const response = await storiesApi.list();
            if (response.data) setStories(response.data);
            setIsLoading(false);
        };

        fetchStories();
    }, []);

    const handleDelete = (id: number) => {
        setStories(prev => prev.filter(s => s.id !== id));
        toast.success("Story Deleted");
    }

    const filteredStories = stories.filter((s) =>
        filter === "all" ? true : s.status === filter
    );

    return (
        <>
            <div className="min-h-screen bg-background">
                <header className="dotted-border-b px-4 md:px-8 py-6">
                    <h1 className="text-2xl text-foreground">Your Library</h1>
                    <p className="mt-1 text-sm text-muted">Stories you've begun</p>
                </header>

                <div className="flex gap-4 px-4 md:px-8 py-4 dotted-border-b">
                    {(["all", "active", "completed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn("text-sm capitalize transition-colors cursor-pointer", filter === f ? "text-foreground" : "text-muted hover:text-foreground")}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-muted">Loading stories...</div>
                ) : filteredStories.length === 0 ? (
                    <div className="p-8 text-center text-muted">No stories yet. Create your first story!</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 p-4 md:p-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredStories.map((story) => (
                            <StoryCard key={story.id} story={story} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div >
        </>
    );
}