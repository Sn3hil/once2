import { Hono } from "hono";
import { db, eq } from "@once/database";
import { vaultCharacters, protagonists } from "@once/database/schema";
import { createVaultCharacterSchema, updateVaultCharacterSchema } from "@once/shared/schemas"
import { success, error } from "@/lib/response";
import { requireAuth } from "@/middleware/auth";

const vaultRouter = new Hono();

vaultRouter.post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const parsed = createVaultCharacterSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const user = c.get("user")!;
    const [newCharacter] = await db.insert(vaultCharacters).values({
        userId: user.id,
        ...parsed.data,
    }).returning();

    return success(c, newCharacter, 201);
});

vaultRouter.patch("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const character = await db.query.vaultCharacters.findFirst({
        where: eq(vaultCharacters.id, id)
    })

    if (!character) return error(c, "NOT_FOUND", "Character not found");

    const user = c.get("user");
    if (!user || character.userId !== user.id) return error(c, "FORBIDDEN");

    const body = await c.req.json();
    const parsed = updateVaultCharacterSchema.safeParse(body);
    if (!parsed.success) return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);

    const [updated] = await db.update(vaultCharacters).set(parsed.data).where(eq(vaultCharacters.id, id)).returning();
    if (!updated) return error(c, "NOT_FOUND", "Character not found");

    return success(c, updated);
});

vaultRouter.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const character = await db.query.vaultCharacters.findFirst({
        where: eq(vaultCharacters.id, id)
    })

    if (!character) return error(c, "NOT_FOUND", "Character not found")

    const user = c.get("user");
    if (!user || character.userId !== user.id) return error(c, "FORBIDDEN");

    const [deleted] = await db.delete(vaultCharacters).where(eq(vaultCharacters.id, id)).returning();
    if (!deleted) return error(c, "NOT_FOUND", "Character not found");

    return success(c, { message: "Character deleted" });
});

vaultRouter.post("/from-protagonist/:protagonistId", requireAuth, async (c) => {
    const protagonistId = Number(c.req.param("protagonistId"));
    if (isNaN(protagonistId)) return error(c, "INVALID_ID");

    const protagonist = await db.query.protagonists.findFirst({
        where: eq(protagonists.id, protagonistId),
    });

    if (!protagonist) return error(c, "PROTAGONIST_NOT_FOUND");

    const user = c.get("user")!;
    const [newCharacter] = await db.insert(vaultCharacters).values({
        userId: user.id,
        name: protagonist.name,
        description: protagonist.description,
        traits: protagonist.currentTraits,
    }).returning();

    return success(c, newCharacter, 201);
});

vaultRouter.get("/", requireAuth, async (c) => {
    const user = c.get("user")!;

    const characters = await db.query.vaultCharacters.findMany({
        where: eq(vaultCharacters.userId, user.id),
    });

    return success(c, characters);
});

vaultRouter.get("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return error(c, "INVALID_ID");

    const character = await db.query.vaultCharacters.findFirst({
        where: eq(vaultCharacters.id, id),
    });

    if (!character) return error(c, "NOT_FOUND", "Character not found");

    const user = c.get("user");
    if (!user || character.userId !== user.id) return error(c, "FORBIDDEN");

    return success(c, character);
});

export default vaultRouter;