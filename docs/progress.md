# Once — Project Progress

---

## Technology Stack

### Backend
- Hono (HTTP framework)
- Bun (runtime)
- PostgreSQL (database)
- Drizzle ORM
- Zod (validation)

### LLM Integration
- Vercel AI SDK
- SSE streaming
- OpenAI

### Memory
- Neo4j (knowledge graph)
- Qdrant (vector store)
- Mem0 (orchestration)

### Infrastructure
- Turborepo (monorepo)
- Redis/Upstash (cache, rate limiting, sessions)
- Better Auth (authentication)

---

## Patterns and Conventions

### Shared Types Package (@once/shared)
All validation schemas and types shared between frontend and backend live in `packages/shared`:
- `src/schemas/common.ts` — Enums, traits, shared primitives
- `src/schemas/index.ts` — Story schemas (createStorySchema)
- `src/schemas/vault.ts` — Vault character schemas (TODO)
- `src/types/api.ts` — API response types
- `src/errors.ts` — Centralized error codes with status mapping

### Trait System (Hybrid Approach)
Traits use a hybrid model:
- `suggestedTraits` array provides UI hints (clickable suggestions)
- Validation allows any string (max 100 chars, max 5 traits)
- Users can pick suggestions OR enter custom traits
- Located in `packages/shared/src/schemas/common.ts`

### Error Code System
Centralized error codes in `packages/shared/src/errors.ts`:
- Each code maps to HTTP status and default message
- API uses `error(c, "CODE")` or `error(c, "CODE", "custom message")`
- Type-safe: ErrorCode type ensures only valid codes are used
- Frontend can use same codes for consistent error handling

### Response Helpers
`apps/api/src/lib/response.ts` provides:
- `success(c, data, status?)` — Wrap successful responses
- `error(c, code, message?)` — Wrap error responses
- `paginated(c, data, meta)` — Wrap paginated lists

### Database Exports
`packages/database/src/index.ts` exports:
- `db` — Drizzle client
- All schema tables and relations
- `eq`, `desc` and other Drizzle operators

---

## New Ideas (In Progress)

### Codex as Wishlist
The Codex isn't just a record — it's also a planting ground. Users can add entries for things that don't exist yet: characters, locations, items. The system weaves them in when narratively appropriate. This turns passive recording into active world-building.

### Echo Visibility  
Echoes are invisible by default. The magic is surprise. "Director's commentary" mode for replays can reveal pending echoes, but the primary experience keeps them hidden.

### Streaming Trade-off (Architectural Decision)

**Why we use "fake streaming"**: The LLM returns structured output with both `narration` AND `protagonistUpdates` + `echoPlanted` in one response. Structured JSON requires the complete response before validation — you can't validate incomplete JSON.

**Current approach (fake stream)**:
1. Get full structured response from LLM
2. Parse and validate JSON
3. Stream narration word-by-word to client
4. Apply protagonist updates after streaming

**Trade-off**: Initial delay while waiting for full response, but single LLM call (cost efficient, consistent).

**Alternative (two calls)**:
1. First call: Stream narration in real-time
2. Second call: Analyze narration → return structured updates

**Trade-off**: True streaming UX, but 2x cost, added latency, potential inconsistency between calls.

**Decision**: Fake streaming is acceptable for MVP. Revisit if initial delay feels too long or if OpenAI adds better support for streaming + function calls together.

---

## Task List

### Phase 1: Project Foundation

- [x] Define monorepo structure (apps/, packages/)
- [x] Create database package (packages/database)
- [x] Setup TypeScript configuration
- [ ] Configure ESLint and Prettier
- [ ] Setup path aliases
- [x] Install and configure Drizzle ORM
- [x] Create database client export (src/index.ts)

### Phase 2: Database Schema

- [x] Define narrative stance enum
- [x] Define story visibility enum
- [x] Define story status enum
- [x] Define story mode enum
- [x] Define echo status enum
- [x] Define codex entry type enum
- [x] Create stories table
- [x] Create protagonists table
- [x] Create scenes table
- [x] Create echoes table
- [x] Create vault characters table
- [x] Create deferred characters table
- [x] Create codex entries table
- [x] Create story upvotes table
- [x] Create story suggestions table
- [x] Define all table relations
- [x] Generate initial migration
- [x] Push to PostgreSQL

### Phase 3: API Layer (Hono)

