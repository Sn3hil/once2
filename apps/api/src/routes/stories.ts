import { Hono } from "hono";
import { db, eq, desc } from "@once/database";
import { stories, protagonists, scenes, codexEntries, echoes } from "@once/database/schema";
import { success, error, paginated } from "@/lib/response";
import { createStorySchema, openSceneSchema } from "@once/shared/schemas"
import { buildSystemPrompt } from "@/prompts/system";
import { buildInitializePrompt } from "@/prompts/initialize";
import { generateStructured } from "@/services/llm";
import { extractCodexEntries } from "@/services/codex";
import { evaluateEchoes, plantEcho, resolveEchoes } from "@/services/echo";
import { generateContinuation } from "@/services/story";
import { updateProtagonistState } from "@/services/protagonist";
import { streamSSE } from "hono/streaming";
import { fakeStream } from "@/lib/stream";

const storiesRouter = new Hono();

storiesRouter.get("/", async (c) => {
    const testUserId = "test-user-1";
    const userStories = await db.query.stories.findMany({
        where: eq(stories.userId, testUserId),
        orderBy: desc(stories.updatedAt)
    })

    return success(c, userStories);
});

storiesRouter.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID");
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, id),
        with: { protagonist: true }
    });

    if (!story) {
        return error(c, "NOT_FOUND", "Story not found");
    }

    return success(c, story);
})

storiesRouter.post("/", async (c) => {
    const body = await c.req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
        return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);
    }

    const { title, description, genre, narrativeStance, storyMode, protagonist } = parsed.data;
    const testUserId = "test-user-1";

    const [newStory] = await db.insert(stories).values({
        userId: testUserId,
        title,
        description,
        genre,
        narrativeStance,
        storyMode
    }).returning();

    let protagonistId: number | undefined;

    if (storyMode === "protagonist" && protagonist) {
        const [newProtagonist] = await db.insert(protagonists).values({
            storyId: newStory.id,
            name: protagonist.name,
            description: protagonist.description,
            currentLocation: protagonist.location,
            baseTraits: protagonist.traits,
            currentTraits: protagonist.traits
        }).returning();

        protagonistId = newProtagonist.id;
    }

    const systemPrompt = buildSystemPrompt(narrativeStance, storyMode);
    const initPrompt = buildInitializePrompt({ title, genre, stance: narrativeStance, mode: storyMode, protagonist });

    try {
        const openingScene = await generateStructured(systemPrompt, initPrompt, openSceneSchema, "opening_scene");

        if (!protagonist && openingScene.protagonistGenerated) {
            const gen = openingScene.protagonistGenerated;
            const [newProtagonist] = await db.insert(protagonists).values({
                storyId: newStory.id,
                name: gen.name,
                description: gen.description,
                currentLocation: gen.location,
                baseTraits: gen.traits,
                currentTraits: gen.traits
            }).returning();
            protagonistId = newProtagonist.id;
        }

        await db.insert(scenes).values({
            storyId: newStory.id,
            turnNumber: 1,
            userAction: "[STORY_START]",
            narration: openingScene.narration,
            protagonistId,
        });

        const storyWithRelations = await db.query.stories.findFirst({
            where: eq(stories.id, newStory.id),
            with: {
                protagonist: true,
                scenes: true,
            },
        });

        return success(c, storyWithRelations, 201);
    } catch (err) {
        console.error("LLM Error: ", err);
        return error(c, "LLM_ERROR", "Failed to create opening scene");
    }
});

storiesRouter.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID", "Invalid story ID");
    }

    const [updated] = await db
        .update(stories)
        .set({ status: "abandoned" })
        .where(eq(stories.id, id))
        .returning();

    if (!updated) {
        return error(c, "NOT_FOUND", "Story not found");
    }

    return success(c, { message: "Story archived" });
});

storiesRouter.get("/:id/scenes", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyScenes = await db.query.scenes.findMany({
        where: eq(scenes.storyId, id),
        orderBy: scenes.turnNumber,
    });

    return success(c, storyScenes);
});

storiesRouter.get("/:id/codex", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyCodex = await db.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, id),
    });

    return success(c, storyCodex);
});

storiesRouter.get("/:id/echoes", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) return error(c, "INVALID_ID");

    const storyEchoes = await db.query.echoes.findMany({
        where: eq(echoes.storyId, id),
    });

    return success(c, storyEchoes);
});

