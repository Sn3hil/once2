import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { LLMProvider, EmbeddingProvider } from "./types";
import zodToJsonSchema from "zod-to-json-schema";
import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../../../.env") });

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });

// even though we are using google , this openai initiation is being imported and tries to create the openai client at module load , causing error
// solution: we have to lazy load this

// lazy getter:

let _googleai: GoogleGenAI | null = null;

function getGoogleGenAi(): GoogleGenAI {
    if (!_googleai) {
        _googleai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_API_KEY
        })
    }
    return _googleai;
}

const LLM_MODEL = process.env.GOOGLE_LLM_MODEL || 'gemini-2.0-flash';
const EMBEDDING_MODEL = process.env.GOOGLE_EMBEDDING_MODEL || 'gemini-embedding-001'

export const googleLLM: LLMProvider = {
    async generateText(instructions: string, input: string): Promise<string> {

        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions
            }
        })

        return response.text || '';
    },

    async generateStructured<T extends z.ZodTypeAny>(instructions: string, input: string, schema: T, _schemaName: string): Promise<z.infer<T>> {
        const jsonSchema = zodToJsonSchema(schema);

        const response = await getGoogleGenAi().models.generateContent({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions,
                responseMimeType: 'application/json',
                responseSchema: jsonSchema
            }
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return schema.parse(parsed);
    },

    async *streamText(instructions: string, input: string): AsyncGenerator<string> {
        const response = await getGoogleGenAi().models.generateContentStream({
            model: LLM_MODEL,
            contents: input,
            config: {
                systemInstruction: instructions
            }
        });

        for await (const chunk of response) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    }
}

export const googleEmbedding: EmbeddingProvider = {
    dimensions: 1536,

    async embed(text: string): Promise<number[]> {
        const response = await getGoogleGenAi().models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: {
                outputDimensionality: 1536
            }
        });
        return response.embeddings?.[0].values || [];
    }
};