- [x] Create API package (apps/api)
- [x] Setup Hono with base configuration
- [x] Configure CORS middleware
- [x] Setup request logging middleware (logger)
- [x] Setup error handling middleware
- [x] Create shared Zod schemas (@once/shared)
- [x] Create response helpers (success, error, paginated)
- [x] Create error code system

### Phase 4: Core API Endpoints

- [x] GET /health
- [x] POST /api/stories (with LLM opening scene)
- [x] GET /api/stories
- [x] GET /api/stories/:id
- [x] GET /api/stories/discover (public forkable)
- [x] DELETE /api/stories/:id
- [x] GET /api/stories/:id/scenes
- [x] GET /api/stories/:id/codex
- [x] GET /api/stories/:id/echoes
- [x] GET /api/stories/:id/deferred-characters
- [x] POST /api/stories/:id/deferred-characters
- [x] DELETE /api/stories/:id/deferred-characters/:characterId
- [x] POST /api/stories/:id/continue
- [x] POST /api/stories/:id/continue/stream (SSE)
- [x] POST /api/stories/:id/fork

### Phase 5: Protagonist Endpoints ✅

- [x] GET /api/stories/:id/protagonists
- [x] POST /api/stories/:id/protagonists
- [x] PATCH /api/stories/:id/protagonists/:pid
- [x] POST /api/stories/:id/protagonists/:pid/activate

### Phase 6: Character Vault Endpoints

- [x] GET /api/vault
- [x] POST /api/vault
- [x] GET /api/vault/:id
- [x] PATCH /api/vault/:id
- [x] DELETE /api/vault/:id
- [x] POST /api/vault/from-protagonist/:id

### Phase 7: LLM Integration

- [x] Install OpenAI SDK (using Responses API)
- [x] Create LLM service abstraction (`services/llm.ts`)
- [x] Create system prompt (`prompts/system.ts`)
- [x] Create initialization prompt (`prompts/initialize.ts`)
- [x] Create continuation prompt (`prompts/continue.ts`)
- [x] Define response schemas (`shared/schemas/llm.ts`)
- [x] Implement story initialization (POST /api/stories generates opening scene)
- [x] Implement story continuation (POST /api/stories/:id/continue)
- [x] Implement echo evaluation + planting + resolution
- [x] Implement codex extraction (background)
- [x] Implement SSE streaming (POST /api/stories/:id/continue/stream)
- [x] Refactor routes to services (echo, protagonist, story, codex)
- [ ] Add retry logic
- [ ] Add timeout handling

### Phase 8: Prompt System ✅

- [x] Create prompt template system
- [x] Create initialization prompt (`prompts/initialize.ts`)
- [x] Create continuation prompt (`prompts/continue.ts`)
- [x] Create codex extraction prompt (`prompts/codex.ts`)
- [x] Create echo evaluation prompt (`prompts/echo.ts`)
- [x] Create deferred character prompt (`prompts/deferred.ts`)
- [x] Add narrative stance variations
- [x] Add story mode variations

### Phase 9: Memory Integration ✅

- [x] Mem0 service (`services/memory.ts`)
- [x] Docker compose (Qdrant + Neo4j)
- [x] Memory search before continuation
- [x] Memory storage after scenes

### Phase 10: Additional Features ✅

- [x] Fork endpoint with permission check
- [x] Discover endpoint for public stories
- [x] Protagonist snapshot on scene save
- [x] allowForking field
- [x] Deferred character evaluation

### Phase 11: Authentication (Better Auth) ✅

- [x] Install better-auth
- [x] Create auth config (`apps/api/src/lib/auth.ts`)
- [x] Generate auth schema (`packages/database/src/auth-schema.ts`)
- [x] Mount auth handler at `/api/auth/*`
- [x] Create auth middleware (`authMiddleware`, `requireAuth`)
- [x] Add `requireAuth` to all protected routes
- [x] Add owner checks to all story/vault routes
- [x] Update fork logic (visibility + allowForking check)

### Phase 12+: (Future)

- [ ] Social auth providers (GitHub, Google)
- [ ] Retry/timeout logic for LLM calls
- [ ] Rate limiting
- [ ] Caching
- [ ] Testing

---

## Current Status

