# Once API

Backend service for the Once storytelling platform.

## Tech Stack

Built with Hono framework running on Bun runtime. Uses Drizzle ORM for PostgreSQL database operations.

## Structure

```
src/
  routes/       API endpoints organized by feature
  services/     Business logic and external integrations
  prompts/      LLM prompt templates
  middleware/   Authentication and request handling
  lib/          Utility functions and helpers
```

## Key Services

The API handles story generation, memory management, and user authentication. Memory is split between Qdrant (vector search) and Neo4j (knowledge graph) for tracking narrative elements across stories.

## Running

```bash
bun run dev
```

Server starts on port 3001.
