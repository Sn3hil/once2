interface DeferredCharContext {
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

export function buildDeferredCharPrompt(ctx: DeferredCharContext): string {
    const characterList = ctx.pendingCharacters.map(c =>
        `- ID ${c.id}: "${c.name}" (${c.role || "unknown role"})
         Trigger: "${c.triggerCondition}"`
    ).join("\n");

    return `Evaluate which deferred characters should be introduced in the next scene.

        ## Pending Characters
        ${characterList}

        ## Current Context
        - Location: ${ctx.protagonistLocation}
        - Protagonist State: ${ctx.protagonistState}
        - Player Action: "${ctx.userAction}"
        - Recent Scene: ${ctx.recentNarration.slice(0, 500)}...

        ## Task
        Return the IDs of characters whose trigger conditions are NOW met.
        Only trigger if the condition is clearly satisfied.
        Empty array if none should trigger.
    `;
}