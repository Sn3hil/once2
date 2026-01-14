import neo4j, { Driver, Session } from "neo4j-driver";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") })

function createDriver(): Driver {
    const uri = process.env.NEO4J_URI || process.env.NEO4J_URL || "bolt://localhost:7687";
    const username = process.env.NEO4J_USERNAME || "neo4j";
    const password = process.env.NEO4J_PASSWORD || "password";

    return neo4j.driver(uri, neo4j.auth.basic(username, password));
}

const driver = createDriver();

function getSession(): Session {
    return driver.session();
}

export interface GraphCharacter {
    name: string,
    description?: string | null;
    storyId: number;
    introducedAt: number
}

export interface GraphRelationship {
    from: string;
    to: string;
    type: string;
    since: number;
    reason?: string | null
}

export interface GraphEvent {
    id: string,
    description: string;
    storyId: number
    sceneId: number;
    who: string[];
    where?: string | null;
    causedBy?: string | null;
}

export interface GraphLocation {
    name: string,
    description?: string | null,
    storyId: number;
    firstVisitedAt: number
}

export interface GraphObject {
    name: string,
    description: string,
    storyId: number;
    significance?: string | null;
    ownedBy?: string | null
}

export async function storeCharacter(character: GraphCharacter) {
    const session = getSession();

    try {
        await driver.executeQuery(
            `
                MERGE (c:Character {name: $name, storyId: $storyId})
                SET c.description = $description, c.introducedAt = $introducedAt
            `,
            {
                name: character.name,
                storyId: character.storyId,
                description: character.description,
                introducedAt: character.introducedAt
            }
        )
    } finally {
        await session.close();
    }
}

export async function storeLocation(location: GraphLocation): Promise<void> {
    const session = getSession();
    try {
        await driver.executeQuery(
            `
                MERGE (l:Location {name: $name, storyId: $storyId})
                SET l.description = $description, l.firstVisitedAt = $firstVisitedAt
            `,
            {
                name: location.name,
                storyId: location.storyId,
                description: location.description || "",
                firstVisitedAt: location.firstVisitedAt,
            }
        );
    } finally {
        await session.close();
    }
}


export async function storeObject(obj: GraphObject): Promise<void> {
    const session = getSession();
    try {
        await driver.executeQuery(
            `
                MERGE (o:Object {name: $name, storyId: $storyId})
                SET o.description = $description, o.significance = $significance
            `,
            {
                name: obj.name,
                storyId: obj.storyId,
                description: obj.description || "",
                significance: obj.significance || "",
            }
        );

        // Link to owner if specified
        if (obj.ownedBy) {
            await driver.executeQuery(
                `
                    MATCH (o:Object {name: $objName, storyId: $storyId})
                    MATCH (c:Character {name: $ownerName, storyId: $storyId})
                    MERGE (c)-[:POSSESSES]->(o)
                `,
                {
                    objName: obj.name,
                    storyId: obj.storyId,
                    ownerName: obj.ownedBy,
                }
            );
        }
    } finally {
        await session.close();
    }
}


export async function storeRelationship(rel: GraphRelationship, storyId: number): Promise<void> {
    const session = getSession();
    try {
        await driver.executeQuery(
            `
                MATCH (a:Character {name: $from, storyId: $storyId})
                MATCH (b:Character {name: $to, storyId: $storyId})
                MERGE (a)-[r:${rel.type}]->(b)
                SET r.since = $since, r.reason = $reason, r.storyId = $storyId
            `,
            {
                from: rel.from,
                to: rel.to,
                storyId,
                since: rel.since,
                reason: rel.reason || "",
            }
        );
    } finally {
        await session.close();
    }
}

export async function storeEvent(event: GraphEvent): Promise<void> {
    const session = getSession();
    try {
        // Create event node
        await driver.executeQuery(
            `
                MERGE (e:Event {id: $id, storyId: $storyId})
                SET e.description = $description, e.sceneId = $sceneId, e.where = $where
            `,
            {
                id: event.id,
                storyId: event.storyId,
                description: event.description,
                sceneId: event.sceneId,
                where: event.where || "",
            }
        );
        // Link event to characters
        for (const characterName of event.who) {
            await driver.executeQuery(
                `
                    MATCH (e:Event {id: $eventId, storyId: $storyId})
                    MATCH (c:Character {name: $characterName, storyId: $storyId})
                    MERGE (e)-[:INVOLVES]->(c)
                `,
                {
                    eventId: event.id,
                    storyId: event.storyId,
                    characterName,
                }
            );
        }
        // Link cause if provided
        if (event.causedBy) {
            await driver.executeQuery(
                `
                    MATCH (e:Event {id: $eventId, storyId: $storyId})
                    MATCH (cause:Event {id: $causedBy, storyId: $storyId})
                    MERGE (cause)-[:CAUSED]->(e)
                `,
                {
                    eventId: event.id,
                    storyId: event.storyId,
                    causedBy: event.causedBy,
                }
            );
        }
    } finally {
        await session.close();
    }
}

export async function getCharacterRelationships(
    characterName: string,
    storyId: number
): Promise<Array<{ name: string; type: string; since: number; reason?: string }>> {
    const { records } = await driver.executeQuery(
        `
            MATCH (c:Character {name: $name, storyId: $storyId})-[r]->(other:Character)
            RETURN other.name AS name, type(r) AS type, r.since AS since, r.reason AS reason
        `,
        { name: characterName, storyId }
    );

    return records.map((record) => ({
        name: record.get("name"),
        type: record.get("type"),
        since: record.get("since")?.toNumber?.() ?? record.get("since"),
        reason: record.get("reason"),
    }));
}

// Get location history (events at a location)
export async function getLocationHistory(
    locationName: string,
    storyId: number,
    limit: number = 5
): Promise<Array<{ eventId: string; description: string; sceneId: number }>> {
    const { records } = await driver.executeQuery(
        `
            MATCH (e:Event {storyId: $storyId})
            WHERE e.where = $location
            RETURN e.id AS eventId, e.description AS description, e.sceneId AS sceneId
            ORDER BY e.sceneId DESC
            LIMIT $limit
        `,
        { storyId, location: locationName, limit: neo4j.int(limit) }
    );

    return records.map((record) => ({
        eventId: record.get("eventId"),
        description: record.get("description"),
        sceneId: record.get("sceneId")?.toNumber?.() ?? record.get("sceneId"),
    }));
}

export async function closeGraphConnection(): Promise<void> {
    await driver.close();
}
