import OpenAI from "openai";
import { config } from "dotenv";
import { resolve } from "path";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

config({ path: resolve(process.cwd(), ".env") });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const DEFAULT_MODEL = "gpt-4o-mini";

export async function* streamNarration(instructions: string, input: string): AsyncGenerator<string> {
    const stream = await openai.responses.create({
        model: DEFAULT_MODEL,
        instructions,
        input,
        stream: true
    })

    for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
            yield event.delta;
        }
    }
}

export async function generateResponse(instructions: string, input: string): Promise<string> {
    const response = await openai.responses.create({
        model: DEFAULT_MODEL,
        instructions,
        input
    })

    return response.output_text;
}

export async function generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, schemaName: string = "response"): Promise<z.infer<T>> {
    const response = await openai.responses.parse({
        model: DEFAULT_MODEL,
        instructions,
        input,
        text: { format: zodTextFormat(schema, schemaName) }
    });

    return response.output_parsed;
}

export { openai, DEFAULT_MODEL };