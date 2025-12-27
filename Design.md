# Once — Design Document

## Vision

Once is an AI-powered interactive fiction platform where **every choice has lasting consequences**. It's not a chatbot — it's a world that remembers.

## Core Philosophy

- **The world remembers** — Actions create echoes that ripple forward
- **Structured chaos** — LLMs are creative, but state is deterministic
- **Protagonist permanence** — Scars never heal, traits evolve

---

## Architecture

```
apps/
├── api/          # Hono + Bun server
│   ├── routes/   # API endpoints
│   ├── services/ # Business logic
│   ├── prompts/  # LLM prompts
│   └── lib/      # Utilities

packages/
├── database/     # Drizzle ORM + schema
└── shared/       # Zod schemas, error codes
```

---

## Key Systems

### Echo System
Delayed consequences that trigger when conditions are met.
- Planted during scenes
- Evaluated each turn
- Resolved naturally into narration

### Deferred Characters
Vault characters planted with trigger conditions.
- User sets trigger condition
- Evaluated each turn (like echoes)
- Introduced naturally when triggered

### Codex
Auto-generated encyclopedia of entities.
- Extracted after each scene
- Characters, locations, items, factions, events, lore
- Can be user-edited

### Memory (Mem0 + Qdrant + Neo4j)
Long-term context retrieval.
- Vector search for semantic similarity
- Graph for relationships
- Prevents context exhaustion on long stories

### Forking
Branch from any scene's protagonist snapshot.
- Copy-based (independent from original)
- Respects `allowForking` permission
- Enables "what if" exploration

---

## API Design

### Response Format
```typescript
// Success
{ success: true, data: T, meta?: {...} }

// Error
{ success: false, error: { code: string, message: string } }
```

### Key Endpoints
```
POST /api/stories                    — Create story
POST /api/stories/:id/continue       — Continue (batch)
POST /api/stories/:id/continue/stream — Continue (SSE)
POST /api/stories/:id/fork           — Fork from scene
GET  /api/stories/discover           — Public forkable stories
```

---

## Database Schema

### Core Tables
- `stories` — User stories with settings
- `protagonists` — Active characters in stories
- `scenes` — Individual story beats with snapshots
- `echoes` — Pending/resolved consequences
- `deferredCharacters` — Vault characters awaiting trigger
- `codexEntries` — Encyclopedia entries
- `vaultCharacters` — User's reusable characters

---

## LLM Integration

Using OpenAI Responses API with Zod structured output.

### Context Assembly
1. System prompt (narrative stance, mode)
2. Protagonist state (health, energy, traits, etc.)
3. Recent scenes (last 5)
4. Triggered echoes
5. Introduced characters
6. Factual knowledge (from memory search)

### Response Structure
```typescript
{
  narration: string,
  protagonistUpdates: { health?, energy?, addTraits?, ... },
  echoPlanted?: { description, triggerCondition }
}
```
