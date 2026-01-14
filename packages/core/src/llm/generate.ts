import { z } from "zod";
import { llm } from "./providers";

export async function* streamNarration(instructions: string, input: string): AsyncGenerator<string> {
    yield* llm.streamText(instructions, input);
}

export async function generateResponse(instructions: string, input: string): Promise<string> {
    return llm.generateText(instructions, input)
}

export async function generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string = "response"): Promise<z.infer<T>> {
    return llm.generateStructured(instructions, input, schema, schemaName);
}