import { Hono } from "hono";
import { db, eq } from "@once/database";
import { scenes, codexEntries, echoes } from "@once/database/schema";
import { success, error } from "@/lib/response";

const scenesRouter = new Hono();

scenesRouter.get("/:id/scenes", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyScenes = await db.query.scenes.findMany({
        where: eq(scenes.storyId, id),
        orderBy: scenes.turnNumber,
    });

    return success(c, storyScenes);
});

scenesRouter.get("/:id/codex", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyCodex = await db.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, id),
    });

    return success(c, storyCodex);
});

scenesRouter.get("/:id/echoes", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyEchoes = await db.query.echoes.findMany({
        where: eq(echoes.storyId, id),
    });

    return success(c, storyEchoes);
});

export default scenesRouter;
