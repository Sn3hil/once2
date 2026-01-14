interface CodexExtractionContext {
    narration: string;
    existingEntries: Array<{
        name: string;
        entryType: string;
    }>;
}

export function buildCodexExtractionPrompt(ctx: CodexExtractionContext): string {
    const existingList = ctx.existingEntries.length > 0
        ? ctx.existingEntries.map(e => `- ${e.name} (${e.entryType})`).join("\n")
        : "None yet";

    return `Extract notable entities from this scene narration.

        ## Scene Narration
        ${ctx.narration}

        ## Existing Codex Entries
        ${existingList}

        ## Task
        Identify NEW entities mentioned in this narration. For each:
        - Character: Named individuals (not "a guard" but "Captain Vern")
        - Location: Specific places with names
        - Item: Notable objects with significance
        - Faction: Groups, organizations, or allegiances
        - Event: Significant happenings worth remembering
        - Lore: World-building details, history, customs

        For existing entries, note if the narration reveals NEW information about them.

        Only extract what's clearly present in the narration — don't invent.
    `;
}