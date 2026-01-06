"use client";

import React, { useState, useEffect } from "react";
import { ArrowBigUp, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { ForkDialog } from "./fork-dialog";
import { GitFork } from "lucide-react";
import { cn, formatAuthorName } from "@/lib/utils";
import { NoteDialog } from "./note-dialog";
import { Mail } from "lucide-react";
import { useUpvote } from "@/hooks/use-upvote";
import { storiesApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Story, Scene } from "@once/shared"

export function StoryReader({ storyId }: { storyId: string }) {

    const router = useRouter();

    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [showForkDialog, setShowForkDialog] = useState(false);

    const [story, setStory] = useState<Story | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { hasUpvoted, upvoteCount, isUpvoting, toggleUpvote } = useUpvote({
        storyId: storyId,
        initialUpvotes: story?.upvotes ?? 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            const [storyRes, scenesRes] = await Promise.all([
                storiesApi.get(storyId),
                storiesApi.getScenes(storyId),
            ]);

            if (storyRes.data) setStory(storyRes.data);
            if (scenesRes.data) setScenes(scenesRes.data);
            setIsLoading(false);
        };
        fetchData();
    }, [storyId]);

    const handleFork = async (sceneNumber: number) => {
        const scene = scenes.find(s => s.turnNumber === sceneNumber);

        if (!scene) return;

        const response = await storiesApi.fork(storyId, scene.id);

        if (response.error) {
            toast.error(response.error.message);
        } else if (response.data) {
            toast.success("Story forked!");
            router.push(`/story/${response.data.id}`);
        }

        setShowForkDialog(false);
    };

    if (isLoading || !story) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <p className="text-muted">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="dotted-border-b px-4 md:px-6 py-3 md:py-4 flex items-center gap-4">
                <Link href="/discover" className="text-muted hover:text-foreground transition-colors shrink-0">
                    <ArrowLeft className="size-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-xs sm:text-base md:text-lg text-foreground">{story.title}</h1>
                    <p className="text-xs text-muted flex items-center gap-2">
                        {story.user?.name &&
                            <>
                                <User className="size-3 shrink-0" />
                                <span className="truncate">{formatAuthorName(story.user.name)}</span>
                                <span className="opacity-40 hidden sm:inline">·</span>
                            </>
                        }
                        <span className="hidden sm:inline">{story.genre}</span>
                    </p>
                </div>

                <div className="flex items-center gap-1 md:gap-2 shrink-0">
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
                            "px-2 py-1 text-xs border-l hidden sm:inline transition-colors",
                            hasUpvoted ? "border-accent text-accent" : "border-line text-muted"
                        )}>
                            {upvoteCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowNoteDialog(true)}
                        className="flex items-center gap-1 px-2 py-1 border border-line rounded-lg text-muted hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                    >
                        <Mail className="size-4" />
                        <span className="text-xs hidden sm:inline">Note</span>
                    </button>

                    {story.allowForking && (
                        <button
                            onClick={() => setShowForkDialog(true)}
                            className="flex items-center gap-1 px-2 py-1 border border-line rounded-lg text-muted hover:text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
                        >
                            <GitFork className="size-4" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto" data-lenis-prevent>
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <div className="mb-8 p-4 border border-line bg-surface">
                        <p className="text-sm text-muted">Playing as</p>
                        <p className="text-lg text-foreground">{story.protagonist?.[0].name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {story.protagonist?.[0].currentTraits?.map((trait) => (
                                <span key={trait} className="text-xs text-muted border border-line px-2 py-0.5">
                                    {trait}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {scenes.map((scene, index) => (
                            <Scene key={scene.turnNumber} scene={scene} isFirst={index === 0} />
                        ))}
                    </div>
                </div>
            </main>

            <NoteDialog
                open={showNoteDialog}
                onClose={() => setShowNoteDialog(false)}
                storyId={storyId}
                storyTitle={story.title}
            />

            <ForkDialog
                open={showForkDialog}
                onClose={() => setShowForkDialog(false)}
                onFork={handleFork}
                scenes={scenes}
                storyTitle={story.title}
            />
        </div>
    );
}

function Scene({
    scene,
    isFirst
}: {
    scene: { turnNumber: number; userAction: string; narration: string };
    isFirst: boolean;
}) {
    return (
        <div>
            {/* User action (skip for first scene) */}
            {!isFirst && scene.userAction !== "[STORY_START]" && (
                <div className="mb-4 pl-4 border-l-2 border-accent">
                    <p className="text-sm text-accent italic">{scene.userAction}</p>
                </div>
            )}

            <div className="text-foreground leading-relaxed whitespace-pre-line">
                {scene.narration}
            </div>
        </div>
    );
}