# Once — Backend Architecture Design

> **This design is not rigid.** We love to explore new ideas while implementing. If you discover a better approach, pursue it — just update this document to keep everyone aligned.

This document captures the vision, architecture, and decisions behind Once. Read this to understand not just WHAT we're building, but WHY. The technical specifications matter less than the philosophy they serve.

---

## The Vision

Once is not a chatbot. It's not a "choose your own adventure." It's a **world that remembers**.

### What We're Building

Imagine a story where:
- The lie you told in scene 3 returns to haunt you in scene 47
- The stranger you spared becomes an unlikely ally... or a bitter enemy
- Your character's cynicism, earned through failure, shapes how NPCs perceive you
- You can fork back to any moment and ask "what if I had chosen differently?"

This is **persistent consequence storytelling**. Every choice plants seeds. Every seed grows into something. The world doesn't forget.

### Why This Matters

Most AI storytelling is ephemeral. You chat, the model responds, context fades. Once is different because:

1. **Memory is structured** — We use postgres for facts, knowledge graphs for relationships, vectors for vibes. Not just a context window.

2. **State is deterministic** — The LLM returns structured updates (health changed, item acquired, trait evolved). We don't guess — we track.

3. **Echoes create surprise** — When you anger the merchant, we plant an Echo: "this will matter when you need supplies." The player doesn't see it. Ten scenes later, the consequence unfolds.

4. **Forking enables exploration** — Every scene snapshots the world state. Fork back, try a different path. "Save files" for narrative.

### The Feeling We Want

Playing Once should feel like:
- Sitting by a fire with a master storyteller who never forgets your name
- Reading a book that writes itself around your choices
- Inhabiting a world where you matter — not just to the narrative, but to the world itself

The narrator never breaks character. The world never feels procedural. Every scene is crafted for THIS story, THIS protagonist, THIS moment.

---

## Design Principles

These principles guide every decision. When in doubt, return to these:

1. **The World Remembers** — Every choice persists. Nothing is throwaway. Build systems that accumulate meaning over time.

2. **Show, Don't Tell** — The protagonist evolves through action, not exposition. Traits change because of what happened, not because we summarized it.

3. **Surprise Over Prediction** — Echoes are invisible. The player shouldn't see the consequence coming — that's what makes it land.

4. **Forking is Time Travel** — Any past scene is a valid branch point. The architecture must support this.

5. **Narrator as Character** — The narrative stance (grimdark, heroic, etc.) isn't just flavor — it changes the rules of the world.

6. **Structured Chaos** — LLMs are creative but inconsistent. We use structured output to get deterministic state changes while allowing narrative freedom.

---

## Core Philosophy

Once is a world simulation engine, not a chatbot. Every component is designed around one principle: **choices have persistent, compounding consequences**.

The backend must:
1. Remember everything (via database + knowledge graph + vector store)
2. Surface relevant context each turn (via intelligent retrieval)
3. Track state changes deterministically (via structured LLM output)
4. Support forking and branching (via scene snapshots)

---

## Package Structure

```
once/
├── apps/
│   └── api/                    # Hono HTTP server
│       ├── src/
│       │   ├── index.ts        # Main app, middleware, route mounting
│       │   ├── routes/         # Endpoint handlers
│       │   ├── services/       # Business logic (LLM, memory)
│       │   ├── prompts/        # LLM prompt templates
│       │   └── lib/            # Utilities (response helpers)
├── packages/
│   ├── database/               # Drizzle ORM, schema, client
│   │   ├── src/
│   │   │   ├── index.ts        # DB client export + operators
│   │   │   └── schema.ts       # All tables and relations
│   │   └── drizzle/            # Migrations
│   └── shared/                 # Types shared between frontend/backend
│       └── src/
│           ├── schemas/        # Zod validation schemas
│           ├── types/          # TypeScript types
│           └── errors.ts       # Centralized error codes
```

---

## Database Schema Design

### Core Entities

**stories** — The container for a narrative
- Has one-to-many relationship with protagonists (for ensemble support)
- Tracks forking via `forkedFromStoryId` and `forkedAtSceneId`
- Has narrative stance (grimdark, heroic, grounded, mythic, noir)
- Has story mode (protagonist or narrator)

