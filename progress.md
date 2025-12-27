# Once — Backend Progress

## Completed ✅

### Core Infrastructure
- [x] Monorepo setup (Turborepo)
- [x] API server (Hono + Bun)
- [x] Database package (Drizzle + Postgres)
- [x] Shared package (Zod schemas, error codes)
- [x] Docker compose (Qdrant + Neo4j)

### LLM Integration
- [x] LLM Service (OpenAI Responses API)
- [x] System prompt
- [x] Initialize prompt
- [x] Continue prompt
- [x] Echo evaluation prompt
- [x] Codex extraction prompt
- [x] Deferred character prompt
- [x] Response schemas (Zod)

### Services
- [x] `llm.ts` — Core LLM functions
- [x] `story.ts` — Story generation
- [x] `echo.ts` — Echo evaluation/resolution
- [x] `protagonist.ts` — State updates
- [x] `codex.ts` — Entity extraction
- [x] `memory.ts` — Mem0/Qdrant/Neo4j
- [x] `deferred.ts` — Deferred character evaluation

### Story Endpoints
- [x] `GET /api/stories` — List user's stories
- [x] `GET /api/stories/discover` — Public forkable stories
- [x] `GET /api/stories/:id` — Single story
- [x] `POST /api/stories` — Create + opening scene
- [x] `POST /api/stories/:id/continue` — Continue (batch)
- [x] `POST /api/stories/:id/continue/stream` — Continue (SSE)
- [x] `POST /api/stories/:id/fork` — Fork from scene
- [x] `DELETE /api/stories/:id` — Soft delete

---

## Remaining 🔲

### Missing Endpoints
- [ ] `GET /api/stories/:id/scenes` — List scenes
- [ ] `GET /api/stories/:id/codex` — List codex entries
- [ ] `GET /api/stories/:id/echoes` — List echoes
- [ ] `GET /api/stories/:id/deferred-characters` — List deferred chars
- [ ] `POST /api/stories/:id/deferred-characters` — Add deferred char
- [ ] `DELETE /api/stories/:id/deferred-characters/:id` — Remove

### Vault Endpoints
- [ ] `GET /api/vault` — List vault characters
- [ ] `POST /api/vault` — Create vault character
- [ ] `PUT /api/vault/:id` — Update vault character
- [ ] `DELETE /api/vault/:id` — Delete vault character

### Auth
- [ ] Better Auth integration
- [ ] Replace `testUserId` with real auth

### Reliability
- [ ] LLM retry logic
- [ ] Timeout handling
- [ ] Rate limiting

### Testing
- [ ] API route tests
- [ ] Service unit tests
