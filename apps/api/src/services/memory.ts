// import { Memory, SearchResult } from "mem0ai/oss";

// const config = {
//     enableGraph: true,
//     graphStore: {
//         provider: "neo4j",
//         config: {
//             url: process.env.NEO4J_URL || "bolt://localhost:7687",
//             username: process.env.NEO4J_USERNAME!,
//             password: process.env.NEO4J_PASSWORD!,
//             database: "neo4j",
//         },
//     },
//     llm: {
//         provider: "openai",
//         config: { model: "gpt-4o-mini" }
//     },
//     vector_store: {
//         provider: "qdrant",
//         config: {
//             collection_name: "once_memories",
//             host: process.env.QDRANT_HOST || "localhost",
//             port: parseInt(process.env.QDRANT_PORT || "6333"),
//             embedding_model_dims: 1536,
//         }
//     },
//     embedder: {
//         provider: "openai",
//         config: {
//             model: "text-embedding-3-small",
//             embedding_dims: 1536
//         }
//     }
// };

// const memory = new Memory(config);

// type Message = { role: "user" | "assistant"; content: string };

// export async function storeMemory(messages: Message[], userId: string) {
//     await memory.add(messages, { userId });
// }

// export async function searchMemory(query: string, userId: string, limit = 10): Promise<SearchResult> {
//     return memory.search(query, { userId, limit });
// }

import type { SearchResult } from "mem0ai/oss";

type Message = { role: "user" | "assistant"; content: string };

let memoryInstance: any = null;

async function getMemory() {
    if (memoryInstance) return memoryInstance;

    const { Memory } = await import("mem0ai/oss");

    const config = {
        enableGraph: true,
        graphStore: {
            provider: "neo4j",
            config: {
                url: process.env.NEO4J_URL || "bolt://localhost:7687",
                username: process.env.NEO4J_USERNAME!,
                password: process.env.NEO4J_PASSWORD!,
                database: "neo4j",
            },
        },
        llm: {
            provider: "openai",
            config: { model: "gpt-4o-mini" }
        },
        vector_store: {
            provider: "qdrant",
            config: {
                collection_name: "once_memories",
                host: process.env.QDRANT_HOST || "localhost",
                port: parseInt(process.env.QDRANT_PORT || "6333"),
                embedding_model_dims: 1536,
            }
        },
        embedder: {
            provider: "openai",
            config: {
                model: "text-embedding-3-small",
                embedding_dims: 1536
            }
        }
    };

    memoryInstance = new Memory(config);
    return memoryInstance;
}

export async function storeMemory(messages: Message[], userId: string) {
    try {
        const memory = await getMemory();
        await memory.add(messages, { userId });
    } catch (err) {
        console.error("Memory store error:", err);
    }
}

export async function searchMemory(query: string, userId: string, limit = 10): Promise<SearchResult> {
    try {
        const memory = await getMemory();
        return memory.search(query, { userId, limit });
    } catch (err) {
        console.error("Memory search error:", err);
        return { results: [] } as SearchResult;
    }
}