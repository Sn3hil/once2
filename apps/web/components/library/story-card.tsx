import Link from "next/link";
import { BookOpen, Clock, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story } from "@once/shared";

export function StoryCard({ story }: { story: Story }) {
    const handleFork = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Navigate to fork view or open fork dialog
        console.log("Fork story:", story.id);
    };

    return (
        <div className="group h-full border border-line bg-surface p-5 transition-colors hover:border-foreground/30">
            <div className="flex items-center justify-between">
                <Link href={`/story/${story.id}`}>
                    <h2 className="text-lg text-foreground group-hover:underline">
                        {story.title}
                    </h2>
                </Link>
                <button
                    onClick={handleFork}
                    className="text-muted hover:text-foreground cursor-pointer"
                >
                    <GitFork className="size-5" />
                </button>
            </div>
            {story.protagonist?.[0]?.name && (
                <p className="mt-1 text-sm text-muted">
                    as <span className="text-foreground/80">{story.protagonist[0].name}</span>
                </p>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        {/* TODO: change icon later */}
                        <BookOpen className="size-3" />
                        {story.turnCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(story.updatedAt).toLocaleDateString()}
                    </span>
                </div>
                <span className={cn(story.status === "completed" ? "text-accent" : "text-muted/50")}>
                    {story.status === "completed" ? "Completed" : "In progress"}
                </span>
            </div>
        </div>
    );
}