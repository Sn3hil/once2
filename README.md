# Once

> This project is currently in active development and may contain bugs or incomplete features.

Once is an AI-powered interactive storytelling platform where you become the protagonist of your own narrative. The system uses LLMs to generate immersive, branching stories that respond to your choices in real-time.

The application features a memory system that tracks characters, locations, relationships, and events across your story, ensuring narrative consistency and meaningful callbacks to earlier moments.


## Prerequisites

Before starting, ensure you have:
1. Node.js 18+ installed
2. Bun package manager installed
3. Docker and Docker Compose installed
4. OpenAI API key
5. PostgreSQL database (local or cloud)


## Local Development Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd once
bun install
```

### 2. Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp .example.env .env
```

Required environment variables:
```
DATABASE_URL=postgres://user:password@localhost:5432/once
OPENAI_API_KEY=your-openai-key
BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
MEMORY_MODE=local
```

### 3. Start Infrastructure

Start the vector database (Qdrant) and graph database (Neo4j) using Docker:

```bash
docker-compose up -d
```

### 4. Database Setup

Push the database schema:

```bash
cd packages/database
bun run db:push
```

### 5. Start Development Servers

From the root directory:

```bash
bun run dev
```

This starts both the API server (port 3001) and the web application (port 3000).


## Project Structure

```
once/
  apps/
    api/          Backend API (Hono + Bun)
    web/          Frontend (Next.js)
  packages/
    database/     Database schema and client (Drizzle)
    shared/       Shared types and schemas
```


## Available Commands

```bash
bun run dev       # Start all apps in development mode
bun run build     # Build all apps for production
bun run lint      # Lint all packages
bun run format    # Format code with Prettier
```
