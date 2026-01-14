import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { LLMProvider, EmbeddingProvider } from "./types";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../../.env") });


// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// })

// even though we are using google , this openai initiation is being imported and tries to create the openai client at module load , causing error
// solution: we have to lazy load this

// lazy getter:

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })
    }
    return _openai;
}

const LLM_MODEL = process.env.OPENAI_LLM_MODEL || 'gpt-4o-mini';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

export const openaiLLM: LLMProvider = {
    async generateText(instructions: string, input: string): Promise<string> {
        const response = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input
        })

        return response.output_text
    },

    async generateStructured<T extends z.ZodTypeAny>(
        instructions: string,
        input: string,
        schema: T,
        schemaName: string
    ): Promise<z.infer<T>> {

        const response = await getOpenAI().responses.parse({
            model: LLM_MODEL,
            instructions,
            input,
            text: { format: zodTextFormat(schema, schemaName) }
        })

        return response.output_parsed
    },

    async *streamText(instructions: string, input: string): AsyncGenerator<string> {
        const stream = await getOpenAI().responses.create({
            model: LLM_MODEL,
            instructions,
            input,
            stream: true
        })
        for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
                yield event.delta
            }
        }
    }
}


export const openaiEmbedding: EmbeddingProvider = {
    dimensions: 1536,

    async embed(text: string): Promise<number[]> {
        const response = await getOpenAI().embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
            dimensions: 1536
        })
        return response.data[0].embedding
    }
}