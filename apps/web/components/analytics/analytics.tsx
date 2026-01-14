"use client";

import { useEffect, useState } from "react";
import { storiesApi } from "@/lib/api";
import type { Analytics as AnalyticsData } from "@once/shared";
import { ArrowUp, MessageSquare, GitFork, BookOpen } from "lucide-react";

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await storiesApi.getAnalytics();
      if (response.data) setData(response.data);
      setIsLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <>
        <div className="bg-background p-4 md:p-8 text-muted">
          Loading analytics...
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <div className="bg-background p-4 md:p-8 text-muted">
          Failed to load analytics.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-background">
        <header className="dotted-border-b px-4 md:px-8 py-6">
          <h1 className="text-2xl text-foreground">Your Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Stats for your published stories
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-8 dotted-border-b">
          <StatCard
            icon={ArrowUp}
            label="Upvotes"
            value={data.totals.upvotes}
          />
          <StatCard
            icon={MessageSquare}
            label="Notes"
            value={data.totals.notes}
          />
          <StatCard icon={GitFork} label="Forks" value={data.totals.forks} />
          <StatCard
            icon={BookOpen}
            label="Published"
            value={data.totals.published}
          />
        </div>

        <div className="p-4 md:p-8">
          <h2 className="text-lg text-foreground mb-4">Published Stories</h2>
          <div className="space-y-3">
            {data.stories.map((story) => (
              <div
                key={story.id}
                className="border border-line bg-surface p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
              >
                <div className="min-w-0">
                  <h3 className="text-foreground truncate">{story.title}</h3>
                  <p className="text-sm text-muted">{story.turnCount} scenes</p>
                </div>
                <div className="flex gap-4 text-sm text-muted shrink-0">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="size-3" /> {story.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3" /> {story.notesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="size-3" /> {story.forkCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.recentNotes.length > 0 && (
          <div className="p-4 md:p-8 border-t border-line">
            <h2 className="text-lg text-foreground mb-4">Recent Notes</h2>
            <div className="space-y-3">
              {data.recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="border border-line bg-surface p-4"
                >
                  <p className="text-foreground">{note.content}</p>
                  <p className="text-sm text-muted mt-2">
                    on {note.storyTitle} •{" "}
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-line bg-surface p-4 text-center">
      <Icon className="size-5 mx-auto text-muted mb-2" />
      <p className="text-2xl text-foreground">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
