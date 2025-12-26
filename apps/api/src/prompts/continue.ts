import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface ContinueContext {
    stance: NarrativeStance;
    mode: StoryMode;
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
}

export function buildContinuePrompt(ctx: ContinueContext): string {
    const hasProtagonist = ctx.mode === "protagonist" && ctx.protagonist;

    let stateBlock = "";
    if (hasProtagonist) {
        const p = ctx.protagonist!;
        stateBlock = `
            ## Current Protagonist State
            - Name: ${p.name}
            - Health: ${p.health}/100
            - Energy: ${p.energy}/100
            - Location: ${p.location}
            - Traits: ${p.traits.join(", ") || "None"}
            - Inventory: ${p.inventory.length > 0 ? p.inventory.join(", ") : "Empty"}
            - Scars: ${p.scars.length > 0 ? p.scars.join(", ") : "None"}
        `;
    }

    const recentContext = ctx.recentScenes.map((s, i) =>
        `### Turn ${i + 1}\n**Action:** ${s.userAction}\n**Result:** ${s.narration}`
    ).join("\n\n");

    return `Continue the story based on the player's action.
        ${stateBlock}

        ## Recent Events
        ${recentContext || "This is the beginning of the story."}

        ## Player's Action
        "${ctx.userAction}"

        ## Requirements
        1. Respond to the action naturally within the world's rules
        2. Show consequences — actions have weight
        3. Update the protagonist's state if relevant (health, energy, location, inventory, traits)
        4. If this action plants a seed for future consequences, note it
        5. End at a moment of tension or decision

        Write 150-300 words. No meta-commentary.
    `;
}