import { z } from "zod";

export const extractedEntitiesSchema = z.object({
    characters: z.array(z.object({
        name: z.string(),
        description: z.string().nullable(),
        isNew: z.boolean().nullable(),
    })),
    locations: z.array(z.object({
        name: z.string(),
        description: z.string().nullable(),
    })),
    objects: z.array(z.object({
        name: z.string(),
        description: z.string().nullable(),
        significance: z.string().nullable(),
        ownedBy: z.string().nullable(),
    })),
    relationships: z.array(z.object({
        from: z.string(),
        to: z.string(),
        type: z.string(),
        reason: z.string().nullable(),
    })),
    events: z.array(z.object({
        description: z.string(),
        who: z.array(z.string()),
        where: z.string().nullable(),
        causedBy: z.string().nullable(),
    })),
});


export type ExtractedEntities = z.infer<typeof extractedEntitiesSchema>;

export const extractionSystemPrompt = `
    You are an entity extraction assistant for a narrative storytelling system.
    Extract characters, locations, objects, relationships, and events from the scene narration.
    For relationships, use UPPERCASE_SNAKE_CASE for type (e.g., BETRAYED, SAVED_LIFE, SWORN_ENEMY).
    Only extract entities explicitly mentioned. Be concise.
`;

export function buildExtractionPrompt(narration: string, protagonistName: string): string {

    return `
        Extract all narrative entities from this scene.
        PROTAGONIST: ${protagonistName}
        
        SCENE:
        ${narration}
    `;
}