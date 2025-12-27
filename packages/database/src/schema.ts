import { pgTable, serial, text, varchar, integer, boolean, timestamp, json, pgEnum, primaryKey, unique } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const narrativeStanceEnum = pgEnum("narrative_stance", [
    "grimdark",
    "heroic",
    "grounded",
    "mythic",
    "noir"
]);

export const storyVisibilityEnum = pgEnum("story_visibility", [
    "private",
    "public",
    "unlisted",
]);

export const storyStatusEnum = pgEnum("story_status", [
    "active",
    "completed",
    "abandoned",
]);

export const storyModeEnum = pgEnum("story_mode", [
    "protagonist",
    "narrator"
])

export const stories = pgTable("stories", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // References auth provider's user table

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    genre: varchar("genre", { length: 50 }).notNull(),
    narrativeStance: narrativeStanceEnum("narrative_stance").default("heroic").notNull(),
    storyMode: storyModeEnum("story_mode").default("protagonist").notNull(),
    status: storyStatusEnum("status").default("active").notNull(),
    turnCount: integer("turn_count").default(0).notNull(),
    forkedFromStoryId: integer("forked_from_story_id"),
    forkedAtSceneId: integer("forked_at_scene_id"),
    visibility: storyVisibilityEnum("visibility").default("private").notNull(),
    upvotes: integer("upvotes").default(0).notNull(),
    allowForking: boolean("allow_forking").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

export const protagonists = pgTable("protagonists", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    health: integer("health").default(100).notNull(),
    energy: integer("energy").default(100).notNull(),
    currentLocation: varchar("current_location", { length: 255 }).notNull(),
    baseTraits: json("base_traits").$type<string[]>().default([]).notNull(),
    currentTraits: json("current_traits").$type<string[]>().default([]).notNull(),

    // Inventory (array of item names for now, can be normalized later)
    inventory: json("inventory").$type<string[]>().default([]).notNull(),
    scars: json("scars").$type<string[]>().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scenes = pgTable("scenes", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),

    turnNumber: integer("turn_number").notNull(),
    userAction: text("user_action").notNull(),
    narration: text("narration").notNull(),

    protagonistSnapshot: json("protagonist_snapshot").$type<Record<string, unknown>>(),
    mood: varchar("mood", { length: 50 }),

    // Which protagonist was active during this scene (for ensemble stories)
    protagonistId: integer("protagonist_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const echoStatusEnum = pgEnum("echo_status", [
    "pending",
    "triggered",
    "resolved",
    "expired"
]);

export const echoes = pgTable("echoes", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),

    sourceSceneId: integer("source_scene_id").notNull(),
    description: text("description").notNull(),
    triggerCondition: text("trigger_condition").notNull(),
    status: echoStatusEnum("status").default("pending").notNull(),
    resolvedAtSceneId: integer("resolved_at_scene_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// character living long, out of the stories
export const vaultCharacters = pgTable("vault_characters", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    traits: json("traits").$type<string[]>().default([]).notNull(),
    voice: text("voice"),
    backstory: text("backstory"),
    relationships: text("relationships"),
    unresolvedConflicts: text("unresolved_conflicts"),

    timesUsed: integer("times_used").default(0).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deferredCharacters = pgTable("deferred_characters", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),

    vaultCharacterId: integer("vault_character_id"),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    role: text("role"),

    triggerCondition: text("trigger_condition").notNull(),

    introduced: boolean("introduced").default(false).notNull(),
    introducedAtSceneId: integer("introduced_at_scene_id"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const codexEntryTypeEnum = pgEnum("codex_entry_type", [
    "character",
    "location",
    "item",
    "faction",
    "event",
    "lore",
]);

export const codexEntries = pgTable("codex_entries", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),

    entryType: codexEntryTypeEnum("entry_type").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    summary: text("summary").notNull(),

    // Relationships and context

    // without .$type<number[]>() , ts will infer its type as any or unknown , it's for ts so it can infer correct type
    relatedEntries: json("related_entries").$type<number[]>().default([]),
    firstMentionedSceneId: integer("first_mentioned_scene_id"),
    lastUpdatedSceneId: integer("last_updated_scene_id"),

    // User can edit if LLM got something wrong
    userEdited: boolean("user_edited").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storyUpvotes = pgTable("story_upvotes", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
    unique().on(table.storyId, table.userId),
]);


export const storySuggestions = pgTable("story_suggestions", {
    id: serial("id").primaryKey(),
    storyId: integer("story_id").notNull(),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storiesRelations = relations(stories, ({ one, many }) => ({
    protagonist: many(protagonists),
    scenes: many(scenes),
    echoes: many(echoes),
    deferredCharacters: many(deferredCharacters),
    codexEntries: many(codexEntries),
    upvotes: many(storyUpvotes),
    suggestions: many(storySuggestions),
    forkedFrom: one(stories, {
        fields: [stories.forkedFromStoryId],
        references: [stories.id],
    }),
}));

export const protagonistsRelations = relations(protagonists, ({ one }) => ({
    story: one(stories, {
        fields: [protagonists.storyId],
        references: [stories.id],
    }),
}));

export const scenesRelations = relations(scenes, ({ one }) => ({
    story: one(stories, {
        fields: [scenes.storyId],
        references: [stories.id],
    }),
    protagonist: one(protagonists, {
        fields: [scenes.protagonistId],
        references: [protagonists.id],
    }),
}));

export const echoesRelations = relations(echoes, ({ one }) => ({
    story: one(stories, {
        fields: [echoes.storyId],
        references: [stories.id],
    }),
    sourceScene: one(scenes, {
        fields: [echoes.sourceSceneId],
        references: [scenes.id],
    }),
    resolvedAtScene: one(scenes, {
        fields: [echoes.resolvedAtSceneId],
        references: [scenes.id],
    }),
}));

export const vaultCharactersRelations = relations(vaultCharacters, ({ many }) => ({
    deferredCharacters: many(deferredCharacters),
}));

export const deferredCharactersRelations = relations(deferredCharacters, ({ one }) => ({
    story: one(stories, {
        fields: [deferredCharacters.storyId],
        references: [stories.id],
    }),
    vaultCharacter: one(vaultCharacters, {
        fields: [deferredCharacters.vaultCharacterId],
        references: [vaultCharacters.id],
    }),
    introducedAtScene: one(scenes, {
        fields: [deferredCharacters.introducedAtSceneId],
        references: [scenes.id],
    }),
}));

export const codexEntriesRelations = relations(codexEntries, ({ one }) => ({
    story: one(stories, {
        fields: [codexEntries.storyId],
        references: [stories.id],
    }),
}));

export const storyUpvotesRelations = relations(storyUpvotes, ({ one }) => ({
    story: one(stories, {
        fields: [storyUpvotes.storyId],
        references: [stories.id],
    }),
}));

export const storySuggestionsRelations = relations(storySuggestions, ({ one }) => ({
    story: one(stories, {
        fields: [storySuggestions.storyId],
        references: [stories.id],
    }),
}));