**protagonists** — Characters the user controls
- Multiple protagonists per story (ensemble cast)
- `isActive` flag indicates current POV character
- `baseTraits` are original, `currentTraits` evolve over time
- `scars` are permanent marks that never heal
- State (health, energy, location, inventory) changes each turn

**scenes** — The turn-by-turn log
- Sequential `turnNumber` within each story
- Stores `userAction` (what player typed) and `narration` (LLM response)
- `protagonistSnapshot` (JSON) captures full state at this moment — critical for forking
- `mood` drives ambient UI effects
- Scenes are immutable once created

**echoes** — Delayed consequences
- Planted when a choice has future implications
- `triggerCondition` (natural language) describes when to resolve
- Status: pending → triggered → resolved (or expired)
- LLM evaluates pending echoes each turn

**vaultCharacters** — User's saved character templates
- Owned by user, not tied to any story
- Can be placed into stories as protagonists or deferred characters
- `timesUsed` tracks reuse

**deferredCharacters** — Characters waiting to enter a story
- Linked to a story, waiting for trigger condition
- Can reference a vault character or be custom
- When `introduced`, links to the scene where they appeared

**codexEntries** — Auto-generated story encyclopedia
- Types: character, location, item, faction, event, lore
- LLM extracts entities from each scene
- `userEdited` flag prevents auto-overwrite of user corrections

**storyUpvotes** — Community engagement (upvotes only, no downvotes)

**storySuggestions** — Private feedback, optionally made public

### Key Design Decisions

1. **Protagonist is 1:many with Story** — Supports ensemble stories where user can switch between characters. Use `isActive` to track current POV.

2. **Scene snapshots for forking** — Every scene stores protagonist state. When forking, restore from snapshot.

3. **Echoes use natural language triggers** — LLM interprets trigger conditions, not code. Allows fuzzy triggers like "when in danger."

4. **Traits are hybrid** — Suggested traits provided in UI, but any string accepted. Max 5 traits, max 100 chars each.

5. **No cascade deletes** — Stories soft-delete to "abandoned" status. Data preserved for forking.

---

## API Design

### Response Envelope

All endpoints return consistent shape:

```typescript
{
  data?: T;              // Success payload
  error?: {
    message: string;
    code: ErrorCode;     // Type-safe, from centralized list
  };
  meta?: {               // For paginated lists
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### Error Codes

Centralized in `packages/shared/src/errors.ts`. Each code maps to HTTP status and default message:

```typescript
ERROR_CODES = {
  VALIDATION_ERROR: { status: 400, message: "..." },
  NOT_FOUND: { status: 404, message: "..." },
  LLM_ERROR: { status: 500, message: "..." },
  // etc
}
```

Usage: `error(c, "NOT_FOUND")` or `error(c, "NOT_FOUND", "Custom message")`

### Route Structure

```
GET    /health                     — Health check
GET    /api/stories                — List user's stories
POST   /api/stories                — Create story (generates opening scene)
GET    /api/stories/:id            — Get story with protagonist
DELETE /api/stories/:id            — Soft delete (set status to abandoned)
GET    /api/stories/:id/scenes     — Get all scenes
GET    /api/stories/:id/codex      — Get codex entries
GET    /api/stories/:id/echoes     — Get echoes
POST   /api/stories/:id/continue   — Continue story (main gameplay loop)
POST   /api/stories/:id/fork       — Fork from a scene

