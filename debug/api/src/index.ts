import { continueStory, createStory, DebugCollector } from "@once/core";
import { db, desc, eq, scenes, stories } from "@once/database";
import { Hono } from "hono";
import { upgradeWebSocket, websocket } from "hono/bun";
import { createStorySchema } from "../../../packages/shared/src/schemas/story";
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../.env') });

const app = new Hono();

app.get('/', (c) => c.json({ status: "debug" }));

app.get('/ws', upgradeWebSocket((c) => {
    return {
        onOpen(event, ws) {
            console.log("Debug client connected");
            ws.send(JSON.stringify({ type: "connected", message: "Debug ready" }));
        },

        async onMessage(event, ws) {
            try {
                const data = JSON.parse(event.data.toString());
                const { action, params } = data;

                switch (action) {
                    case "createStory":

                        const parsed = createStorySchema.safeParse(params);

                        if (!parsed.success) throw new Error("Invalid params");

                        const collector = new DebugCollector();
                        const res = await createStory(params, collector);
                        ws.send(JSON.stringify({
                            type: "result",
                            action,
                            res,
                            debug: collector.toJSON()
                        }))
                        break;

                    case "continueStory":

                        const { storyId, userAction } = params;

                        if (isNaN(storyId)) throw new Error("Invalid story id");
                        if (!userAction || typeof userAction !== "string") throw new Error("Action is required");

                        const story = await db.query.stories.findFirst({
                            where: eq(stories.id, storyId),
                            with: {
                                protagonist: true,
                                scenes: {
                                    orderBy: desc(scenes.turnNumber),
                                    limit: 5
                                },
                                echoes: true,
                                deferredCharacters: true
                            }
                        })

                        if (!story) throw new Error("Story not found");

                        const collectorCont = new DebugCollector();

                        const resCont = await continueStory({ story, userAction }, collectorCont);
                        ws.send(JSON.stringify({ type: "result", action, resCont, debug: collectorCont.toJSON() }))
                        break;

                    default:
                        throw new Error(`Unknown action: ${action}`);
                }

                // console.log(`action:${action},params:${params}`)
            } catch (err) {
                ws.send(JSON.stringify({ type: "error", message: (err as Error).message }))
            }
        },

        onClose() {
            console.log("Debug client disconnected");
        }
    }
}))

export default {
    port: 4000,
    fetch: app.fetch,
    websocket
}