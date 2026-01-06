import type { NarrativeStance, StoryMode } from "@once/shared/schemas";

interface InitializeContext {
    title: string;
    genre: string;
    stance: NarrativeStance;
    mode: StoryMode;
    plot?: string,
    protagonist?: {
        name: string;
        description?: string;
        traits: string[];
        location: string;
    };
}

export function buildInitializePrompt(ctx: InitializeContext): string {
    const hasProtagonist = ctx.mode === "protagonist" && ctx.protagonist;

    if (hasProtagonist) {
        const p = ctx.protagonist!;
        return `Create the opening scene for a ${ctx.genre} story titled "${ctx.title} ${ctx.plot ? `and following the plot ${ctx.plot}` : ", there is no rigid plot, explore the best story around this contexts"}".

            ## Protagonist
            - Name: ${p.name}
            - Description: ${p.description || "Not specified — infer from traits"}
            - Traits: ${p.traits.length > 0 ? p.traits.join(", ") : "None specified"}
            - Starting Location: ${p.location}

            ## Requirements
            1. Begin in media res — the protagonist is already in motion, facing a situation
            2. Establish ${p.location} with vivid sensory detail
            3. Introduce a hook — a problem, mystery, or choice that demands attention
            4. Show the protagonist's personality through action, not exposition
            5. End at a moment that invites the player to act

            Write 200-400 words. No meta-commentary. Just the scene.
        `;
    }

    return `Create the opening scene for a ${ctx.genre} story titled "${ctx.title}".

            ## Requirements
            1. Generate a compelling protagonist with a name, appearance, and clear personality
            2. Place them in a specific, vivid location
            3. Begin in media res — they are already facing a situation
            4. Introduce a hook — a problem, mystery, or choice
            5. End at a moment that invites the player to act

            Write 200-400 words. No meta-commentary. Just the scene.
    `;
}