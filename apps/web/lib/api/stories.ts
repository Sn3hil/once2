import { CodexEntry, Scene, Story, Analytics } from "@once/shared";
import { apiClient } from "./client";
import type { CreateStoryInput } from "@once/shared/schemas";

export const storiesApi = {
    list: () => apiClient<Story[]>("/api/stories"),
    get: (id: string) => apiClient<Story>(`/api/stories/${id}`),
    create: (data: CreateStoryInput) => apiClient<any>("/api/stories", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    discover: () => apiClient<Story[]>("/api/stories/discover"),
    upvote: (id: string) => apiClient<{ upvoted: boolean; upvotes: number }>(`/api/stories/${id}/upvote`, {
        method: "POST"
    }),
    addNote: (id: string, content: string) => apiClient(`/api/stories/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ content, isPublic: false })
    }),
    fork: (id: string, sceneId: number) => apiClient<Story>(`/api/stories/${id}/fork`, {
        method: "POST",
        body: JSON.stringify({ sceneId })
    }),
    getScenes: (id: string) => apiClient<Scene[]>(`/api/stories/${id}/scenes`),
    continue: (id: string, action: string) => apiClient<{ scene: Scene; protagonistUpdates?: any }>(`/api/stories/${id}/continue`, {
        method: "POST",
        body: JSON.stringify({ action })
    }),
    getCodex: (id: string) => apiClient<CodexEntry[]>(`/api/stories/${id}/codex`),
    getAnalytics: () => apiClient<Analytics>('/api/stories/analytics')
}