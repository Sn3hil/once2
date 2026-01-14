import { cn } from '@/lib/utils'
import { type ActionType } from '@/types'
import { Database, MessageSquare } from 'lucide-react'

const actions: { id: ActionType; label: string; icon: React.ReactNode; description: string }[] = [
    {
        id: 'createStory',
        label: 'Create Story',
        icon: <Database size={18} />,
        description: 'Generate a new story with opening scene'
    },
    {
        id: 'continueStory',
        label: 'Continue Story',
        icon: <MessageSquare size={18} />,
        description: 'Continue an existing story with user action'
    },
]

interface ActionPickerProps {
    selected: ActionType | null
    onSelect: (action: ActionType) => void
    disabled?: boolean
}

export function ActionPicker({ selected, onSelect, disabled }: ActionPickerProps) {
    return (
        <div className="bg-surface rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">Actions</h2>
            <div className="space-y-2">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => onSelect(action.id)}
                        disabled={disabled}
                        className={cn(
                            "w-full p-3 rounded-lg text-left transition-colors",
                            "border border-border hover:border-accent/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            selected === action.id
                                ? "bg-accent/10 border-accent text-foreground"
                                : "bg-surface-2 text-muted hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {action.icon}
                            <span className="font-medium">{action.label}</span>
                        </div>
                        <p className="text-xs text-muted">{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}