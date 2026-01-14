import { db, eq, inArray } from "@once/database";
import { echoes } from "@once/database/schema";
import { generateStructured } from "./llm";
import { buildEchoEvalPrompt } from "@/notUsed/prompts/echo";
import { echoEvalSchema } from "@once/shared/schemas";

interface EchoEvalContext {
    storyId: number;
    pendingEchoes: Array<{
        id: number;
        description: string;
        triggerCondition: string;
    }>;
    protagonistLocation: string;
    protagonistState: string;
    userAction: string;
    recentNarration: string;
}

export async function evaluateEchoes(ctx: EchoEvalContext): Promise<typeof ctx.pendingEchoes> {
    if (ctx.pendingEchoes.length === 0) return [];

    const prompt = buildEchoEvalPrompt({
        pendingEchoes: ctx.pendingEchoes,
        protagonistLocation: ctx.protagonistLocation,
        protagonistState: ctx.protagonistState,
        userAction: ctx.userAction,
        recentNarration: ctx.recentNarration
    })

    if (!prompt) return [];

    const result = await generateStructured(
        "You evaluate story echoes to decide which should trigger",
        prompt,
        echoEvalSchema,
        "echo_eval"
    );

    return ctx.pendingEchoes.filter(e => result.triggeredEchoIds.includes(e.id));
}

export async function plantEcho(
    storyId: number,
    sourceSceneId: number,
    description: string,
    triggerCondition: string
) {
    await db.insert(echoes).values({
        storyId,
        sourceSceneId,
        description,
        triggerCondition,
        status: "pending"
    })
}

export async function resolveEchoes(echoIds: number[], resolvedAtSceneId: number) {
    if (echoIds.length === 0) return;
    await db.update(echoes)
        .set({
            status: "resolved",
            resolvedAtSceneId,
            updatedAt: new Date(),
        })
        .where(inArray(echoes.id, echoIds));
}