import { Hono } from "hono";
import { db, eq, desc } from "@once/database";
import { stories, scenes } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { extractCodexEntries } from "@/services/codex";
import { evaluateEchoes, plantEcho, resolveEchoes } from "@/services/echo";
import { generateContinuation } from "@/services/story";
import { updateProtagonistState } from "@/services/protagonist";
import { streamSSE } from "hono/streaming";
import { fakeStream } from "@/lib/stream";
import { storySceneMemory, buildContext } from "@/services/memory";
import { evaluateDeferredCharacters, markCharacterIntroduced } from "@/services/deferred";
import { requireAuth } from "@/middleware/auth";
import { extractEntities } from "@/services/extraction";

const continueRouter = new Hono();

continueRouter.post("/:id/continue", requireAuth, async (c) => {
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
            echoes: true,
            deferredCharacters: true
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.status !== "active") return error(c, "STORY_COMPLETED", "Cannot continue a completed story");

    const user = c.get("user");
    if (!user || story.userId !== user.id) return error(c, "FORBIDDEN", "You can only continue your own story");

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

        const pendingCharacters = story.deferredCharacters.filter(c => !c.introduced);
        const triggeredCharacters = await evaluateDeferredCharacters({
            storyId,
            pendingCharacters: pendingCharacters.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description,
                role: c.role,
                triggerCondition: c.triggerCondition,
            })),
            protagonistLocation: activeProtagonist?.currentLocation || "",
            protagonistState: activeProtagonist
                ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}`
                : "",
            userAction,
            recentNarration: lastScene?.narration || "",
        });

        const memoryContext = await buildContext(
            storyId,
            userAction,
            activeProtagonist?.name || "protagonist",
            activeProtagonist?.currentLocation
        );
        const factualKnowledge = memoryContext.similarScenes.map(s => s.narration);

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
            factualKnowledge,
            introducedCharacters: triggeredCharacters.map(c => ({ name: c.name, description: c.description, role: c.role }))
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
            protagonistSnapshot: activeProtagonist ? {
                name: activeProtagonist.name,
                description: activeProtagonist.description,
                health: activeProtagonist.health,
                energy: activeProtagonist.energy,
                currentLocation: activeProtagonist.currentLocation,
                baseTraits: activeProtagonist.baseTraits,
                currentTraits: activeProtagonist.currentTraits,
                inventory: activeProtagonist.inventory,
                scars: activeProtagonist.scars,
            } : null,
        }).returning();

        await db.update(stories)
            .set({
                turnCount: newTurnNumber,
                updatedAt: new Date(),
            })
            .where(eq(stories.id, storyId));

        for (const char of triggeredCharacters) {
            await markCharacterIntroduced(char.id, newScene.id);
        }

        extractEntities(response.narration, activeProtagonist?.name || "protagonist")
            .then(entities => storySceneMemory(
                newScene.id.toString(),
                response.narration,
                storyId,
                newTurnNumber,
                entities
            ))
            .catch(console.error);

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

continueRouter.post("/:id/continue/stream", requireAuth, async (c) => {
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
            echoes: true,
            deferredCharacters: true
        }
    })

    if (!story) return error(c, "NOT_FOUND", "Story not found");
    if (story.status !== "active") return error(c, "STORY_COMPLETED");

    const user = c.get("user");
    if (!user || story.userId !== user.id) return error(c, "FORBIDDEN", "You can only continue your own stories");

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

            const pendingCharacters = story.deferredCharacters.filter(c => !c.introduced);
            const triggeredCharacters = await evaluateDeferredCharacters({
                storyId,
                pendingCharacters: pendingCharacters.map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    role: c.role,
                    triggerCondition: c.triggerCondition,
                })),
                protagonistLocation: activeProtagonist?.currentLocation || "",
                protagonistState: activeProtagonist
                    ? `Health: ${activeProtagonist.health}, Energy: ${activeProtagonist.energy}`
                    : "",
                userAction,
                recentNarration: lastScene?.narration || "",
            });

            const memoryContext = await buildContext(
                storyId,
                userAction,
                activeProtagonist?.name || "protagonist",
                activeProtagonist?.currentLocation
            );
            const factualKnowledge = memoryContext.similarScenes.map(s => s.narration);

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
                factualKnowledge,
                introducedCharacters: triggeredCharacters.map(c => ({ name: c.name, description: c.description, role: c.role }))
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
                protagonistSnapshot: activeProtagonist ? {
                    name: activeProtagonist.name,
                    description: activeProtagonist.description,
                    health: activeProtagonist.health,
                    energy: activeProtagonist.energy,
                    currentLocation: activeProtagonist.currentLocation,
                    baseTraits: activeProtagonist.baseTraits,
                    currentTraits: activeProtagonist.currentTraits,
                    inventory: activeProtagonist.inventory,
                    scars: activeProtagonist.scars,
                } : null
            }).returning();

            await db.update(stories)
                .set({ turnCount: newTurnNumber, updatedAt: new Date() })
                .where(eq(stories.id, storyId));

            for (const char of triggeredCharacters) {
                await markCharacterIntroduced(char.id, newScene.id);
            }

            extractEntities(response.narration, activeProtagonist?.name || "protagonist")
                .then(entities => storySceneMemory(
                    newScene.id.toString(),
                    response.narration,
                    storyId,
                    newTurnNumber,
                    entities
                ))
                .catch(console.error);

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

export default continueRouter;
