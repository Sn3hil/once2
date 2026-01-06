import { Hono } from "hono";
import { db, eq } from "@once/database";
import { scenes, codexEntries, echoes, stories } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { requireAuth, type AuthVariables } from "@/middleware/auth";

const scenesRouter = new Hono<{ Variables: AuthVariables }>();

scenesRouter.get("/:id/scenes", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    const isOwner = user && story.userId === user.id;
    const isPublic = story.visibility === "public";

    if (!isOwner && !isPublic) {
        return error(c, "FORBIDDEN", "This story is private");
    }

    const storyScenes = await db.query.scenes.findMany({
        where: eq(scenes.storyId, id),
        orderBy: scenes.turnNumber,
    });

    return success(c, storyScenes);
});

scenesRouter.get("/:id/codex", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) {
        return error(c, "FORBIDDEN", "This story is private");
    }

    const storyCodex = await db.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, id),
    });

    return success(c, storyCodex);
});

scenesRouter.get("/:id/echoes", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) {
        return error(c, "FORBIDDEN", "You can only view echoes of your own stories");
    }

    const storyEchoes = await db.query.echoes.findMany({
        where: eq(echoes.storyId, id),
    });

    return success(c, storyEchoes);
});

export default scenesRouter;
