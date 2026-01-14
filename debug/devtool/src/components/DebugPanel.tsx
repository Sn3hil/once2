import { useState } from 'react'
import { type DebugEntry } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

interface DebugPanelProps {
    entries: DebugEntry[]
}

const tagColors: Record<string, string> = {
    db: 'tag-db',
    llm: 'tag-llm',
    vector: 'tag-vector',
    graph: 'tag-graph',
    context: 'tag-context',
}

export function DebugPanel({ entries }: DebugPanelProps) {
    if (entries.length === 0) {
        return (
            <div className="bg-surface rounded-lg border border-border p-4">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Debug Log</h2>
                <p className="text-muted text-sm mt-4">Execute an action to see debug entries</p>
            </div>
        )
    }

    return (
        <div className="bg-surface rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
                Debug Log ({entries.length} entries)
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {entries.map((entry, idx) => (
                    <DebugEntryItem key={idx} entry={entry} />
                ))}
            </div>
        </div>
    )
}

function DebugEntryItem({ entry }: { entry: DebugEntry }) {
    const [expanded, setExpanded] = useState(false)
    const [copied, setCopied] = useState(false)

    const copyData = () => {
        navigator.clipboard.writeText(JSON.stringify(entry.data, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className="bg-surface-2 rounded border border-border">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-3 py-2 flex items-center gap-2 text-left"
            >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium text-white", tagColors[entry.type])}>
                    {entry.type.toUpperCase()}
                </span>
                <span className="text-sm text-foreground flex-1">{entry.operation}</span>
                <span className="text-xs text-muted">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
            </button>

            {expanded && (
                <div className="px-3 pb-3 border-t border-border">
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={copyData}
                            className="text-xs text-muted hover:text-foreground flex items-center gap-1"
                        >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre className="mt-2 text-xs text-muted bg-background p-2 rounded whitespace-pre-wrap wrap-break-word">
                        {JSON.stringify(entry.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}