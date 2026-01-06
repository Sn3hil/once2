import type { NarrativeStance, StoryMode, StoryStatus, StoryVisibility } from "../schemas/common";

export interface Protagonist {
    id: number;
    storyId: number;
    name: string;
    description?: string;
    health: number;
    energy: number;
    currentLocation: string;
    baseTraits: string[];
    currentTraits: string[];
    inventory: string[];
    scars: string[];
    isActive: boolean;
}

export interface User {
    id: string;
    name: string;
    email?: string;
    image?: string;
}

export interface Scene {
    id: number;
    storyId: number;
    turnNumber: number;
    userAction: string;
    narration: string;
    mood?: string;
    protagonistId?: number;
}

export interface Story {
    id: number;
    userId: string;
    author?: string;
    user?: User;
    title: string;
    description?: string;
    genre: string;
    narrativeStance: NarrativeStance;
    storyMode: StoryMode;
    status: StoryStatus;
    visibility: StoryVisibility;
    turnCount: number;
    upvotes: number;
    allowForking: boolean;
    forkedFromStoryId?: number;
    forkedAtSceneId?: number;
    protagonist?: Protagonist[];
    scenes?: Scene[];
    createdAt: Date;
    updatedAt: Date;
}

export interface VaultCharacter {
    id: number;
    userId: string;
    name: string;
    description?: string;
    traits: string[];
    voice?: string;
    backstory?: string;
    relationships?: string;
    unresolvedConflicts?: string;
    timesUsed: number;
}

export interface CodexEntry {
    id: number;
    storyId: number;
    entryType: "character" | "location" | "item" | "event" | "concept";
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
    firstMentionedSceneId?: number;
}