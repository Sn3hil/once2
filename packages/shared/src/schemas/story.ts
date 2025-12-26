import { z } from "zod";
import { narrativeStanceSchema, storyModeSchema, traitsArraySchema } from "./common"

export const createStorySchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    description: z.string().optional(),
    genre: z.string().min(1, "Genre is required").max(50),
    narrativeStance: narrativeStanceSchema.default("heroic"),
    storyMode: storyModeSchema.default("protagonist"),
    protagonist: z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        traits: traitsArraySchema.default([]),
        location: z.string().min(1).max(255)
    }).optional()
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;