import { z } from "zod";
import { traitsArraySchema } from "./common";

export const createVaultCharacterSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
    traits: traitsArraySchema.default([]),
    voice: z.string().optional(),
    backstory: z.string().optional(),
    relationships: z.string().optional(),
    unresolvedConflicts: z.string().optional(),
});

export const updateVaultCharacterSchema = createVaultCharacterSchema.partial();

export type CreateVaultCharacterInput = z.infer<typeof createVaultCharacterSchema>;
export type UpdateVaultCharacterInput = z.infer<typeof updateVaultCharacterSchema>;