GET    /api/vault                  — List vault characters
POST   /api/vault                  — Create vault character
GET    /api/vault/:id              — Get vault character
PATCH  /api/vault/:id              — Update vault character
DELETE /api/vault/:id              — Delete vault character
POST   /api/vault/from-protagonist/:id — Save protagonist to vault
```

---

## LLM Integration

### Service Layer (`services/llm.ts`)

Uses OpenAI Responses API with three functions:

1. `streamNarration(instructions, input)` — Streaming text response
2. `generateResponse(instructions, input)` — Non-streaming text
3. `generateStructured(instructions, input, schema, name)` — Zod-validated structured output

All use `instructions` (system prompt) and `input` (user prompt).

### Prompt System (`prompts/`)

**system.ts** — Base system prompt
- Sets narrator persona based on narrative stance
- Defines perspective (2nd person for protagonist mode, 3rd for narrator)
- Core laws: world remembers, no meta-commentary, vivid specifics

**initialize.ts** — Opening scene generation
- Takes title, genre, stance, mode, optional protagonist
- If no protagonist provided, LLM generates one
- Should return: narration + optional protagonist data

**continue.ts** — Story continuation
- Takes protagonist state, recent scenes (last 5), user action
- Includes health, energy, location, traits, inventory, scars
- Returns: narration + protagonist updates + optional echo

### LLM Response Schemas (`shared/schemas/llm.ts`)

**openSceneSchema**:
```typescript
{
  narration: string,
  protagonistGenerated?: { name, description, traits, location }
}
```

**sceneResponseSchema**:
```typescript
{
  narration: string,
  protagonistUpdates?: {
    health?, energy?, location?,
    addTraits?, removeTraits?,
    addInventory?, removeInventory?,
    addScars?
  },
  echoPlanted?: {
    description: string,
    triggerCondition: string  // When should this resolve
  }
}
```

---

## The Story Loop

### Creating a Story (`POST /api/stories`)

1. Validate input (title, genre, narrativeStance, storyMode, protagonist?)
2. Insert story record
3. If protagonist provided, insert protagonist record
4. Build system prompt (stance, mode)
5. Build initialize prompt (title, genre, protagonist?)
6. Call LLM for structured output (openSceneSchema)
7. If protagonist auto-generated, insert protagonist from LLM response
8. Insert scene (turnNumber: 1, userAction: "[STORY_START]")
9. Return story with protagonist and opening scene

### Continuing a Story (`POST /api/stories/:id/continue`)

1. Validate story exists and is active
2. Get active protagonist (`isActive: true`)
3. Get last 5 scenes for recency buffer
4. Build system prompt (stance, mode)
5. Build continue prompt (protagonist state, recent scenes, user action)
6. Call LLM for structured output (sceneResponseSchema)
7. Apply protagonist updates:
   - Update health, energy, location
   - Add/remove traits
   - Add/remove inventory
   - Add scars (never remove)
8. Insert new scene with snapshot
9. Increment story turnCount
10. If echo planted, insert echo with triggerCondition
11. Return scene + updates + echo status

### TODO: Echo Evaluation

Each turn, before generating response:
1. Get pending echoes for this story
2. Build prompt with current context + echo descriptions + trigger conditions
3. Ask LLM: "Which echoes should trigger?"
4. For triggered echoes, include them in continue prompt
5. After scene, mark triggered echoes as "resolved"

### TODO: Codex Extraction

After each scene:
1. Build extraction prompt with scene narration
2. Ask LLM to identify entities: characters, locations, items, factions
3. For each entity:
   - If exists in codex: update summary if new info learned
   - If not exists: create new entry
4. Respect `userEdited` flag — don't overwrite user corrections

---

## Forking

When user forks from scene N:

1. Get original story and scene N
2. Get protagonist snapshot from scene N
3. Create new story with:
   - `forkedFromStoryId` = original story ID
   - `forkedAtSceneId` = scene N ID
   - Copy story metadata (genre, stance, mode)
4. Create protagonist from snapshot
5. User continues from there — new story is independent

---

## Memory System (Planned)

### Components

1. **PostgreSQL** — Structured data (stories, scenes, protagonists)
2. **Neo4j** — Knowledge graph (relationships, facts, cause-effect chains)
3. **Qdrant** — Vector store (semantic similarity for past moments)
4. **Mem0** — Orchestrates graph and vector stores

### Context Assembly

Before each LLM call:

1. **Recency Buffer** — Last N scenes from PostgreSQL
2. **Protagonist State** — Current health, traits, inventory, etc.
3. **Pending Echoes** — From echoes table
4. **Deferred Characters** — Check trigger conditions
5. **Semantic Search** — Query Qdrant with user action for similar past moments
6. **Graph Query** — Query Neo4j for relationships and facts

All assembled into context for LLM prompt.

---

## Validation Patterns

All validation schemas live in `packages/shared/src/schemas/`:

- `common.ts` — Enums (stance, mode, status), trait schemas
- `story.ts` — createStorySchema
- `vault.ts` — createVaultCharacterSchema, updateVaultCharacterSchema
- `llm.ts` — openSceneSchema, sceneResponseSchema

Frontend and backend import from same package — single source of truth.

### Trait System

```typescript
// Suggested traits (for UI hints)
export const suggestedTraits = ["optimistic", "cynical", ...] as const;

