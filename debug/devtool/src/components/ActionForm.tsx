import { useState } from 'react'
import { type ActionType } from '@/types'
import { cn } from '@/lib/utils'
import { createStorySchema } from '@once/shared'
import { Play } from 'lucide-react'

interface ActionFormProps {
    action: ActionType
    onSubmit: (params: Record<string, unknown>) => void
    isLoading: boolean
}

export function ActionForm({ action, onSubmit, isLoading }: ActionFormProps) {
    return (
        <div className="bg-surface rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wide">
                Parameters
            </h2>

            {action === 'createStory' && (
                <CreateStoryForm onSubmit={onSubmit} isLoading={isLoading} />
            )}

            {action === 'continueStory' && (
                <ContinueStoryForm onSubmit={onSubmit} isLoading={isLoading} />
            )}
        </div>
    )
}

function CreateStoryForm({ onSubmit, isLoading }: { onSubmit: (p: Record<string, unknown>) => void, isLoading: boolean }) {
    const [title, setTitle] = useState('')
    const [genre, setGenre] = useState('')
    const [narrativeStance, setNarrativeStance] = useState<string>('heroic')
    const [storyMode, setStoryMode] = useState<string>('protagonist')
    const [storyIdea, setStoryIdea] = useState('')
    const [protName, setProtName] = useState('')
    const [protLocation, setProtLocation] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [protTraits, setProtTraits] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const params: Record<string, unknown> = {
            title,
            genre,
            narrativeStance,
            storyMode,
            storyIdea: storyIdea || undefined,
            // Mock user for debug
            user: {
                id: 'debug-user-001',
                createdAt: new Date(),
                updatedAt: new Date(),
                email: 'debug@once.dev',
                emailVerified: true,
                name: 'Debug User'
            }
        }

        if (storyMode === 'protagonist' && protName) {
            params.protagonist = {
                name: protName,
                location: protLocation || 'Unknown',
                traits: protTraits
                    ? protTraits.split(',').map(t => t.trim()).filter(Boolean)
                    : []
            }
        }

        const result = createStorySchema.safeParse(params)
        if (!result.success) {
            setError(result.error.issues[0]?.message || 'Validation failed')
            return
        }

        onSubmit(params)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Title *" value={title} onChange={setTitle} placeholder="My Story" />
            <Field label="Genre *" value={genre} onChange={setGenre} placeholder="Fantasy, Sci-Fi, etc." />

            <SelectField
                label="Narrative Stance"
                value={narrativeStance}
                onChange={setNarrativeStance}
                options={['heroic', 'grimdark', 'grounded', 'mythic', 'noir']}
            />

            <SelectField
                label="Story Mode"
                value={storyMode}
                onChange={setStoryMode}
                options={['protagonist', 'narrator']}
            />

            <Field
                label="Story Idea"
                value={storyIdea}
                onChange={setStoryIdea}
                placeholder="A brief plot idea..."
                multiline
            />

            {storyMode === 'protagonist' && (
                <>
                    <div className="border-t border-border pt-3 mt-3">
                        <span className="text-xs text-muted">Protagonist</span>
                    </div>
                    <Field label="Name" value={protName} onChange={setProtName} placeholder="Character name" />
                    <Field label="Location" value={protLocation} onChange={setProtLocation} placeholder="Starting location" />
                    <Field
                        label="Traits (comma-separated)"
                        value={protTraits}
                        onChange={setProtTraits}
                        placeholder="brave, curious, stubborn"
                    />
                </>
            )}

            {error && <p className="text-error text-xs">{error}</p>}

            <SubmitButton isLoading={isLoading} />
        </form>
    )
}

function ContinueStoryForm({ onSubmit, isLoading }: { onSubmit: (p: Record<string, unknown>) => void, isLoading: boolean }) {
    const [storyId, setStoryId] = useState('')
    const [userAction, setUserAction] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const id = parseInt(storyId)
        if (isNaN(id)) return

        onSubmit({ storyId: id, userAction })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Story ID *" value={storyId} onChange={setStoryId} placeholder="1" />
            <Field
                label="User Action *"
                value={userAction}
                onChange={setUserAction}
                placeholder="I open the door..."
                multiline
            />
            <SubmitButton isLoading={isLoading} />
        </form>
    )
}

function Field({ label, value, onChange, placeholder, multiline }: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
    multiline?: boolean
}) {
    const baseClass = cn(
        "w-full bg-surface-2 border border-border rounded px-3 py-2",
        "text-foreground placeholder:text-muted/50",
        "focus:outline-none focus:border-accent"
    )

    return (
        <label className="block">
            <span className="text-xs text-muted mb-1 block">{label}</span>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className={cn(baseClass, "resize-none")}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={baseClass}
                />
            )}
        </label>
    )
}

function SelectField({ label, value, onChange, options }: {
    label: string
    value: string
    onChange: (v: string) => void
    options: string[]
}) {
    return (
        <label className="block">
            <span className="text-xs text-muted mb-1 block">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "w-full bg-surface-2 border border-border rounded px-3 py-2",
                    "text-foreground focus:outline-none focus:border-accent"
                )}
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </label>
    )
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className={cn(
                "w-full mt-2 py-2 px-4 rounded font-medium",
                "bg-accent text-white hover:bg-accent/80",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
            )}
        >
            <Play size={16} />
            {isLoading ? 'Executing...' : 'Execute'}
        </button>
    )
}