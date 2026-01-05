"use client";
import React from "react";

interface StoryInterfaceProps {
    storyId: string;
}

export function StoryInterface({ storyId }: StoryInterfaceProps) {
    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Header */}
            <header className="flex h-14 items-center justify-center dotted-border-b">
                <h1 className="font-serif text-lg text-foreground">Story Title</h1>
            </header>

            {/* Three-column layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Codex */}
                <aside className="w-56 shrink-0 overflow-y-auto p-4 dotted-border-r">
                    <CodexSidebar />
                </aside>

                {/* Center - Story */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="mx-auto max-w-[650px]">
                            <StoryNarration />
                        </div>
                    </div>

                    {/* Action Input */}
                    <div className="dotted-line-horizontal p-4">
                        <ActionInput />
                    </div>
                </main>

                {/* Right Sidebar - Protagonist */}
                <aside className="w-56 shrink-0 overflow-y-auto p-4 border-r-0 dotted-border-l">
                    <ProtagonistSidebar />
                </aside>
            </div>
        </div >
    );
}

// Placeholder components - we'll build these next
function CodexSidebar() {
    return (
        <div className="space-y-6">
            <SidebarSection title="CHARACTERS">
                <SidebarItem>Kira (protagonist)</SidebarItem>
                <SidebarItem>The Merchant</SidebarItem>
                <SidebarItem>Sister Vela</SidebarItem>
            </SidebarSection>
            <SidebarSection title="LOCATIONS">
                <SidebarItem>The Chapel</SidebarItem>
                <SidebarItem>Thornwood Forest</SidebarItem>
            </SidebarSection>
        </div>
    );
}

function ProtagonistSidebar() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-serif text-base text-foreground">Kira</h2>
                <div className="mt-1 h-px w-full bg-line" />
            </div>

            <SidebarSection title="HEALTH">
                <StatBar value={8} max={10} />
            </SidebarSection>

            <SidebarSection title="ENERGY">
                <StatBar value={4} max={10} />
            </SidebarSection>

            <SidebarSection title="LOCATION">
                <p className="text-sm text-foreground">The Chapel</p>
            </SidebarSection>

            <SidebarSection title="TRAITS">
                <SidebarItem>cautious</SidebarItem>
                <SidebarItem>guilt-ridden</SidebarItem>
            </SidebarSection>

            <SidebarSection title="INVENTORY">
                <SidebarItem>rusted key</SidebarItem>
                <SidebarItem>torn letter</SidebarItem>
            </SidebarSection>
        </div>
    );
}

function StoryNarration() {
    return (
        <div className="font-serif text-lg text-foreground leading-[1.9]">
            <p className="mb-6">
                You step into the crumbling chapel. The light through stained glass falls in shards
                across the altar, painting the dust-thick air in fragments of crimson and gold.
            </p>
            <p className="mb-6">
                The merchant's words echo in your mind: "She went to pray. That was three days ago."
            </p>
            <p>
                At the far end, past rows of rotting pews, you see a shape huddled beneath the stone
                figure of a forgotten saint. It doesn't move.
            </p>
        </div>
    );
}

function ActionInput() {
    const [value, setValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    React.useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="mx-auto w-full max-w-2xl px-4 pb-6">
            <div className="rounded-lg border border-line bg-surface p-3">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="What do you do?"
                    rows={1}
                    className="w-full resize-none bg-transparent text-foreground placeholder:text-muted placeholder:italic focus:outline-none"
                    style={{ maxHeight: "200px" }}
                />
            </div>
        </div>
    );
}

// Reusable sidebar components
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted">{title}</h3>
            <div className="mt-2 space-y-1">{children}</div>
        </div>
    );
}

function SidebarItem({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm text-foreground/80 hover:text-foreground hover:underline cursor-pointer transition-colors">
            · {children}
        </p>
    );
}

function StatBar({ value, max }: { value: number; max: number }) {
    const filled = Math.round((value / max) * 10);
    const empty = 10 - filled;
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground">
                {"█".repeat(filled)}{"░".repeat(empty)}
            </span>
            <span className="font-mono text-xs text-muted">{value}/{max}</span>
        </div>
    );
}