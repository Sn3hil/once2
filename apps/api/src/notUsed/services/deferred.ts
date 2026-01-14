import { db, eq } from "@once/database";
import { deferredCharacters } from "@once/database/schema";
import { generateStructured } from "./llm";
import { buildDeferredCharPrompt } from "@/notUsed/prompts/deferred";
import { deferredCharEvalSchema } from "@once/shared/schemas";

interface DeferredCharEvalContext {
    storyId: number;
    pendingCharacters: Array<{
        id: number;
        name: string;
        description?: string | null;
        role?: string | null;
        triggerCondition: string;
    }>;
    protagonistLocation: string;
    protagonistState: string;
    userAction: string;
    recentNarration: string;
}

export async function evaluateDeferredCharacters(ctx: DeferredCharEvalContext) {
    if (ctx.pendingCharacters.length === 0) return [];

    const prompt = buildDeferredCharPrompt(ctx);

    const result = await generateStructured(
        "You evaluate when deferred characters should be introduced into a story",
        prompt,
        deferredCharEvalSchema,
        "deferred_char_eval"
    );

    return ctx.pendingCharacters.filter(c => result.triggeredCharacterIds.includes(c.id));
}

export async function markCharacterIntroduced(characterId: number, sceneId: number) {
    await db.update(deferredCharacters)
        .set({
            introduced: true,
            introducedAtSceneId: sceneId,
        })
        .where(eq(deferredCharacters.id, characterId));
}