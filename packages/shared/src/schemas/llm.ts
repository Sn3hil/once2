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