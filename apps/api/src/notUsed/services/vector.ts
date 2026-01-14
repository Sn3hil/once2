import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") })

const COLLECTION_NAME = "once_scenes";
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

const openai = new OpenAI();

function createQdrantClient(): QdrantClient {
    if (process.env.MEMORY_MODE === "cloud") {
        return new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });
    } else {
        const host = process.env.QDRANT_HOST || "localhost";
        const port = parseInt(process.env.QDRANT_PORT || "6333");

        return new QdrantClient({
            url: `http://${host}:${port}`
        })
    }
}

const qdrant = createQdrantClient();

async function checkCollection(): Promise<void> {
    const collections = await qdrant.getCollections(); // getCollection for specific collection by name , getCollections for all
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                size: EMBEDDING_DIMENSIONS,
                distance: "Cosine"
            }
        })

        console.log(`Created Qdrant collection: ${COLLECTION_NAME}`);
    }
}

async function embed(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text
    })

    return response.data[0].embedding;
}

export async function storeSceneVector(sceneId: string, narration: string, storyId: number): Promise<void> {
    await checkCollection();

    const vector = await embed(narration);

    await qdrant.upsert(COLLECTION_NAME, {
        points: [
            {
                id: parseInt(sceneId),
                vector,
                payload: {
                    storyId: storyId.toString(),
                    narration,
                    createdAt: new Date().toISOString()
                }
            }
        ]
    })
}

export async function searchSimilarScenes(query: string, storyId: number, limit: number = 5): Promise<Array<{ sceneId: string; narration: string; score: number }>> {
    await checkCollection();

    const vector = await embed(query);

    const results = await qdrant.search(COLLECTION_NAME, {
        vector,
        filter: {
            must: [{ key: "storyId", match: { value: storyId.toString() } }]
        },
        limit,
        with_payload: true
    })

    return results.map((r) => ({
        sceneId: r.id as string,
        narration: r.payload?.narration as string,
        score: r.score
    }))
}