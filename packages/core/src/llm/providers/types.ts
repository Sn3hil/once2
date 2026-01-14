import { z } from "zod";

export interface LLMProvider {
    generateText(instructions: string, input: string): Promise<string>;
    generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string): Promise<z.infer<T>>;
    streamText(instructions: string, input: string): AsyncGenerator<string>;
}

export interface EmbeddingProvider {
    embed(text: string): Promise<number[]>;
    dimensions: number;
}