import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react'

interface ResponsePanelProps {
    response: unknown
}

export function ResponsePanel({ response }: ResponsePanelProps) {
    const [expanded, setExpanded] = useState(true)
    const [copied, setCopied] = useState(false)

    if (!response) {
        return (
            <div className="bg-surface rounded-lg border border-border p-4">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Response</h2>
                <p className="text-muted text-sm mt-4">No response yet</p>
            </div>
        )
    }

    const copyResponse = () => {
        navigator.clipboard.writeText(JSON.stringify(response, null, 2))
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <div className="bg-surface rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2"
                >
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Response</h2>
                </button>
                <button
                    onClick={copyResponse}
                    className={cn(
                        "text-xs flex items-center gap-1 px-2 py-1 rounded",
                        "text-muted hover:text-foreground hover:bg-surface-2"
                    )}
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy JSON'}
                </button>
            </div>

            {expanded && (
                <pre className="text-xs text-foreground bg-background p-3 rounded max-h-[300px] overflow-y-auto whitespace-pre-wrap wrap-break-word">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    )
}