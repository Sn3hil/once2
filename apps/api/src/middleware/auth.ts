import { Context, Next } from "hono";
import { auth } from "@/lib/auth";
import { error } from "@/lib/response";
import { db, eq, stories } from "@once/database";

type AuthVariables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
}

type StoryVariables = {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    story: {
        id: number;
        userId: string;
        title: string;
        description: string | null;
        genre: string;
        narrativeStance: "grimdark" | "heroic" | "grounded" | "mythic" | "noir";
        storyMode: "protagonist" | "narrator";
        status: "active" | "completed" | "abandoned";
        turnCount: number;
        forkedFromStoryId: number | null;
        forkedAtSceneId: number | null;
        visibility: "private" | "public" | "unlisted";
        upvotes: number;
        allowForking: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
    };
}

export async function authMiddleware(c: Context<{ Variables: AuthVariables }>, next: Next) {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    })

    if (!session) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);

    return next();
}

export async function requireAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
    const user = c.get("user");
    if (!user) {
        return error(c, "UNAUTHORIZED");
    }

    return next();
}


export type { AuthVariables };