import { generateStructured } from "@/llm";
import {
    extractedEntitiesSchema,
    extractionSystemPrompt,
    buildExtractionPrompt,
    type ExtractedEntities
} from "../llm/prompts/extract";


export async function extractEntities(
    narration: string,
    protagonistName: string
): Promise<ExtractedEntities> {
    try {
        const prompt = buildExtractionPrompt(narration, protagonistName);

        const response = await generateStructured(extractionSystemPrompt, prompt, extractedEntitiesSchema, "extracted_entities");

        return response ?? {
            characters: [],
            locations: [],
            objects: [],
            relationships: [],
            events: [],
        };

    } catch (error) {
        console.error("Entity extraction error:", error);
        return {
            characters: [],
            locations: [],
            objects: [],
            relationships: [],
            events: [],
        };
    }
}