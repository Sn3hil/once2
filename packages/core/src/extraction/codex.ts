import { db, eq } from "@once/database";
import { codexEntries } from "@once/database/schema";
import { generateStructured } from "../llm/generate";
import { buildCodexExtractionPrompt } from "../llm/prompts/codex";
import { CodexExtractionResponse, codexExtractionSchema } from "@once/shared/schemas";
import { DebugCollector } from "@/debug";

export async function extractCodexEntries(storyId: number, narration: string, collector?: DebugCollector) {
    const existingEntries = await db.query.codexEntries.findMany({
        where: eq(codexEntries.storyId, storyId)
    })

    const prompt = buildCodexExtractionPrompt({
        narration,
        existingEntries: existingEntries.map(e => ({ name: e.name, entryType: e.entryType }))
    })

    // debug collector
    collector?.add('llm', 'codexExtractionPrompt', prompt);

    const extraction = await generateStructured(
        "You extract notable entities from story narration for an encyclopedia.",
        prompt,
        codexExtractionSchema,
        "codex_extraction"
    );

    // debug collector
    collector?.add('llm', 'generatedStructuredOutput', extraction);

    if (extraction.newEntries.length > 0) {
        await db.insert(codexEntries).values(
            extraction.newEntries.map(entry => ({
                storyId,
                entryType: entry.entryType,
                name: entry.name,
                summary: entry.summary
            }))
        )

        // debug collector
        collector?.add('db', 'insert:extractedCodexEntries', { storyId });
    }

    if (extraction.updates && extraction.updates.length > 0) {
        for (const update of extraction.updates) {
            const existing = existingEntries.find(e =>
                e.name.toLowerCase() === update.name.toLowerCase()
            );
            if (existing && !existing.userEdited) {
                await db.update(codexEntries)
                    .set({
                        summary: `${existing.summary}\n\n${update.newInfo}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(codexEntries.id, existing.id));

                // debug collector
                collector?.add('db', 'updateCodexEntries', { summary: `${existing.summary}\n\n${update.newInfo}` });
            }
        }
    }
}