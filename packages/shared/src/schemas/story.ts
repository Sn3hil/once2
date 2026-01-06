import { z } from "zod";
import { narrativeStanceSchema, storyModeSchema, traitsArraySchema } from "./common"

export const createStorySchema = z.object({
    title: z.string().min(1, "Title is required").max(30, "Title can not be more than 20 characters"),
    description: z.string().optional(),
    genre: z.string().min(1, "Genre is required").max(20, "Genre can not be more than 20 characters"),
    narrativeStance: narrativeStanceSchema.default("heroic"),
    storyMode: storyModeSchema.default("protagonist"),
    storyIdea: z.string().min(10, "Story idea/ plot must be at least 10 characters").max(200, "Story Idea/ plot can not be more than 200 characters").optional(),
    protagonist: z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        traits: traitsArraySchema.default([]),
        location: z.string().min(1).max(255)
    }).optional()
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;