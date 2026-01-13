import { Hono } from "hono";
import { db, eq } from "@once/database";
import { stories, protagonists, scenes } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { requireAuth } from "@/middleware/auth";
import { forkStory } from "@once/core";

const forkRouter = new Hono();

forkRouter.post("/:id/fork", requireAuth, async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const sceneId = body.sceneId;

    if (!sceneId || typeof sceneId !== "number") {
        return error(c, "VALIDATION_ERROR", "sceneId is required");
    }

    const originalStory = await db.query.stories.findFirst({
        where: eq(stories.id, storyId)
    })

    if (!originalStory) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user")!;

    if (originalStory.userId !== user.id) {
        if (originalStory.visibility !== "public" || !originalStory.allowForking) {
            return error(c, "FORBIDDEN", "This story does not allow forking");
        }
    }

    const forkScene = await db.query.scenes.findFirst({
        where: eq(scenes.id, sceneId)
    })

    if (!forkScene || forkScene.storyId !== storyId) {
        return error(c, "NOT_FOUND", "Scene not found in this story")
    }

    try {

        const { storyWithRelations } = await forkStory({
            originalStory,
            sceneId,
            storyId,
            user,
            forkScene
        })

        return success(c, storyWithRelations, 201);

    } catch (err) {
        console.error("Fork error:", err);
        return error(c, "INTERNAL_ERROR", "Failed to fork story");
    }
})

export default forkRouter;
