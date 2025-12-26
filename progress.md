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
- [x] POST /api/stories
- [x] GET /api/stories
- [x] GET /api/stories/:id
- [x] DELETE /api/stories/:id
- [x] GET /api/stories/:id/scenes
- [x] GET /api/stories/:id/codex
- [x] GET /api/stories/:id/echoes
- [ ] POST /api/stories/:id/continue
- [ ] POST /api/stories/:id/fork

### Phase 5: Protagonist Endpoints

- [ ] GET /api/stories/:id/protagonists
- [ ] POST /api/stories/:id/protagonists
- [ ] PATCH /api/stories/:id/protagonists/:pid
- [ ] POST /api/stories/:id/protagonists/:pid/activate

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
- [x] Define response schemas (`shared/schemas/llm.ts`)
- [x] Implement story initialization (POST /api/stories generates opening scene)
- [ ] Implement story continuation (POST /api/stories/:id/continue)
- [ ] Implement SSE streaming for responses
- [ ] Add retry logic
- [ ] Add timeout handling

### Phase 8: Prompt System

- [ ] Create prompt template system
- [ ] Create initialization prompt
- [ ] Create continuation prompt
- [ ] Create codex extraction prompt
- [ ] Create echo evaluation prompt
- [ ] Add narrative stance variations
- [ ] Add story mode variations

### Phase 9-21: (Unchanged)

See full list in previous version.

---

## Current Status

**Completed**: 
- Phase 1 (foundation)
- Phase 2 (database schema, migrations pushed)
- Phase 3 (API layer with Hono, middleware, error system)
- Phase 4 (stories CRUD + sub-resources)
- Phase 6 (vault routes - all done)

**In Progress**:
- Phase 7 (LLM integration - story loop)

**Next**: 
- Build LLM service layer
- Create prompt system
- Wire opening scene generation into POST /api/stories
- Build story continuation endpoint

---

## File Structure

```
once/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── index.ts          (main Hono app)
│       │   ├── routes/
│       │   │   ├── stories.ts    (story CRUD)
│       │   │   └── vault.ts      (in progress)
│       │   ├── lib/
│       │   │   └── response.ts   (response helpers)
│       │   ├── services/         (LLM, memory - TODO)
│       │   └── prompts/          (prompt templates - TODO)
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── database/
│   │   ├── src/
│   │   │   ├── index.ts          (db client, exports)
│   │   │   └── schema.ts         (all tables, relations)
│   │   ├── drizzle/              (migrations)
│   │   └── drizzle.config.ts
│   └── shared/
│       ├── src/
│       │   ├── index.ts          (re-exports)
│       │   ├── errors.ts         (error codes)
│       │   ├── schemas/
│       │   │   ├── index.ts      (story schemas)
│       │   │   ├── common.ts     (enums, traits)
│       │   │   └── vault.ts      (TODO)
│       │   └── types/
│       │       ├── index.ts
│       │       └── api.ts        (ApiResponse type)
│       └── package.json
└── flow.md                       (product vision)
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

*Last updated: 2024-12-26*
