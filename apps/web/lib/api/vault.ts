import { VaultCharacter } from "@once/shared";
import { apiClient } from "./client";
import type { CreateVaultCharacterInput } from "@once/shared/schemas";

export const vaultApi = {
    list: () => apiClient<VaultCharacter[]>("/api/vault"),
    get: (id: string) => apiClient<VaultCharacter>(`/api/vault/${id}`),
    create: (data: CreateVaultCharacterInput) => apiClient<VaultCharacter>("/api/vault", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateVaultCharacterInput>) => apiClient<VaultCharacter>(`/api/vault/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiClient(`/api/vault/${id}`, { method: "DELETE" })
}