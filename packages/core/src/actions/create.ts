import { extractEntities } from "@/extraction";
import { buildInitializePrompt, buildSystemPrompt, generateStructured } from "@/llm";
import { storySceneMemory } from "@/memory";
import { db, eq, protagonists, scenes, stories } from "@once/database";
import { protagonistSchema, scenesSchema, storySchema } from "@once/database/types";
import { openSceneSchema } from "@once/shared";

export interface CreateStoryProps {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    };
    title: string;
    description: string | undefined;
    genre: string;
    narrativeStance: "grimdark" | "heroic" | "grounded" | "mythic" | "noir";
    storyMode: "protagonist" | "narrator";
    storyIdea: string | undefined;
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
        location: string;
    };
}

interface CreateStoryResult {
    storyWithRelations: storySchema & {
        protagonist: Array<protagonistSchema>,
        scenes: Array<scenesSchema>
    };
}

export async function createStory(props: CreateStoryProps): Promise<CreateStoryResult> {

    const { user, title, description, genre, narrativeStance, storyMode, storyIdea, protagonist } = props;

    const [newStory] = await db.insert(stories).values({
        userId: user.id,
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
    const initPrompt = buildInitializePrompt({ title, genre, stance: narrativeStance, mode: storyMode, plot: storyIdea, protagonist });

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

    extractEntities(openingScene.narration, protagonist?.name || "protagonist")
        .then(entities => storySceneMemory(
            "1",
            openingScene.narration,
            newStory.id,
            1,
            entities
        ))
        .catch(console.error);

    const storyWithRelations = await db.query.stories.findFirst({
        where: eq(stories.id, newStory.id),
        with: {
            protagonist: true,
            scenes: true,
        },
    });

    if (!storyWithRelations) throw new Error("Failed to fetch created story");

    return { storyWithRelations };
}