import { Hono } from "hono";
import { db, eq } from "@once/database";
import { stories, protagonists, scenes } from "@once/database/schema";
import { success, error } from "@/lib/response";

const forkRouter = new Hono();

forkRouter.post("/:id/fork", async (c) => {
    const storyId = Number(c.req.param("id"));
    if (isNaN(storyId)) return error(c, "INVALID_ID");

    const body = await c.req.json();
    const sceneId = body.sceneId;

    if (!sceneId || typeof sceneId !== "number") {
        return error(c, "VALIDATION_ERROR", "sceneId is required");
    }

    const originalStory = await db.query.stories.findFirst({
        where: eq(stories.id, storyId)
    })

    if (!originalStory) return error(c, "NOT_FOUND", "Story not found");

    const testUserId = "test-user-1";

    if (originalStory.userId !== testUserId && !originalStory.allowForking) {
        return error(c, "FORBIDDEN", "This story does not allow forking");
    }

    const forkScene = await db.query.scenes.findFirst({
        where: eq(scenes.id, sceneId)
    })

    if (!forkScene || forkScene.storyId !== storyId) {
        return error(c, "NOT_FOUND", "Scene not found in this story")
    }

    const protagonistSnapshot = forkScene.protagonistSnapshot as Record<string, unknown> | null;

    try {
        const [forkedStory] = await db.insert(stories).values({
            userId: testUserId,
            title: `${originalStory.title} (Fork)`,
            description: originalStory.description,
            genre: originalStory.genre,
            narrativeStance: originalStory.narrativeStance,
            storyMode: originalStory.storyMode,
            forkedFromStoryId: storyId,
            forkedAtSceneId: sceneId,
            turnCount: forkScene.turnNumber
        }).returning();

        let protagonistId: number | undefined;
        if (protagonistSnapshot) {
            const [newProtagonist] = await db.insert(protagonists).values({
                storyId: forkedStory.id,
                name: protagonistSnapshot.name as string,
                description: protagonistSnapshot.description as string | null,
                health: protagonistSnapshot.health as number,
                energy: protagonistSnapshot.energy as number,
                currentLocation: protagonistSnapshot.currentLocation as string,
                baseTraits: protagonistSnapshot.baseTraits as string[],
                currentTraits: protagonistSnapshot.currentTraits as string[],
                inventory: protagonistSnapshot.inventory as string[],
                scars: protagonistSnapshot.scars as string[],
                isActive: true,
            }).returning();
            protagonistId = newProtagonist.id;
        }

        const scenesToCopy = await db.query.scenes.findMany({
            where: eq(scenes.storyId, storyId),
            orderBy: (scenes, { asc }) => [asc(scenes.turnNumber)],
        });

        const scenesUpToFork = scenesToCopy.filter(s => s.turnNumber <= forkScene.turnNumber);

        for (const scene of scenesUpToFork) {
            await db.insert(scenes).values({
                storyId: forkedStory.id,
                turnNumber: scene.turnNumber,
                userAction: scene.userAction,
                narration: scene.narration,
                protagonistSnapshot: scene.protagonistSnapshot,
                mood: scene.mood,
                protagonistId,
            });
        }

        const storyWithRelations = await db.query.stories.findFirst({
            where: eq(stories.id, forkedStory.id),
            with: {
                protagonist: true,
                scenes: true,
            },
        });

        return success(c, storyWithRelations, 201);

    } catch (err) {
        console.error("Fork error:", err);
        return error(c, "INTERNAL_ERROR", "Failed to fork story");
    }
})

export default forkRouter;
