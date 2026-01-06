"use client";

import { cn } from "@/lib/utils";
import { useFontStore } from "@/stores/font-store";

export function FontProvider({ children }: { children: React.ReactNode }) {
    const font = useFontStore((state) => state.font);

    return <div className={cn(font)}>{children}</div>;
}