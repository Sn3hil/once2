export type DebugEntryType = 'db' | 'llm' | 'vector' | 'graph' | 'context';

export interface DebugEntry {
    type: DebugEntryType;
    operation: string;
    data: unknown;
    timestamp: Date;
}

export class DebugCollector {
    private entries: DebugEntry[] = [];

    add(type: DebugEntryType, operation: string, data: unknown): void {
        this.entries.push({
            type,
            operation,
            data,
            timestamp: new Date()
        })
    }

    getEntries(): DebugEntry[] {
        return this.entries;
    }

    toJSON(): DebugEntry[] {
        return this.entries;
    }

    clear(): void {
        this.entries = [];
    }
}