storiesRouter.post("/:id/continue", async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const userAction = body.action;

    if (!userAction || typeof userAction !== "string") {
        return error(c, "VALIDATION_ERROR", "Action is required");
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
        with: {
            protagonist: true,
            scenes: {
                orderBy: desc(scenes.turnNumber),
                limit: 5
            },
            echoes: true
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.status !== "active") return error(c, "STORY_COMPLETED", "Cannot continue a completed story");

    const activeProtagonist = story.protagonist.find(p => p.isActive);

    const pendingEchoes = story.echoes.filter(e => e.status === "pending");
    const lastScene = story.scenes[0];

    try {
        const triggeredEchoes = await evaluateEchoes({
            storyId,
            pendingEchoes: pendingEchoes.map(e => ({
                id: e.id,
                description: e.description,
                triggerCondition: e.triggerCondition,
            })),
            protagonistLocation: activeProtagonist?.currentLocation || "",
            protagonistState: activeProtagonist
                ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}`
                : "",
            userAction,
            recentNarration: lastScene?.narration || "",
        });

        const response = await generateContinuation({
            narrativeStance: story.narrativeStance,
            storyMode: story.storyMode,
            protagonist: activeProtagonist ? {
                name: activeProtagonist.name,
                description: activeProtagonist.description,
                traits: activeProtagonist.currentTraits || [],
                health: activeProtagonist.health,
                energy: activeProtagonist.energy,
                location: activeProtagonist.currentLocation,
                inventory: activeProtagonist.inventory || [],
                scars: activeProtagonist.scars || [],
            } : undefined,
            recentScenes: story.scenes.reverse().map(s => ({
                userAction: s.userAction,
                narration: s.narration,
            })),
            userAction,
            triggeredEchoes: triggeredEchoes.map(e => ({ description: e.description })),
        });

        const newTurnNumber = (story.turnCount || 0) + 1;

        if (activeProtagonist && response.protagonistUpdates) {
            await updateProtagonistState(activeProtagonist, response.protagonistUpdates);
        }

        const [newScene] = await db.insert(scenes).values({
            storyId,
            turnNumber: newTurnNumber,
            userAction,
            narration: response.narration,
            protagonistId: activeProtagonist?.id,
        }).returning();

        await db.update(stories)
            .set({
                turnCount: newTurnNumber,
                updatedAt: new Date(),
            })
            .where(eq(stories.id, storyId));

        await resolveEchoes(triggeredEchoes.map(e => e.id), newScene.id);

        if (response.echoPlanted) {
            await plantEcho(
                storyId,
                newScene.id,
                response.echoPlanted.description,
                response.echoPlanted.triggerCondition
            );
        }

        extractCodexEntries(storyId, response.narration).catch(console.error);

        return success(c, {
            scene: newScene,
            protagonistUpdates: response.protagonistUpdates,
            echoPlanted: response.echoPlanted ? true : false,
        });
    } catch (err) {
        console.error("LLM Error:", err);
        return error(c, "LLM_ERROR", "Failed to continue story");
    }
})

storiesRouter.post("/:id/continue/stream", async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const userAction = body.action;

    if (!userAction || typeof userAction !== "string") {
        return error(c, "VALIDATION_ERROR", "Action is required");
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, storyId),
        with: {
            protagonist: true,
            scenes: { orderBy: desc(scenes.turnNumber), limit: 5 },
            echoes: true
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.status !== "active") return error(c, "STORY_COMPLETED");

    const activeProtagonist = story.protagonist.find(p => p.isActive);
    const pendingEchoes = story.echoes.filter(e => e.status === "pending");
    const lastScene = story.scenes[0];

    return streamSSE(c, async (stream) => {
        try {
            const triggeredEchoes = await evaluateEchoes({
                storyId,
                pendingEchoes: pendingEchoes.map(e => ({ id: e.id, description: e.description, triggerCondition: e.triggerCondition })),
                protagonistLocation: activeProtagonist?.currentLocation || "",
                protagonistState: activeProtagonist ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}` : "",
                userAction,
                recentNarration: lastScene?.narration || ""
            })

            const response = await generateContinuation({
                narrativeStance: story.narrativeStance,
                storyMode: story.storyMode,
                protagonist: activeProtagonist ? {
                    name: activeProtagonist.name,
                    description: activeProtagonist.description,
                    traits: activeProtagonist.currentTraits || [],
                    health: activeProtagonist.health,
                    energy: activeProtagonist.energy,
                    location: activeProtagonist.currentLocation,
                    inventory: activeProtagonist.inventory || [],
                    scars: activeProtagonist.scars || [],
                } : undefined,
                recentScenes: [...story.scenes].reverse().map(s => ({
                    userAction: s.userAction,
                    narration: s.narration,
                })),
                userAction,
                triggeredEchoes: triggeredEchoes.map(e => ({ description: e.description })),
            });

            for await (const chunk of fakeStream(response.narration, 25)) {
                await stream.writeSSE({ data: chunk, event: "narration" });
            }

            const newTurnNumber = (story.turnCount || 0) + 1;

            if (activeProtagonist && response.protagonistUpdates) {
                await updateProtagonistState(activeProtagonist, response.protagonistUpdates);
            }

            const [newScene] = await db.insert(scenes).values({
                storyId,
                turnNumber: newTurnNumber,
                userAction,
                narration: response.narration,
                protagonistId: activeProtagonist?.id,
            }).returning();

            await db.update(stories)
                .set({ turnCount: newTurnNumber, updatedAt: new Date() })
                .where(eq(stories.id, storyId));

            await resolveEchoes(triggeredEchoes.map(e => e.id), newScene.id);

            if (response.echoPlanted) {
                await plantEcho(
                    storyId,
                    newScene.id,
                    response.echoPlanted.description,
                    response.echoPlanted.triggerCondition
                );
            }

            extractCodexEntries(storyId, response.narration).catch(console.error);

            await stream.writeSSE({
                event: "complete",
                data: JSON.stringify({
                    sceneId: newScene.id,
                    protagonistUpdates: response.protagonistUpdates,
                    echoPlanted: !!response.echoPlanted,
                }),
            });
        } catch (err) {
            console.error("Streaming error:", err);
            await stream.writeSSE({ event: "error", data: "Failed to generate story" });
        }
    })
})

export default storiesRouter;