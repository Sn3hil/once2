import { z } from "zod";

export const createDeferredCharacterSchema = z.object({
    vaultCharacterId: z.number().optional(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    role: z.string().optional(),
    triggerCondition: z.string().min(1, "Trigger condition is required")
});

export type CreateDeferredCharacterInput = z.infer<typeof createDeferredCharacterSchema>;