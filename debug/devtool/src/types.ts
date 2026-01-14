export type ActionType = 'createStory' | 'continueStory';

export interface DebugEntry {
    type: 'db' | 'llm' | 'vector' | 'graph' | 'context';
    operation: string;
    data: unknown;
    timestamp: string;
}

export interface WSMessage {
    type: 'connected' | 'result' | 'error';
    action?: ActionType;
    message?: string;
    res?: unknown;
    resCont?: unknown;
    debug?: DebugEntry[]
}