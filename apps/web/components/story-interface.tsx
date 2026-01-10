"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import FontDropdown from "./font-dropdown";
import { SketchyBar } from "@/components/sketchy-bar";
import { BookOpen, User, Wand } from "lucide-react";
import MobileDrawer from "./mobile-drawer";
import { storiesApi } from "@/lib/api";
import type { Story, Scene, Protagonist, CodexEntry } from "@once/shared";


export function StoryInterface({ storyId }: { storyId: string }) {
    const [showCodex, setShowCodex] = useState(false);
    const [showProtagonist, setShowProtagonist] = useState(false);

    const [story, setStory] = useState<Story | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [codex, setCodex] = useState<CodexEntry[]>([]);
    const [protagonists, setProtagonists] = useState<Protagonist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isContinuing, setIsContinuing] = useState(false);
    const [pendingScene, setPendingScene] = useState<{ userAction: string; narration: string } | null>(null);

    const storyMode = story?.storyMode;
    const activeProtagonist = protagonists.find(p => p.isActive) || null;

    useEffect(() => {
        const fetchData = async () => {
            const [storyRes, scenesRes, codexRes] = await Promise.all([
                storiesApi.get(storyId),
                storiesApi.getScenes(storyId),
                storiesApi.getCodex(storyId),
            ]);

            if (storyRes.data) {
                setStory(storyRes.data);
                if (storyRes.data.protagonist) {
                    setProtagonists(storyRes.data.protagonist);
                }
            }
            if (scenesRes.data) setScenes(scenesRes.data);
            if (codexRes.data) setCodex(codexRes.data);

            setIsLoading(false);
        };

        fetchData();
    }, [storyId]);

    const handleContinue = async (action: string) => {
        setIsContinuing(true);

        setPendingScene({ userAction: action, narration: "" });

        let streamedNarration = ""

        await storiesApi.continueStream(storyId, action, (chunk) => {
            streamedNarration += chunk;
            setPendingScene({ userAction: action, narration: streamedNarration });
        },
            async (data) => {
                const newScene: Scene = {
                    id: data.scene.sceneId,
                    storyId: parseInt(storyId),
                    userAction: action,
                    narration: streamedNarration,
                    turnNumber: scenes.length + 1,
                    mood: data.scene.mood,
                    protagonistId: data.scene.protagonistId,
                    createdAt: data.scene.createdAt
                }

                setScenes(prev => [...prev, newScene]);


                if (data.protagonistSnapshot) {
                    const snapshot = data.protagonistSnapshot;
                    setProtagonists(prev => prev.map(p => p.isActive ? {
                        ...p,
                        health: (snapshot.health as number) ?? p.health,
                        energy: (snapshot.energy as number) ?? p.energy,
                        currentLocation: (snapshot.currentLocation as string) ?? p.currentLocation,
                        currentTraits: (snapshot.currentTraits as string[]) ?? p.currentTraits,
                        inventory: (snapshot.inventory as string[]) ?? p.inventory,
                        scars: (snapshot.scars as string[]) ?? p.scars,
                    } : p));
                }

                setPendingScene(null);
            },
            (codexData) => {
                if (codexData.complete) {
                    storiesApi.getCodex(storyId).then(res => {
                        if (res.data) setCodex(res.data)
                    })
                }
            }
        )
        setIsContinuing(false);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-muted">Loading story...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="flex h-14 items-center justify-center dotted-border-b gap-2 md:gap-4">
                <button
                    onClick={() => setShowCodex(true)}
                    className="lg:hidden text-muted hover:text-foreground cursor-pointer"
                >
                    <BookOpen className="size-5" />
                </button>
                <div className="flex items-center gap-5">
                    <h1 className="text-lg text-foreground">{story?.title || "Loading..."}</h1>
                    <FontDropdown />
                </div>
                {storyMode === "protagonist" && activeProtagonist && (
                    <button
                        onClick={() => setShowProtagonist(true)}
                        className="lg:hidden text-muted hover:text-foreground cursor-pointer"
                    >
                        <User className="size-5" />
                    </button>
                )}
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden lg:block w-56 shrink-0 overflow-y-auto px-8 py-4 dotted-border-r">
                    <CodexSidebar codex={codex} protagonistName={storyMode === "protagonist" ? activeProtagonist?.name : undefined} />
                </aside>

                <MobileDrawer className="py-4 px-8" open={showCodex} onClose={() => setShowCodex(false)} side="left">
                    <CodexSidebar codex={codex} protagonistName={storyMode === "protagonist" ? activeProtagonist?.name : undefined} />
                </MobileDrawer>

                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="mx-auto max-w-3xl">
                            <StoryNarration scenes={scenes} pendingScene={pendingScene} />
                        </div>
                    </div>

                    <div className="dotted-line-horizontal p-4">
                        <ActionInput onSubmit={handleContinue} isLoading={isContinuing} />
                    </div>
                </main>

                {storyMode === "protagonist" && activeProtagonist && (
                    <aside className="hidden lg:block w-56 shrink-0 overflow-y-auto p-4 border-r-0 dotted-border-l">
                        <ProtagonistSidebar protagonist={activeProtagonist} />
                    </aside>
                )}

                {storyMode === "protagonist" && activeProtagonist && (
                    <MobileDrawer className="py-4 px-8" open={showProtagonist} onClose={() => setShowProtagonist(false)} side="right">
                        <ProtagonistSidebar protagonist={activeProtagonist} />
                    </MobileDrawer>
                )}
            </div>
        </div >
    );
}


