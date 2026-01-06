import { Hono } from "hono";
import { db, eq, and } from "@once/database";
import { stories, storyUpvotes, storySuggestions } from "@once/database";
import { success, error } from "@/lib/response";
import { requireAuth } from "@/middleware/auth";
import { noteSchema } from "@once/shared";

const social = new Hono();

social.post("/:id/upvote", requireAuth, async (c) => {
    const storyId = parseInt(c.req.param("id"))
    const user = c.get("user");

    if (!user) return error(c, "UNAUTHORIZED");

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId)
    });

    if (!story) return error(c, "NOT_FOUND", "Story not found");

    if (story.visibility !== "public" && story.userId !== user.id) {
        return error(c, "FORBIDDEN", "Cannot upvote private stories");
    }

    const existingUpvote = await db.query.storyUpvotes.findFirst({
        where: and(
            eq(storyUpvotes.storyId, storyId),
            eq(storyUpvotes.userId, user.id)
        ),
    });

    if (existingUpvote) {
        await db.delete(storyUpvotes).where(eq(storyUpvotes.id, existingUpvote.id));

        await db.update(stories)
            .set({ upvotes: story.upvotes - 1 })
            .where(eq(stories.id, storyId));

        return success(c, { upvoted: false, upvotes: story.upvotes - 1 });
    } else {

        await db.insert(storyUpvotes).values({
            storyId,
            userId: user.id,
        });

        await db.update(stories)
            .set({ upvotes: story.upvotes + 1 })
            .where(eq(stories.id, storyId));

        return success(c, { upvoted: true, upvotes: story.upvotes + 1 });
    }
});

social.post("/:id/notes", requireAuth, async (c) => {
    const storyId = parseInt(c.req.param("id"));
    const user = c.get("user");

    if (!user) return error(c, "UNAUTHORIZED");

    const body = await c.req.json();
    const result = noteSchema.safeParse(body);

    if (!result.success) {
        return error(c, "VALIDATION_ERROR", result.error.errors[0].message);
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
    });

    if (!story) {
        return error(c, "NOT_FOUND", "Story not found");
    }

    if (story.visibility !== "public" && story.userId !== user.id) {
        return error(c, "FORBIDDEN", "Cannot add notes to private stories");
    }

    const [note] = await db.insert(storySuggestions).values({
        storyId,
        userId: user.id,
        content: result.data.content,
        isPublic: result.data.isPublic,
    }).returning();

    return success(c, note, 201);
});
export default social;