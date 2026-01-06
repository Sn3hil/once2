import { create } from "zustand";
import { persist } from "zustand/middleware";

const fontSizeAdjustments: Record<string, number> = {
    "font-crimson": 1,
    "font-cormorant": 1.05,
    "font-playfair": 0.95,
    "font-lora": 1,
    "font-garamond": 1.05,
    "font-spectral": 1,
    "font-literata": 0.95,
    "font-inter": 0.95,
    "font-dm-sans": 0.95,
    "font-outfit": 0.95,
    "font-sora": 0.95,
    "font-nunito": 0.95,
    "font-source-sans": 0.95,
    "font-jetbrains": 0.9,
    "font-ibm-mono": 0.9,
    "font-space-grotesk": 0.95,
    "font-caveat": 1.15,
    "font-indie-flower": 1.15,
    "font-patrick-hand": 1.1,
    "font-permanent-marker": 0.9,
    "font-press-start": 0.7,
    "font-vt323": 1.1,
    "font-silkscreen": 0.75,
    "font-orbitron": 0.9,
};

interface FontStore {
    font: string;
    setFont: (font: string) => void;
}

export const useFontStore = create<FontStore>()(
    persist(
        (set, get) => ({
            font: "font-indie-flower",
            setFont: (font) => set({ font })
        }),
        {
            name: 'once-font'
        }
    )
);