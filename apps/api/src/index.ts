import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import storiesRouter from "./routes/stories";
import { error } from "./lib/response";
import vaultRouter from "./routes/vault";
import { auth } from "./lib/auth";
import { authMiddleware, requireAuth } from "./middleware/auth";

const app = new Hono();


app.use("*", logger()); // logs every incoming req (helps in debugging)
app.use("*", prettyJSON()); // makes api response easier to read when testing in browser or curl
app.use("*",
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);
app.use("*", authMiddleware);


app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/stories", storiesRouter);
app.route("/api/vault", vaultRouter);


app.onError((err, c) => {
    console.error(`Error: ${err.message}`);
    return error(c, "INTERNAL_ERROR", err.message)
});

app.notFound((c) => {
    return error(c, "NOT_FOUND", "Not found");
});

const PORT = process.env.PORT || 3001;

console.log(`Server starting on port ${PORT}`);

export default {
    port: PORT,
    fetch: app.fetch,
};