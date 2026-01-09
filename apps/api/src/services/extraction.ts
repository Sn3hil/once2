import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
    extractedEntitiesSchema,
    extractionSystemPrompt,
    buildExtractionPrompt,
    type ExtractedEntities
} from "@/prompts/extract";

const openai = new OpenAI();

export async function extractEntities(
    narration: string,
    protagonistName: string
): Promise<ExtractedEntities> {
    try {
        const response = await openai.responses.parse({
            model: "gpt-4o-mini",
            input: [
                { role: "system", content: extractionSystemPrompt },
                { role: "user", content: buildExtractionPrompt(narration, protagonistName) },
            ],
            text: {
                format: zodTextFormat(extractedEntitiesSchema, "extracted_entities"),
            },
        });

        return response.output_parsed ?? {
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