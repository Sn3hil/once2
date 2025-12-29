import { Hono } from "hono";
import { db, eq, and } from "@once/database";
import { stories, deferredCharacters } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { createDeferredCharacterSchema } from "@once/shared/schemas";
import { requireAuth } from "@/middleware/auth";

const deferredRouter = new Hono();

deferredRouter.get("/:id/deferred-characters", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) {
        return error(c, "FORBIDDEN", "You don't have access to this story");
    }

    const characters = await db.query.deferredCharacters.findMany({
        where: eq(deferredCharacters.storyId, id),
        with: { vaultCharacter: true }
    })

    return success(c, characters);
})

deferredRouter.post("/:id/deferred-characters", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) {
        return error(c, "FORBIDDEN", "You don't have access to this story");
    }

    const body = await c.req.json();
    const parsed = createDeferredCharacterSchema.safeParse(body);

    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    // const story = await db.query.stories.findFirst({ where: eq(stories.id, storyId) });

    // if (!story) return error(c, "NOT_FOUND", "Story not found");

    const [newCharacter] = await db.insert(deferredCharacters).values({
        storyId: id,
        ...parsed.data
    }).returning();

    return success(c, newCharacter, 201);
})

deferredRouter.delete("/:id/deferred-characters/:characterId", requireAuth, async (c) => {
    const storyId = Number(c.req.param("id"));
    const characterId = Number(c.req.param("characterId"));
    if (isNaN(storyId) || isNaN(characterId)) return error(c, "INVALID_ID");

    const story = await db.query.stories.findFirst({ where: eq(stories.id, storyId) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) {
        return error(c, "FORBIDDEN", "You don't have access to this story");
    }

    const [deleted] = await db.delete(deferredCharacters).where(
        and(
            eq(deferredCharacters.id, characterId),
            eq(deferredCharacters.storyId, storyId)
        )
    ).returning();

    if (!deleted) return error(c, "NOT_FOUND", "Character not found");
    return success(c, { message: "Deferred character removed" });

})

export default deferredRouter;
