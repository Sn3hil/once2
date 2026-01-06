"use client";

import React from "react";
import { MoreVertical, Trash2, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VaultCharacter } from "@once/shared";


export function VaultCard({ character }: { character: VaultCharacter }) {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <div className="border border-line bg-surface p-5 relative">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg text-foreground">{character.name}</h2>
                    {character.description && (
                        <p className="mt-1 text-sm text-muted">{character.description}</p>
                    )}
                </div>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-muted hover:text-foreground cursor-pointer"
                >
                    <MoreVertical className="size-4" />
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {character.traits.map((trait) => (
                    <span key={trait} className="text-xs border border-line px-2 py-0.5 text-muted">
                        {trait}
                    </span>
                ))}
            </div>

            <p className="mt-4 text-xs text-muted">
                Used in {character.timesUsed} {character.timesUsed === 1 ? "story" : "stories"}
            </p>

            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-4 top-12 border border-line bg-surface shadow-lg z-10">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-background w-full text-left cursor-pointer">
                            <Edit3 className="size-3" />
                            Edit
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-background w-full text-left cursor-pointer">
                            <Trash2 className="size-3" />
                            Delete
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}