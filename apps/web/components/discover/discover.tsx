"use client";

import React, { useState, useEffect } from "react";
import { PublicStoryCard } from "./public-story-card";
import { Flame, TrendingUp, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavHeader } from "../nav-header";
import MobileDrawer from "../mobile-drawer";
import { storiesApi } from "@/lib/api";

const genres = ["All", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller", "Literary"];

const trendingTags = ["grimdark", "time-loop", "redemption", "betrayal", "survival"];

export function Discover() {

    const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
    const [selectedGenre, setSelectedGenre] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            const response = await storiesApi.discover();
            if (response.data) {
                setStories(response.data);
            }
            setIsLoading(false);
        };
        fetchStories();
    }, []);

    return (
        <>
            <NavHeader />
            <div className="h-screen flex flex-col bg-background pt-14">
                <header className="dotted-border-b px-4 md:px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl text-foreground">Discover</h1>
                        <p className="mt-1 text-sm text-muted">Public stories from the community</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-line text-muted hover:text-foreground cursor-pointer"
                    >
                        <Filter className="size-4" />
                        <span className="text-sm">Filters</span>
                    </button>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="hidden lg:block w-56 shrink-0 dotted-border-r py-4 px-4 md:px-8 overflow-y-auto">
                        <SidebarSection title="Sort By">
                            <div className="space-y-1">
                                <SortButton
                                    active={sortBy === "hot"}
                                    onClick={() => setSortBy("hot")}
                                    icon={<Flame className="size-4" />}
                                    label="Hot"
                                />
                                <SortButton
                                    active={sortBy === "new"}
                                    onClick={() => setSortBy("new")}
                                    icon={<Clock className="size-4" />}
                                    label="New"
                                />
                                <SortButton
                                    active={sortBy === "top"}
                                    onClick={() => setSortBy("top")}
                                    icon={<TrendingUp className="size-4" />}
                                    label="Top"
                                />
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Genre">
                            <div className="space-y-1">
                                {genres.map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={cn(
                                            "w-full text-left px-2 py-1 text-sm transition-colors cursor-pointer",
                                            selectedGenre === genre
                                                ? "text-accent"
                                                : "text-muted hover:text-foreground"
                                        )}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </SidebarSection>
                    </aside>

                    <MobileDrawer
                        className="py-4 px-6"
                        open={showFilters}
                        onClose={() => setShowFilters(false)}
                        side="left"
                    >
                        <SidebarSection title="Sort By">
                            <div className="space-y-1">
                                <SortButton active={sortBy === "hot"} onClick={() => setSortBy("hot")} icon={<Flame className="size-4" />} label="Hot" />
                                <SortButton active={sortBy === "new"} onClick={() => setSortBy("new")} icon={<Clock className="size-4" />} label="New" />
                                <SortButton active={sortBy === "top"} onClick={() => setSortBy("top")} icon={<TrendingUp className="size-4" />} label="Top" />
                            </div>
                        </SidebarSection>
                        <SidebarSection title="Genre">
                            <div className="space-y-1">
                                {genres.map((genre) => (
                                    <button
                                        key={genre}
                                        onClick={() => { setSelectedGenre(genre); setShowFilters(false); }}
                                        className={cn(
                                            "w-full text-left px-2 py-1 text-sm transition-colors cursor-pointer",
                                            selectedGenre === genre ? "text-accent" : "text-muted hover:text-foreground"
                                        )}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </SidebarSection>
                    </MobileDrawer>

                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {isLoading ? (
                                <p className="text-muted text-center py-8">Loading stories...</p>
                            ) : stories.length === 0 ? (
                                <p className="text-muted text-center py-8">No public stories yet</p>
                            ) : (
                                stories.map((story) => (
                                    <PublicStoryCard key={story.id} story={story} />
                                ))
                            )}
                        </div>
                    </main>

                    <aside className="hidden xl:block w-72 shrink-0 dotted-border-l p-4 overflow-y-auto">
                        <SidebarSection title="Community Stats">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Stories Published</span>
                                    <span className="text-foreground">1,247</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Active Writers</span>
                                    <span className="text-foreground">892</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Words Written Today</span>
                                    <span className="text-foreground">48.2k</span>
                                </div>
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Trending Tags">
                            <div className="flex flex-wrap gap-2">
                                {trendingTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 text-xs border border-line text-muted hover:text-foreground hover:border-foreground/50 cursor-pointer transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </SidebarSection>

                        <SidebarSection title="Top This Week">
                            <div className="space-y-3">
                                <MiniStory rank={1} title="The Hollow King" upvotes={234} />
                                <MiniStory rank={2} title="Signal in the Static" upvotes={189} />
                                <MiniStory rank={3} title="Blood & Clockwork" upvotes={156} />
                            </div>
                        </SidebarSection>
                    </aside>
                </div>
            </div>
        </>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-muted mb-3">{title}</h3>
            {children}
        </div>
    );
}

function SortButton({
    active,
    onClick,
    icon,
    label
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm transition-colors cursor-pointer",
                active ? "text-accent" : "text-muted hover:text-foreground"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function MiniStory({ rank, title, upvotes }: { rank: number; title: string; upvotes: number }) {
    return (
        <div className="flex items-start gap-2">
            <span className="text-xs text-muted w-4">{rank}.</span>
            <div className="flex-1">
                <p className="text-sm text-foreground hover:underline cursor-pointer">{title}</p>
                <p className="text-xs text-muted">{upvotes} upvotes</p>
            </div>
        </div>
    );
}