import { z } from "zod";
import { traitsArraySchema } from "./common";

export const createProtagonistSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    traits: traitsArraySchema.default([])
})

export const updateProtagonistSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    health: z.number().min(0).max(100).optional(),
    energy: z.number().min(0).max(100).optional(),
    location: z.string().optional()
})

export type CreateProtagonistInput = z.infer<typeof createProtagonistSchema>;
export type UpdateProtagonistInput = z.infer<typeof updateProtagonistSchema>;