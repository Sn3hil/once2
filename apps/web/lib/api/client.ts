import type { ApiResponse } from "@once/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options?.headers
            }
        })

        const json = await res.json();

        if (!res.ok) {
            return {
                error: json.error || { message: "Request failed", code: "UNKNOWN" }
            }
        }

        return { data: json.data, meta: json.meta };
    } catch (err) {
        return {
            error: { message: "Network error", code: "NETWORK_ERROR" }
        }
    }
}