import { Hono } from "hono";
import { db, eq, desc, and } from "@once/database";
import { stories } from "@once/database/schema";
import { success, error, paginated } from "@/lib/response";
import { createStorySchema } from "@once/shared/schemas";
import { requireAuth, type AuthVariables } from "@/middleware/auth";
import { createStory } from "@once/core";

const crudRouter = new Hono<{ Variables: AuthVariables }>();

crudRouter.get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const userStories = await db.query.stories.findMany({
        where: eq(stories.userId, user.id),
        orderBy: desc(stories.updatedAt)
    })

    return success(c, userStories);
});

crudRouter.get("/discover", async (c) => {
    const page = Number(c.req.query("page") || "1");
    const limit = Number(c.req.query("limit") || "20");
    const offset = (page - 1) * limit;

    const publicStories = await db.query.stories.findMany({
        where: (stories, { and, eq }) => and(
            eq(stories.visibility, "public"),
            eq(stories.allowForking, true)
        ),
        orderBy: desc(stories.upvotes),
        limit,
        offset,
        with: {
            protagonist: true,
            user: true
        },
    });

    const total = await db.select({ count: stories.id })
        .from(stories)
        .where(and(
            eq(stories.visibility, "public"),
            eq(stories.allowForking, true)
        ));

    return paginated(c, publicStories, { page, pageSize: limit, total: total[0]?.count || 0 });
});

crudRouter.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID");
    }

    const story = await db.query.stories.findFirst({
        where: eq(stories.id, id),
        with: {
            protagonist: true,
            user: true
        }
    });

    if (!story) {
        return error(c, "NOT_FOUND", "Story not found");
    }

    const user = c.get("user");
    const isOwner = user && story.userId === user.id;
    const isPublic = story.visibility === "public";

    if (!isOwner && !isPublic) {
        return error(c, "FORBIDDEN", "This story is private");
    }

    return success(c, story);
})

crudRouter.post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const parsed = createStorySchema.safeParse(body);

    if (!parsed.success) {
        return error(c, "VALIDATION_ERROR", parsed.error.errors[0].message);
    }

    const { title, description, genre, narrativeStance, storyMode, storyIdea, protagonist } = parsed.data;
    const user = c.get("user")!;

    try {
        const { storyWithRelations } = await createStory({
            user,
            title,
            description,
            genre,
            narrativeStance,
            storyMode,
            storyIdea,
            protagonist
        });

        return success(c, storyWithRelations, 201);
    } catch (err) {
        console.error("LLM Error: ", err);
        return error(c, "LLM_ERROR", "Failed to create opening scene");
    }
});

crudRouter.delete("/:id", requireAuth, async (c) => {
    const id = Number(c.req.param("id"));

    if (isNaN(id)) {
        return error(c, "INVALID_ID", "Invalid story ID");
    }

    const story = await db.query.stories.findFirst({ where: eq(stories.id, id) });
    if (!story) return error(c, "NOT_FOUND", "Story not found");

    const user = c.get("user");
    if (!user || story.userId !== user.id) return error(c, "FORBIDDEN", "You can only delete your own stories");

    await db.delete(stories).where(eq(stories.id, id))

    return success(c, { message: "Story deleted" });
});

export default crudRouter;
