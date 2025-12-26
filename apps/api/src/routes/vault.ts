import { Hono } from "hono";
import { db, eq } from "@once/database";
import { vaultCharacters, protagonists } from "@once/database/schema";
import { createVaultCharacterSchema, updateVaultCharacterSchema } from "@once/shared/schemas"
import { success, error } from "@/lib/response";

const vaultRouter = new Hono();

vaultRouter.post("/", async (c) => {
    const body = await c.req.json();
    const parsed = createVaultCharacterSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const testUserId = "test-user-1";
    const [newCharacter] = await db.insert(vaultCharacters).values({
        userId: testUserId,
        ...parsed.data,
    }).returning();

    return success(c, newCharacter, 201);
});

vaultRouter.patch("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const parsed = updateVaultCharacterSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const [updated] = await db.update(vaultCharacters).set(parsed.data).where(eq(vaultCharacters.id, id)).returning();
    if (!updated) return error(c, "NOT_FOUND", "Character not found");

    return success(c, updated);
});

vaultRouter.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const [deleted] = await db.delete(vaultCharacters).where(eq(vaultCharacters.id, id)).returning();
    if (!deleted) return error(c, "NOT_FOUND", "Character not found");

    return success(c, { message: "Character deleted" });
});

vaultRouter.post("/from-protagonist/:protagonistId", async (c) => {
    const protagonistId = Number(c.req.param("protagonistId"));
    if (isNaN(protagonistId)) return error(c, "INVALID_ID");

    const protagonist = await db.query.protagonists.findFirst({
        where: eq(protagonists.id, protagonistId),
    });

    if (!protagonist) return error(c, "PROTAGONIST_NOT_FOUND");

    const testUserId = "test-user-1";
    const [newCharacter] = await db.insert(vaultCharacters).values({
        userId: testUserId,
        name: protagonist.name,
        description: protagonist.description,
        traits: protagonist.currentTraits,
    }).returning();

    return success(c, newCharacter, 201);
});

vaultRouter.get("/", async (c) => {
    const testUserId = "test-user-1";

    const characters = await db.query.vaultCharacters.findMany({
        where: eq(vaultCharacters.userId, testUserId),
    });

    return success(c, characters);
});

vaultRouter.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const character = await db.query.vaultCharacters.findFirst({
        where: eq(vaultCharacters.id, id),
    });

    if (!character) return error(c, "NOT_FOUND", "Character not found");

    return success(c, character);
});

export default vaultRouter;