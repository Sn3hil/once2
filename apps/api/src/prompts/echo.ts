interface EchoEvalContext {
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

export function buildEchoEvalPrompt(ctx: EchoEvalContext): string {
    if (ctx.pendingEchoes.length === 0) {
        return "";
    }

    const echoList = ctx.pendingEchoes.map(e =>
        `- Echo #${e.id}: "${e.description}" — Triggers: "${e.triggerCondition}"`
    ).join("\n");

    return `You are evaluating which story echoes should trigger.

        ## Current Context
        - Location: ${ctx.protagonistLocation}
        - Protagonist State: ${ctx.protagonistState}
        - Recent events: ${ctx.recentNarration}

        ## Player's Current Action
        "${ctx.userAction}"

        ## Pending Echoes
        ${echoList}

        ## Task
        For each echo, decide if its trigger condition is now met based on the current context and action.
        An echo should trigger if:
        1. The trigger condition matches the current situation
        2. The timing feels narratively appropriate
        3. It would enhance the story (not disrupt it)

        Be selective — not every echo needs to trigger. Surprise is better than predictability.
        Return ONLY the IDs of echoes that should trigger now.
    `;
}