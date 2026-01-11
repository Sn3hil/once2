"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Globe } from "lucide-react";
import type { NarrativeStance, StoryMode, SuggestedTrait } from "@once/shared/schemas";
import { createStorySchema, suggestedTraits } from "@once/shared/schemas";
import { NavHeader } from "../nav-header";
import { toast } from "sonner";
import { storiesApi } from "@/lib/api";
import { ConstellationLoader } from "../loader";



export function CreateStory() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [narrativeStance, setNarrativeStance] = useState<NarrativeStance>("heroic");
    const [storyMode, setStoryMode] = useState<StoryMode>("protagonist");
    const [storyIdea, setStoryIdea] = useState("")
    const [isCreating, setIsCreating] = useState(false);

    const [protagonistName, setProtagonistName] = useState("");
    const [protagonistLocation, setProtagonistLocation] = useState("");
    const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

    const toggleTrait = (trait: string) => {
        if (selectedTraits.includes(trait)) {
            setSelectedTraits(selectedTraits.filter(t => t !== trait));
        } else if (selectedTraits.length < 5) {
            setSelectedTraits([...selectedTraits, trait]);
        }
    };

    const handleCreate = async () => {
        const payload = {
            title,
            genre,
            narrativeStance,
            storyMode,
            storyIdea,
            ...(storyMode === "protagonist" && {
                protagonist: {
                    name: protagonistName,
                    location: protagonistLocation,
                    traits: selectedTraits,
                }
            })
        };

        const result = createStorySchema.safeParse(payload);

        if (!result.success) {
            const firstError = result.error.errors[0];
            toast.error(firstError.message);
            return;
        }

        setIsCreating(true);

        const response = await storiesApi.create(result.data);

        if (response.error) {
            toast.error(response.error.message);
            setIsCreating(false);
            return;
        }

        toast.success("Story created!");
        router.push(`/story/${response.data.id}`);
    };

    const isValid = title.trim() && genre.trim() &&
        (storyMode === "narrator" || (protagonistName.trim() && protagonistLocation.trim()));

    return (
        <>
            {isCreating && (
                <ConstellationLoader message="Crafting the beginning of your story..." />
            )}

            <div className="min-h-screen bg-background">
                <header className="dotted-border-b px-4 md:px-8 py-6">
                    <h1 className="text-2xl text-foreground">Begin a New Story</h1>
                    <p className="mt-1 text-sm text-muted">Every tale starts with a single word</p>
                </header>

                <div className="mx-auto max-w-2xl px-4 md:px-8 py-10 pb-30 space-y-8">
                    <FormField label="Story Title">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="The Chapel at Midnight..."
                            className="w-full border-b border-line bg-transparent py-2 text-lg text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Genre">
                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            placeholder="Dark Fantasy, Sci-Fi, Mystery..."
                            className="w-full border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Narrative Stance">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(["heroic", "grimdark", "grounded", "mythic", "noir"] as const).map((stance) => (
                                <button
                                    key={stance}
                                    onClick={() => setNarrativeStance(stance)}
                                    className={cn(
                                        "px-3 py-1 text-sm capitalize border transition-colors cursor-pointer",
                                        narrativeStance === stance
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-line text-muted hover:border-foreground/50"
                                    )}
                                >
                                    {stance}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <FormField label="Story Idea / Plot Hint">
                        <input
                            value={storyIdea}
                            onChange={(e) => setStoryIdea(e.target.value)}
                            placeholder="A disgraced knight seeks redemption..."
                            className="w-full border-b border-line bg-transparent p-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Story Mode">
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <ModeOption
                                selected={storyMode === "protagonist"}
                                onClick={() => setStoryMode("protagonist")}
                                icon={<User className="size-5" />}
                                title="Protagonist"
                                description="Control a character in the story"
                            />
                            <ModeOption
                                selected={storyMode === "narrator"}
                                onClick={() => setStoryMode("narrator")}
                                icon={<Globe className="size-5" />}
                                title="Narrator"
                                description="Guide events from above"
                            />
                        </div>
                    </FormField>

                    {storyMode === "protagonist" && (
                        <div className="space-y-6 border-l-2 border-line pl-6">
                            <FormField label="Protagonist Name">
                                <input
                                    type="text"
                                    value={protagonistName}
                                    onChange={(e) => setProtagonistName(e.target.value)}
                                    placeholder="Kira, Valen, Sera..."
                                    className="w-full border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                                />
                            </FormField>

                            <FormField label="Starting Location">
                                <input
                                    type="text"
                                    value={protagonistLocation}
                                    onChange={(e) => setProtagonistLocation(e.target.value)}
                                    placeholder="The Northern Keep, A dusty road..."
                                    className="w-full border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                                />
                            </FormField>

                            <FormField label={`Traits (${selectedTraits.length}/5)`}>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {suggestedTraits.map((trait) => (
                                        <button
                                            key={trait}
                                            onClick={() => toggleTrait(trait)}
                                            className={cn(
                                                "px-2 py-1 text-xs border transition-colors cursor-pointer",
                                                selectedTraits.includes(trait)
                                                    ? "border-accent bg-accent/10 text-accent"
                                                    : "border-line text-muted hover:border-foreground/50"
                                            )}
                                        >
                                            {trait}
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                        </div>
                    )}

                    <button
                        onClick={handleCreate}
                        disabled={!isValid || isCreating}
                        className={cn(
                            "w-full border border-line py-3 text-foreground transition-colors cursor-pointer",
                            "hover:border-foreground hover:bg-surface",
                            "disabled:cursor-not-allowed disabled:opacity-40"
                        )}
                    >
                        {isCreating ? "Crafting your story..." : "Begin Story"}
                    </button>
                </div>
            </div>
        </>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm text-muted">{label}</label>
            {children}
        </div>
    );
}

function ModeOption({
    selected,
    onClick,
    icon,
    title,
    description,
}: {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-start gap-2 border p-4 text-left transition-colors cursor-pointer",
                selected
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line hover:border-foreground/50"
            )}
        >
            <span className={cn(selected ? "text-foreground" : "text-muted")}>{icon}</span>
            <span className="text-sm text-foreground">{title}</span>
            <span className="text-xs text-muted">{description}</span>
        </button>
    );
}