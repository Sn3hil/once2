import { Hono } from "hono";
import { db, eq, and } from "@once/database";
import { stories, protagonists } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { createProtagonistSchema, updateProtagonistSchema } from "@once/shared/schemas";

const protagonistsRouter = new Hono();

protagonistsRouter.get("/:id/protagonists", async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyProtagonists = await db.query.protagonists.findMany({
        where: eq(protagonists.storyId, id),
    });

    return success(c, storyProtagonists);
});

protagonistsRouter.post("/:id/protagonists", async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const parsed = createProtagonistSchema.safeParse(body);

    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const story = await db.query.stories.findFirst({ where: eq(stories.id, storyId) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    if (story.storyMode !== "protagonist") {
        return error(c, "VALIDATION_ERROR", "Cannot add protagonist to narrator mode story");
    }

    const [newProtagonist] = await db.insert(protagonists).values({
        storyId,
        name: parsed.data.name,
        description: parsed.data.description,
        currentLocation: parsed.data.location,
        baseTraits: parsed.data.traits,
        currentTraits: parsed.data.traits,
        isActive: false,
    }).returning();
    return success(c, newProtagonist, 201);
})

protagonistsRouter.patch("/:id/protagonists/:pid", async (c) => {
    const storyId = Number(c.req.param("id"));
    const protagonistId = Number(c.req.param("pid"));
    if (isNaN(storyId) || isNaN(protagonistId)) return error(c, "INVALID_ID");

    const body = await c.req.json();

    const parsed = updateProtagonistSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.health !== undefined) updateData.health = parsed.data.health;
    if (parsed.data.energy !== undefined) updateData.energy = parsed.data.energy;
    if (parsed.data.location) updateData.currentLocation = parsed.data.location;

    const [updated] = await db.update(protagonists)
        .set(updateData)
        .where(and(
            eq(protagonists.id, protagonistId),
            eq(protagonists.storyId, storyId)
        ))
        .returning();

    if (!updated) return error(c, "NOT_FOUND", "Protagonist not found");
    return success(c, updated);
});

protagonistsRouter.post("/:id/protagonists/:pid/activate", async (c) => {
    const storyId = Number(c.req.param("id"));
    const protagonistId = Number(c.req.param("pid"));
    if (isNaN(storyId) || isNaN(protagonistId)) return error(c, "INVALID_ID");

    const protagonist = await db.query.protagonists.findFirst({
        where: and(
            eq(protagonists.id, protagonistId),
            eq(protagonists.storyId, storyId)
        )
    });

    if (!protagonist) return error(c, "NOT_FOUND", "Protagonist not found");

    await db.update(protagonists)
        .set({ isActive: false })
        .where(eq(protagonists.storyId, storyId));

    const [activated] = await db.update(protagonists)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(protagonists.id, protagonistId))
        .returning();
    return success(c, activated);
});

export default protagonistsRouter;
