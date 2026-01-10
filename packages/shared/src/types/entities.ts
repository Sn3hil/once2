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
    mood?: string | null;
    protagonistId?: number | null;
    protagonistSnapshot?: Record<string, unknown> | null;
    createdAt?: string
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
    createdAt: string;
    updatedAt: string;
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

export interface Analytics {
    totals: {
        upvotes: number;
        notes: number;
        forks: number;
        published: number;
    }
    stories: Array<{
        id: number;
        title: string;
        upvotes: number;
        notesCount: number;
        forkCount: number;
        turnCount: number;
        createdAt: string;
    }>;
    recentNotes: Array<{
        id: number;
        storyId: number;
        storyTitle: string;
        content: string;
        createdAt: string;
    }>
}

export interface StreamCompleteData {
    scene: {
        sceneId: number;
        protagonistId?: number | null;
        mood?: string | null;
        createdAt: string;
    };
    protagonistSnapshot?: Record<string, unknown> | null;
    protagonistUpdates?: {
        health?: number | null;
        energy?: number | null;
        location?: string | null;
        addTraits?: string[] | null;
        removeTraits?: string[] | null;
        addInventory?: string[] | null;
        removeInventory?: string[] | null;
        addScars?: string[] | null
    } | null;
    echoPlanted: boolean;
}