"use client";

import React, { useEffect, useState } from "react";
import { NavHeader } from "@/components/nav-header";
import { Pen, Plus, Users } from "lucide-react";
import { VaultCard } from "./vault-card";
import { CreateCharacterDialog } from "./create-character-dialog";
import { vaultApi } from "@/lib/api";
import type { VaultCharacter } from "@once/shared";

export function CharacterVault() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [characters, setCharacters] = useState<VaultCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      const response = await vaultApi.list();
      if (response.data) setCharacters(response.data);
      setIsLoading(false);
    };

    fetchCharacters();
  }, []);

  const handleCharacterCreated = () => {
    vaultApi.list().then((res) => res.data && setCharacters(res.data));
  };

  return (
    <>
      <div className="relative bg-background">
        <header className="dotted-border-b px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-foreground">Character Vault</h1>
            <p className="mt-1 text-sm text-muted">
              Saved characters you can use in any story
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted">Loading characters...</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="size-12 text-muted/50" />
            <p className="mt-4 text-muted">No characters yet</p>
            <p className="text-sm text-muted/70 mb-4">
              Create your first character to use across stories
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Create now
            </button>
          </div>
        ) : (
          <><div className="grid grid-cols-1 gap-4 p-4 md:p-8 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <VaultCard key={character.id} character={character} />
            ))}
          </div>
          <div>
           <button
            onClick={() => setShowCreateDialog(true)}
            className=" h-12 w-12 flex justify-center items-center fixed right-10 bottom-25 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer"
          >
            <Pen className="size-5" />
          </button>  
          </div>
          </>
        )}
      </div>

      <CreateCharacterDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleCharacterCreated}
      />
    </>
  );
}
