import { storeSceneVector, searchSimilarScenes } from "./vector";
import { type ExtractedEntities } from "../llm/prompts/extract";
import {
    storeCharacter,
    storeEvent,
    storeLocation,
    storeObject,
    storeRelationship,
    getCharacterRelationships,
    getLocationHistory,
    type GraphCharacter,
    type GraphEvent,
    type GraphLocation,
    type GraphObject,
    type GraphRelationship
} from "./graph";
import { db, eq, desc } from "@once/database";
import { scenes } from "@once/database";

// export interface ExtractedEntities {
//     characters: Array<{
//         name: string;
//         description?: string | null;
//         isNew?: boolean | null;
//     }>;
//     locations: Array<{
//         name: string;
//         description?: string | null;
//     }>;
//     objects: Array<{
//         name: string;
//         description?: string | null;
//         significance?: string | null;
//         ownedBy?: string | null
//     }>;
//     relationships: Array<{
//         from: string;
//         to: string;
//         type: string;
//         reason?: string | null
//     }>;
//     events: Array<{
//         description: string;
//         who: string[];
//         where?: string | null;
//         causedBy?: string | null;
//     }>;
// }

export async function storySceneMemory(
    sceneId: string,
    narration: string,
    storyId: number,
    turnNumber: number,
    entities: ExtractedEntities
) {
    try {
        await storeSceneVector(sceneId, narration, storyId);

        for (const character of entities.characters) {
            await storeCharacter({
                name: character.name,
                description: character.description,
                storyId,
                introducedAt: turnNumber
            })
        }

        for (const location of entities.locations) {
            await storeLocation({
                name: location.name,
                description: location.description,
                storyId,
                firstVisitedAt: turnNumber
            })
        }

        for (const object of entities.objects) {
            await storeObject({
                name: object.name,
                description: object.description || "",
                storyId,
                significance: object.significance,
                ownedBy: object.ownedBy,
            });
        }

        for (const relation of entities.relationships) {
            await storeRelationship(
                {
                    from: relation.from,
                    to: relation.to,
                    type: relation.type.toUpperCase().replace(/\s+/g, "_"),
                    since: turnNumber,
                    reason: relation.reason,
                },
                storyId
            );
        }

        for (const event of entities.events) {
            await storeEvent({
                id: `${sceneId}-${event.description.slice(0, 20)}`,
                description: event.description,
                storyId,
                sceneId: turnNumber,
                who: event.who,
                where: event.where,
                causedBy: event.causedBy,
            });
        }
    } catch (error) {
        console.error("Error storing scene memory:", error);
    }
}

interface buildContextResponse {
    similarScenes: Array<{
        narration: string,
        score: number
    }>;
    characterRelationships: Array<{
        name: string,
        type: string,
        reason?: string
    }>;
    locationHistory: Array<{
        description: string;
        sceneId: number;
    }>
}

export async function buildContext(storyId: number, userAction: string, protagonistName: string, currentLocation?: string): Promise<buildContextResponse> {
    try {
        const similarScenes = await searchSimilarScenes(userAction, storyId, 5);
        const characterRelationships = await getCharacterRelationships(protagonistName, storyId);

        // what if particular scene is not about the protagonists , like building up an event which will eventually affect the story ,
        // like how GOT stories are , bunch of things happening at various places , which eventually meets at the end or at some part of the story

        let locationHistory: Array<{ description: string; sceneId: number; }> = [];
        if (currentLocation) {
            const history = await getLocationHistory(currentLocation, storyId, 5);
            locationHistory = history.map((h) => ({
                description: h.description,
                sceneId: h.sceneId
            }));
        }

        return {
            similarScenes: similarScenes.map((s) => ({
                narration: s.narration,
                score: s.score
            })),
            characterRelationships,
            locationHistory
        }
    } catch (err) {
        console.error("Error building context:", err)
        return {
            similarScenes: [],
            characterRelationships: [],
            locationHistory: []
        }
    }
}

export async function getScenes(sceneIds: number[], storyId: number): Promise<Array<{ turnNumber: number; narration: string }>> {
    try {
        const results = await db
            .select({
                turnNumber: scenes.turnNumber,
                narration: scenes.narration
            })
            .from(scenes)
            .where(eq(scenes.storyId, storyId))
            .orderBy(desc(scenes.turnNumber))

        return results.filter((s) => sceneIds.includes(s.turnNumber)).map((s) => ({
            turnNumber: s.turnNumber,
            narration: s.narration
        }))
    } catch (error) {
        console.error("Error getting scenes from db:", error);
        return []
    }
}