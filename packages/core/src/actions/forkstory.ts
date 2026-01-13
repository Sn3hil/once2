import { db, eq, protagonists, scenes, stories } from "@once/database";
import { protagonistSchema, scenesSchema, storySchema } from "@once/database/types";

interface ForkStoryProps {
    originalStory: storySchema,
    sceneId: number,
    storyId: number,
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    },
    forkScene: scenesSchema
}

interface ForkStoryResult {
    storyWithRelations: storySchema & {
        scenes: Array<scenesSchema>,
        protagonist: Array<protagonistSchema>
    }
}

export async function forkStory(props: ForkStoryProps): Promise<ForkStoryResult> {

    const { originalStory, sceneId, storyId, user, forkScene } = props;

    const protagonistSnapshot = forkScene.protagonistSnapshot as Record<string, unknown> | null;

    const [forkedStory] = await db.insert(stories).values({
        userId: user.id,
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

    if (!storyWithRelations) throw new Error("Failed to fetch story")

    return { storyWithRelations };
}