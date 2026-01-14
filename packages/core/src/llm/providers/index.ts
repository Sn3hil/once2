import type { LLMProvider, EmbeddingProvider } from './types'
import { openaiLLM, openaiEmbedding } from './openai'
import { googleLLM, googleEmbedding } from './google'

export type ProviderType = 'openai' | 'google'

const provider = (process.env.LLM_PROVIDER || 'openai') as ProviderType

export function getLLMProvider(): LLMProvider {
    switch (provider) {
        case 'google':
            return googleLLM
        case 'openai':
        default:
            return openaiLLM
    }
}

export function getEmbeddingProvider(): EmbeddingProvider {
    switch (provider) {
        case 'google':
            return googleEmbedding
        case 'openai':
        default:
            return openaiEmbedding
    }
}

export const llm = getLLMProvider()
export const embedder = getEmbeddingProvider()

export type { LLMProvider, EmbeddingProvider } from './types'