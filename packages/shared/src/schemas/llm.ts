import { z } from "zod";

export const openSceneSchema = z.object({
    narration: z.string().describe("The opening scene narration (200-400 words)"),
    protagonistGenerated: z.object({
        name: z.string(),
        description: z.string(),
        traits: z.array(z.string()),
        location: z.string()
    }).optional().describe("Only present if protagonist was auto-generated")
})

export const sceneResponseSchema = z.object({
    narration: z.string().describe("The scene narration"),
    protagonistUpdates: z.object({
        health: z.number().optional(),
        energy: z.number().optional(),
        location: z.string().optional(),
        addTraits: z.array(z.string()).optional(),
        removeTraits: z.array(z.string()).optional(),
        addInventory: z.array(z.string()).optional(),
        removeInventory: z.array(z.string()).optional(),
        addScars: z.array(z.string()).optional(),
    }).optional(),
    echoPlanted: z.object({
        description: z.string().describe("What happened that will echo later"),
        triggerCondition: z.string().describe("When this should resolve, e.g. 'when protagonist visits a market'"),
    }).optional().describe("A consequence planted for future resolution"),
});

export type OpeningSceneResponse = z.infer<typeof openSceneSchema>;
export type SceneResponse = z.infer<typeof sceneResponseSchema>;

export const echoEvalSchema = z.object({
    triggeredEchoIds: z.array(z.number()).describe("IDs of echoes that should trigger now"),
    reasoning: z.string().optional().describe("Brief explanation of why these echoes triggered"),
});

export const codexExtractionSchema = z.object({
    newEntries: z.array(z.object({
        name: z.string().describe("Entity name"),
        entryType: z.enum(["character", "location", "item", "faction", "event", "lore"]),
        summary: z.string().describe("Brief description based on the scene"),
    })).describe("New entities to add to codex"),

    updates: z.array(z.object({
        name: z.string().describe("Existing entry to update"),
        newInfo: z.string().describe("New information learned about this entity"),
    })).optional().describe("Updates to existing entries"),
});

export type CodexExtractionResponse = z.infer<typeof codexExtractionSchema>;
export type EchoEvalResponse = z.infer<typeof echoEvalSchema>;