function CodexSidebar({ codex, protagonistName }: { codex: CodexEntry[]; protagonistName?: string }) {
    const characters = codex.filter(c => c.entryType === "character");
    const locations = codex.filter(c => c.entryType === "location");

    return (
        <div className="space-y-6">
            <SidebarSection title="CHARACTERS">
                {characters.map((character) => (
                    <SidebarItem
                        key={character.id}
                        highlighted={protagonistName === character.name}
                    >
                        {character.name}
                    </SidebarItem>
                ))}
            </SidebarSection>
            <SidebarSection title="LOCATIONS">
                {locations.map((location) => (
                    <SidebarItem key={location.id}>{location.name}</SidebarItem>
                ))}
            </SidebarSection>
        </div>
    );
}

function ProtagonistSidebar({ protagonist }: { protagonist?: Protagonist }) {
    if (!protagonist) return null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-base text-foreground">{protagonist.name}</h2>
                <div className="mt-1 h-px w-full bg-line" />
            </div>

            <SidebarSection title="HEALTH">
                <SketchyBar value={protagonist.health} max={100} />
            </SidebarSection>

            <SidebarSection title="ENERGY">
                <SketchyBar value={protagonist.energy} max={100} />
            </SidebarSection>

            <SidebarSection title="LOCATION">
                <p className="text-sm text-foreground">{protagonist.currentLocation}</p>
            </SidebarSection>

            <SidebarSection title="TRAITS">
                {protagonist.currentTraits.map((trait, index) => (
                    <SidebarItem key={index}>{trait}</SidebarItem>
                ))}
            </SidebarSection>

            <SidebarSection title="INVENTORY">
                {protagonist.inventory.map((item, index) => (
                    <SidebarItem key={index}>{item}</SidebarItem>
                ))}
            </SidebarSection>
        </div>
    );
}

function StoryNarration({ scenes, pendingScene }: { scenes: Scene[], pendingScene?: { userAction: string, narration: string } | null }) {
    return (
        <div className="space-y-6" data-lenis-prevent>
            {scenes.map((scene) => (
                <div key={scene.id}>
                    {scene.userAction !== "[STORY_START]" && (
                        <p className="text-accent italic mb-2">{scene.userAction}</p>
                    )}
                    <div className="text-foreground whitespace-pre-line">{scene.narration}</div>
                </div>
            ))}
            {pendingScene && (
                <div>
                    <p className="text-accent italic mb-2">{pendingScene.userAction}</p>
                    <div className="text-foreground whitespace-pre-line">
                        {pendingScene.narration || <span className="text-muted">...</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionInput({ onSubmit, isLoading }: { onSubmit: (action: string) => void; isLoading: boolean }) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    const handleSubmit = () => {
        if (!value.trim() || isLoading) return;
        onSubmit(value.trim());
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
            <div className="rounded-lg border border-line bg-surface p-3 flex gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What next?"
                    rows={1}
                    disabled={isLoading}
                    className="max-h-[200px] w-full resize-none bg-transparent text-foreground placeholder:text-muted placeholder:italic focus:outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || isLoading}
                    className="w-10 h-10 shrink-0 flex items-center justify-center border border-line text-muted rounded-md hover:text-foreground hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    {isLoading ? "..." : <Wand className="size-5" />}
                </button>
            </div>
        </div>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs uppercase tracking-wider text-muted">{title}</h3>
            <div className="mt-2 space-y-1">{children}</div>
        </div>
    );
}

function SidebarItem({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
    return (
        <p className={cn(
            "text-sm hover:text-foreground hover:underline cursor-pointer transition-colors",
            highlighted ? "text-accent font-medium" : "text-foreground/80"
        )}>
            · {children}
        </p>
    );
}