**Completed**: 
- Phase 1 (foundation)
- Phase 2 (database schema)
- Phase 3 (API layer)
- Phase 4 (story routes) ✅
- Phase 5 (protagonist routes) ✅
- Phase 6 (vault routes) ✅
- Phase 7 (LLM integration) ✅
- Phase 8 (prompt system) ✅
- Phase 9 (memory integration) ✅
- Phase 10 (fork, discover, deferred chars) ✅
- Phase 11 (authentication) ✅

**⚠️ Critical Issues**:
- **Mem0 sqlite3 binding error** — `mem0ai/oss` eagerly imports `sqlite3` at module load time (`var import_sqlite3 = __toESM(require("sqlite3"))`), even when using Qdrant/Neo4j. This causes native binding compilation failures on macOS/Bun.

**Recommended Fix: Bypass Mem0, Use Direct Qdrant + Neo4j**

```typescript
// Direct implementation without Mem0
import { QdrantClient } from "@qdrant/js-client-rest";
import neo4j from "neo4j-driver";
import OpenAI from "openai";

const qdrant = new QdrantClient({ host: "localhost", port: 6333 });
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(user, pass));
const openai = new OpenAI();

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: text });
  return res.data[0].embedding;
}

async function storeMemory(content: string, storyId: string) {
  const vector = await embed(content);
  await qdrant.upsert("once_memories", {
    points: [{ id: crypto.randomUUID(), vector, payload: { content, storyId } }]
  });
}

async function searchMemory(query: string, storyId: string, limit = 5) {
  const vector = await embed(query);
  const results = await qdrant.search("once_memories", {
    vector,
    filter: { must: [{ key: "storyId", match: { value: storyId } }] },
    limit,
  });
  return results.map(r => r.payload?.content);
}
```

**Dependencies**: `bun add @qdrant/js-client-rest neo4j-driver` — No native bindings, pure JS.

**Remaining**:
- Social auth providers (GitHub, Google)
- Retry/timeout logic for LLM calls
- Testing

**Next**: 
- Add social auth providers OR start frontend integration

---

## File Structure

```
once/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── stories/
│       │   │   │   ├── index.ts       (mounts sub-routers)
│       │   │   │   ├── crud.ts        (list, get, create, delete, discover)
│       │   │   │   ├── scenes.ts      (scenes, codex, echoes)
│       │   │   │   ├── continue.ts    (continue, stream)
│       │   │   │   ├── fork.ts        (fork)
│       │   │   │   ├── deferred.ts    (deferred characters)
│       │   │   │   └── protagonists.ts (protagonist CRUD)
│       │   │   └── vault.ts
│       │   ├── lib/
│       │   │   ├── auth.ts           (Better Auth config)
│       │   │   ├── response.ts
│       │   │   └── stream.ts
│       │   ├── middleware/
│       │   │   └── auth.ts           (authMiddleware, requireAuth)
│       │   ├── services/
│       │   │   ├── llm.ts
│       │   │   ├── story.ts
│       │   │   ├── echo.ts
│       │   │   ├── codex.ts
│       │   │   ├── protagonist.ts
│       │   │   ├── deferred.ts
│       │   │   └── memory.ts
│       │   └── prompts/
│       │       ├── system.ts
│       │       ├── initialize.ts
│       │       ├── continue.ts
│       │       ├── codex.ts
│       │       ├── echo.ts
│       │       └── deferred.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── database/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── drizzle/
│   │   └── drizzle.config.ts
│   └── shared/
│       ├── src/
│       │   ├── index.ts
│       │   ├── errors.ts
│       │   ├── schemas/
│       │   │   ├── index.ts
│       │   │   ├── common.ts
│       │   │   ├── story.ts
│       │   │   ├── vault.ts
│       │   │   ├── llm.ts
│       │   │   ├── deferred.ts
│       │   │   └── protagonist.ts
│       │   └── types/
│       │       ├── index.ts
│       │       └── api.ts
│       └── package.json
├── docs/
│   ├── Design.md
│   ├── flow.md
│   └── progress.md
└── docker-compose.yml
```

---

## Notes

- Vault character limits: enforce at application layer (free: 5, premium: unlimited)
- Auth tables will be generated by Better Auth, not manually defined
- Traits are hybrid: suggestions provided, but custom allowed
- All validation schemas go in @once/shared for frontend/backend consistency
- Error codes centralized with status mapping for type safety
- Server tested and running on port 8080

---

*Last updated: 2024-12-29*

