import { generateStructured } from "./llm";
import { buildSystemPrompt } from "@/prompts/system";
import { buildInitializePrompt } from "@/prompts/initialize";
import { buildContinuePrompt } from "@/prompts/continue";
import { openSceneSchema, sceneResponseSchema } from "@once/shared/schemas";
import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface StoryContext {
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
}

interface InitializeContext extends StoryContext {
    title: string;
    genre: string;
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
        location: string;
    };
}

interface ContinueContext extends StoryContext {
    protagonist?: {
        name: string;
        description?: string | null;
        traits: string[];
        health: number;
        energy: number;
        location: string;
        inventory: string[];
        scars: string[];
    };
    recentScenes: Array<{
        userAction: string;
        narration: string;
    }>;
    userAction: string;
    triggeredEchoes: Array<{ description: string }>;
}

export async function generateOpeningScene(ctx: InitializeContext) {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode);
    const initPrompt = buildInitializePrompt({
        title: ctx.title,
        genre: ctx.genre,
        stance: ctx.narrativeStance,
        mode: ctx.storyMode,
        protagonist: ctx.protagonist,
    });

    return generateStructured(
        systemPrompt,
        initPrompt,
        openSceneSchema,
        "opening_scene"
    );
}

export async function generateContinuation(ctx: ContinueContext) {
    const systemPrompt = buildSystemPrompt(ctx.narrativeStance, ctx.storyMode);

    const continuePrompt = buildContinuePrompt({
        stance: ctx.narrativeStance,
        mode: ctx.storyMode,
        protagonist: ctx.protagonist,
        recentScenes: ctx.recentScenes,
        userAction: ctx.userAction,
        triggeredEchoes: ctx.triggeredEchoes,
    });

    return generateStructured(
        systemPrompt,
        continuePrompt,
        sceneResponseSchema,
        "scene_response"
    );
}