// Validation (allows any string)
export const traitSchema = z.string().min(1).max(100);
export const traitsArraySchema = z.array(traitSchema).max(5);
```

Frontend shows suggestions, user can pick or type custom.

---

## Key Conventions

1. **testUserId** — Hardcoded until auth is implemented. Replace with session user.

2. **Protagonist is array** — Always access via `story.protagonist.find(p => p.isActive)` or handle array.

3. **Soft deletes** — Stories set to `status: "abandoned"`, never hard deleted.

4. **Immutable scenes** — No `updatedAt` on scenes. Once created, never modified.

5. **Echo triggerCondition** — Natural language, interpreted by LLM. Not code.

6. **Error helper** — Use `error(c, "CODE")` not raw JSON responses.

7. **Success helper** — Use `success(c, data, status?)` for consistency.

---

## File Dependencies

```
routes/stories.ts
  ├── imports from @once/database (db, eq, desc, tables)
  ├── imports from @once/shared/schemas (validation, LLM schemas)
  ├── imports from ./lib/response (success, error)
  ├── imports from ./prompts/* (buildSystemPrompt, buildInitializePrompt, buildContinuePrompt)
  └── imports from ./services/llm (generateStructured)

services/llm.ts
  ├── uses OpenAI SDK directly
  └── uses Zod for structured output

prompts/*.ts
  └── imports types from @once/shared/schemas (NarrativeStance, StoryMode)

lib/response.ts
  └── imports ErrorCode and helpers from @once/shared/errors
```

---

## What's Not Implemented Yet

1. **Authentication** — Using hardcoded testUserId
2. **Echo evaluation loop** — Pending echoes not checked each turn
3. **Codex extraction** — Not running after scenes
4. **Deferred character triggers** — Not evaluated
5. **Memory system** — Neo4j/Qdrant not connected
6. **SSE streaming** — Response is batch, not streamed
7. **Fork endpoint** — Schema ready, endpoint not implemented
8. **Rate limiting** — Not implemented
9. **Caching** — Not implemented

---

## Recently Fixed (2024-12-27)

1. ✅ **protagonist treated as object** — Now correctly uses `activeProtagonist = story.protagonist.find(p => p.isActive)`
2. ✅ **echoPlanted.severity** — Changed LLM schema to return `triggerCondition` instead, aligned with echoes table
3. ✅ **removeTraits/removeInventory** — Now properly filters out removed items

---

## Ideas to Explore

These are concepts we've discussed but haven't fully implemented. They're not commitments — they're possibilities:

### Codex as Wishlist
The Codex isn't just a record — it's also a planting ground. Users could add entries for things that don't exist yet: characters they want to meet, places they want to visit, items they're seeking. The system weaves them in when narratively appropriate. This turns passive recording into active world-building.

### Echo Severity Levels
Different echoes could have different weights. Minor echoes might just add color. Major echoes reshape the narrative. This could drive pacing — early story plants minor seeds, late story triggers major consequences.

### Narrator Memory Bleed
What if the narrator occasionally references other stories? "You remind me of another traveler who came this way..." Cross-story continuity without breaking the fourth wall.

### Emotional Resonance Scoring
Track not just what happened, but how it felt. Was this scene triumphant? Tragic? Tense? Use this to shape ambient UI, music selection, and narrator voice.

### Character Chemistry
When multiple characters are present, generate a "chemistry" score. Some characters naturally conflict. Some naturally bond. Let this influence dialogue and interactions.

### Plot Compass Direction
The user could set a general direction without forcing it: "I want to find my father" or "I want to become a king." The system nudges the narrative toward these goals while respecting player freedom.

---

## Closing Thoughts

This document is a living artifact. It captures where we've been and where we're going, but it's not a prison. The best ideas often emerge during implementation.

When you're working on Once:
- If something feels wrong, question the design
- If you have a better idea, try it
- If it works, update this document
- If it doesn't, we learned something

The goal isn't to follow a plan perfectly. The goal is to build something that makes stories feel alive.

---

*Last updated: 2024-12-27*

