import { db, eq } from "@once/database";
import { protagonists } from "@once/database/schema";

interface ProtagonistUpdates {
    health?: number | null;
    energy?: number | null;
    location?: string | null;
    addTraits?: string[] | null;
    removeTraits?: string[] | null;
    addInventory?: string[] | null;
    removeInventory?: string[] | null;
    addScars?: string[] | null;
}

interface CurrentProtagonist {
    id: number;
    health: number;
    energy: number;
    currentLocation: string;
    currentTraits: string[];
    inventory: string[];
    scars: string[];
}

export async function updateProtagonistState(
    protagonist: CurrentProtagonist,
    updates: ProtagonistUpdates
): Promise<CurrentProtagonist> {
    let newTraits = protagonist.currentTraits || [];
    if (updates.addTraits) newTraits = [...newTraits, ...updates.addTraits];
    if (updates.removeTraits) newTraits = newTraits.filter(t => !updates.removeTraits!.includes(t));

    let newInventory = protagonist.inventory || [];
    if (updates.addInventory) newInventory = [...newInventory, ...updates.addInventory];
    if (updates.removeInventory) newInventory = newInventory.filter(i => !updates.removeInventory!.includes(i));

    let newScars = protagonist.scars || [];
    if (updates.addScars) newScars = [...newScars, ...updates.addScars];

    const updatedState = {
        id: protagonist.id,
        health: updates.health ?? protagonist.health,
        energy: updates.energy ?? protagonist.energy,
        currentLocation: updates.location ?? protagonist.currentLocation,
        currentTraits: newTraits,
        inventory: newInventory,
        scars: newScars,
    };

    await db.update(protagonists)
        .set({
            health: updates.health ?? protagonist.health,
            energy: updates.energy ?? protagonist.energy,
            currentLocation: updates.location ?? protagonist.currentLocation,
            currentTraits: newTraits,
            inventory: newInventory,
            scars: newScars,
            updatedAt: new Date(),
        })
        .where(eq(protagonists.id, protagonist.id));

    return updatedState;
}