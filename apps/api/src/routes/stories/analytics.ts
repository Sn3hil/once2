import { Hono } from "hono";
import { db, eq, and, inArray, desc } from "@once/database";
import { stories, storySuggestions } from "@once/database";
import { success, error } from "@/lib/response";
import { requireAuth, type AuthVariables } from "@/middleware/auth";

const analyticsRouter = new Hono<{ Variables: AuthVariables }>();

analyticsRouter.get('/analytics', requireAuth, async (c) => {
    const user = c.get("user")!;

    const userStories = await db.query.stories.findMany({
        where: and(
            eq(stories.userId, user.id),
            eq(stories.visibility, "public")
        )
    })

    const storyIds = userStories.map(s => s.id);

    const forkData = await db.query.stories.findMany({
        where: (s) => inArray(s.forkedFromStoryId, storyIds),
        columns: { id: true, forkedFromStoryId: true, title: true, userId: true }
    })

    const notes = await db.query.storySuggestions.findMany({
        where: (s) => inArray(s.storyId, storyIds),
        orderBy: (s) => [desc(s.createdAt)],
        limit: 10
    });

    const storiesWithStats = userStories.map(s => ({
        id: s.id,
        title: s.title,
        upvotes: s.upvotes,
        notesCount: notes.filter(n => n.storyId === s.id).length,
        forksCount: forkData.filter(f => f.forkedFromStoryId === s.id).length,
        turnCount: s.turnCount,
        createdAt: s.createdAt
    }))

    const totals = {
        upvotes: userStories.reduce((sum, s) => sum + s.upvotes, 0),
        notes: notes.length,
        forks: forkData.length,
        published: userStories.length
    }

    const recentNotes = notes.map(n => ({
        id: n.id,
        storyId: n.storyId,
        storyTitle: userStories.find(s => s.id === n.storyId)?.title || "Unknown",
        content: n.content,
        createdAt: n.createdAt
    }))

    return success(c, { totals, stories: storiesWithStats, recentNotes });
});

export default analyticsRouter;