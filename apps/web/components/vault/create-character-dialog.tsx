"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createVaultCharacterSchema, suggestedTraits } from "@once/shared/schemas";
import { toast } from "sonner";
import { vaultApi } from "@/lib/api";

interface CreateCharacterDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

export function CreateCharacterDialog({ open, onClose, onCreated }: CreateCharacterDialogProps) {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [selectedTraits, setSelectedTraits] = React.useState<string[]>([]);
    const [backstory, setBackstory] = React.useState("");

    if (!open) return null;

    const toggleTrait = (trait: string) => {
        if (selectedTraits.includes(trait)) {
            setSelectedTraits(selectedTraits.filter((t) => t !== trait));
        } else if (selectedTraits.length < 5) {
            setSelectedTraits([...selectedTraits, trait]);
        }
    };

    const handleCreate = async () => {
        const payload = { name, description, traits: selectedTraits, backstory };

        const result = createVaultCharacterSchema.safeParse(payload);

        if (!result.success) {
            toast.error(result.error.errors[0].message);
            return;
        }

        const response = await vaultApi.create(result.data);

        if (response.error) {
            toast.error(response.error.message);
        } else {
            toast.success("Character created!");
            onCreated?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-background/80" onClick={onClose} />

            <div className="relative z-10 w-full max-w-lg border border-line bg-surface p-6 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted hover:text-foreground cursor-pointer"
                >
                    <X className="size-4" />
                </button>

                <h2 className="text-lg text-foreground">Create Character</h2>
                <p className="mt-1 text-sm text-muted">Save a character to use across multiple stories</p>

                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm text-muted">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Kira Voss..."
                            className="mt-1 w-full border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A disgraced knight seeking redemption..."
                            className="mt-1 w-full border-b border-line bg-transparent py-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted">Traits ({selectedTraits.length}/5)</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {suggestedTraits.map((trait) => (
                                <button
                                    key={trait}
                                    onClick={() => toggleTrait(trait)}
                                    className={cn(
                                        "px-2 py-1 text-xs border transition-colors cursor-pointer",
                                        selectedTraits.includes(trait)
                                            ? "border-accent bg-accent/10 text-accent"
                                            : "border-line text-muted hover:border-foreground/50"
                                    )}
                                >
                                    {trait}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-muted">Backstory (optional)</label>
                        <textarea
                            value={backstory}
                            onChange={(e) => setBackstory(e.target.value)}
                            placeholder="What shaped this character..."
                            className="mt-1 w-full h-24 border border-line bg-transparent p-2 text-foreground placeholder:text-muted/50 focus:border-foreground focus:outline-none resize-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={cn(
                        "mt-6 w-full border border-line py-2 text-foreground transition-colors",
                        "hover:border-foreground hover:bg-surface",
                        "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                >
                    Create Character
                </button>
            </div>
        </div>
    );
}