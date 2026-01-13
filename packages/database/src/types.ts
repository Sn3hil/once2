import { stories, scenes, echoes, deferredCharacters, protagonists, vaultCharacters } from "./schema";
import type { InferSelectModel } from "drizzle-orm"

export type storySchema = InferSelectModel<typeof stories>;
export type scenesSchema = InferSelectModel<typeof scenes>;
export type protagonistSchema = InferSelectModel<typeof protagonists>;
export type deferredCharactersSchema = InferSelectModel<typeof deferredCharacters>;
export type echoesSchema = InferSelectModel<typeof echoes>;
export type vaultCharactersSchema = InferSelectModel<typeof vaultCharacters>;