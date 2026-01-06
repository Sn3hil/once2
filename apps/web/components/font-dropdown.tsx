import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useFontStore } from "@/stores/font-store";

export default function FontDropdown() {
    const { font, setFont } = useFontStore();

    return (
        <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="w-40 border border-charcoal bg-transparent text-foreground focus:ring-0 focus:ring-offset-0">
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface border-line max-h-[300px]">
                <SelectItem value="font-crimson">Crimson Pro</SelectItem>
                <SelectItem value="font-cormorant">Cormorant</SelectItem>
                <SelectItem value="font-playfair">Playfair</SelectItem>
                <SelectItem value="font-lora">Lora</SelectItem>
                <SelectItem value="font-garamond">EB Garamond</SelectItem>
                <SelectItem value="font-spectral">Spectral</SelectItem>
                <SelectItem value="font-literata">Literata</SelectItem>
                <SelectItem value="font-inter">Inter</SelectItem>
                <SelectItem value="font-dm-sans">DM Sans</SelectItem>
                <SelectItem value="font-outfit">Outfit</SelectItem>
                <SelectItem value="font-sora">Sora</SelectItem>
                <SelectItem value="font-nunito">Nunito</SelectItem>
                <SelectItem value="font-source-sans">Source Sans</SelectItem>
                <SelectItem value="font-jetbrains">JetBrains Mono</SelectItem>
                <SelectItem value="font-ibm-mono">IBM Plex Mono</SelectItem>
                <SelectItem value="font-space-grotesk">Space Grotesk</SelectItem>
                <SelectItem value="font-caveat">Caveat</SelectItem>
                <SelectItem value="font-indie-flower">Indie Flower</SelectItem>
                <SelectItem value="font-patrick-hand">Patrick Hand</SelectItem>
                <SelectItem value="font-permanent-marker">Permanent Marker</SelectItem>
                <SelectItem value="font-press-start">Press Start 2P</SelectItem>
                <SelectItem value="font-vt323">VT323</SelectItem>
                <SelectItem value="font-silkscreen">Silkscreen</SelectItem>
                <SelectItem value="font-orbitron">Orbitron</SelectItem>
            </SelectContent>
        </Select>
    )
}