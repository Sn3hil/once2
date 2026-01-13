import { Hono } from "hono";
import { db, eq, desc } from "@once/database";
import { stories, scenes } from "@once/database/schema";
import { success, error } from "@/lib/response";
import { extractCodexEntries } from "@once/core";
import { streamSSE } from "hono/streaming";
import { fakeStream } from "@/lib/stream";
import { requireAuth } from "@/middleware/auth";
import { StreamCompleteData } from "@once/shared";
import { continueStory, continueStream } from "@once/core";

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

    try {

        const { scene, protagonistUpdates, echoPlanted } = await continueStory({ story, userAction });

        return success(c, {
            scene: scene,
            protagonistUpdates: protagonistUpdates,
            echoPlanted: echoPlanted,
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

    return streamSSE(c, async (stream) => {
        try {

            const { response, newScene } = await continueStream({ story, userAction });

            for await (const chunk of fakeStream(response.narration, 25)) {
                await stream.writeSSE({ data: chunk, event: "narration" });
            }

            const completeData: StreamCompleteData = {
                scene: {
                    sceneId: newScene.id,
                    protagonistId: newScene.protagonistId,
                    mood: newScene.mood,
                    createdAt: newScene.createdAt?.toISOString(),
                },
                protagonistSnapshot: newScene.protagonistSnapshot,
                protagonistUpdates: response.protagonistUpdates,
                echoPlanted: !!response.echoPlanted,
            };

            await stream.writeSSE({
                event: "complete",
                data: JSON.stringify(completeData),
            });

            try {
                extractCodexEntries(storyId, response.narration).catch(console.error);
                await stream.writeSSE({
                    event: "codex",
                    data: JSON.stringify({ complete: true })
                })
            } catch (err) {
                console.error("Codex extraction failed:", err);
            }
        } catch (err) {
            console.error("Streaming error:", err);
            await stream.writeSSE({ event: "error", data: "Failed to generate story" });
        }
    })
})

export default continueRouter;
