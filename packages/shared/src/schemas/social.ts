import { z } from "zod";

export const noteSchema = z.object({
    content: z.string().min(1, "Note cannot be empty").max(500),
    isPublic: z.boolean().default(false),
});

export type UpvoteCommentSchema = z.infer<typeof noteSchema>;