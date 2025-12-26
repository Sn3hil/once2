import { Hono } from "hono";
import { db, eq, desc } from "@once/database";
import { stories, protagonists, scenes, codexEntries, echoes } from "@once/database/schema";
import { success, error, paginated } from "@/lib/response";
import { createStorySchema, openSceneSchema, sceneResponseSchema } from "@once/shared/schemas"
import { buildSystemPrompt } from "@/prompts/system";
import { buildInitializePrompt } from "@/prompts/initialize";
import { generateStructured } from "@/services/llm";
import { buildContinuePrompt } from "@/prompts/continue";

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
            }
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.status !== "active") return error(c, "STORY_COMPLETED", "Cannot continue a completed story");

    const activeProtagonist = story.protagonist.find(p => p.isActive);

    const systemPrompt = buildSystemPrompt(story.narrativeStance, story.storyMode);
    const continuePrompt = buildContinuePrompt({
        stance: story.narrativeStance,
        mode: story.storyMode,
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
    })

    try {
        const response = await generateStructured(
            systemPrompt,
            continuePrompt,
            sceneResponseSchema,
            "scene_response"
        );
        const newTurnNumber = (story.turnCount || 0) + 1;

        if (activeProtagonist && response.protagonistUpdates) {
            const updates = response.protagonistUpdates;

            let newTraits = activeProtagonist.currentTraits || [];
            if (updates.addTraits) newTraits = [...newTraits, ...updates.addTraits];
            if (updates.removeTraits) newTraits = newTraits.filter(t => !updates.removeTraits!.includes(t));

            let newInventory = activeProtagonist.inventory || [];
            if (updates.addInventory) newInventory = [...newInventory, ...updates.addInventory];
            if (updates.removeInventory) newInventory = newInventory.filter(i => !updates.removeInventory!.includes(i));

            await db.update(protagonists)
                .set({
                    health: updates.health ?? activeProtagonist.health,
                    energy: updates.energy ?? activeProtagonist.energy,
                    currentLocation: updates.location ?? activeProtagonist.currentLocation,
                    currentTraits: newTraits,
                    inventory: newInventory,
                    scars: updates.addScars
                        ? [...(activeProtagonist.scars || []), ...updates.addScars]
                        : activeProtagonist.scars,
                    updatedAt: new Date(),
                })
                .where(eq(protagonists.id, activeProtagonist.id));
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

        if (response.echoPlanted) {
            await db.insert(echoes).values({
                storyId,
                sourceSceneId: newScene.id,
                description: response.echoPlanted.description,
                triggerCondition: response.echoPlanted.triggerCondition,
                status: "pending",
            });
        }
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

export default storiesRouter;