"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

interface SketchyBarProps {
    value: number;
    max: number;
    width?: number;
    height?: number;
}

// Deterministic pseudo-random for consistent server/client
const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
};

export function SketchyBar({ value, max, width = 100, height = 16 }: SketchyBarProps) {
    const fillWidth = (value / max) * width;

    const hatchLines = useMemo(() => {
        const lines = [];
        const lineSpacing = 3;
        const numLines = Math.ceil(fillWidth / lineSpacing);

        for (let i = 0; i < numLines; i++) {
            const x = i * lineSpacing;
            // Deterministic wobble based on index
            const wobble1 = (seededRandom(i) * 1.5 - 0.75);
            const wobble2 = (seededRandom(i + 100) * 1.5 - 0.75);

            lines.push({ x, wobble1, wobble2, key: i });
        }
        return lines;
    }, [fillWidth]);

    return (
        <div className="flex items-center gap-2">
            <svg
                width={width}
                height={height}
                className="text-foreground overflow-visible"
            >
                <rect
                    x={0.5}
                    y={0.5}
                    width={width - 1}
                    height={height - 1}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    className="opacity-40"
                />

                <defs>
                    <clipPath id={`clip-${value}-${max}`}>
                        <rect x={0} y={0} width={fillWidth} height={height} />
                    </clipPath>
                </defs>

                <g clipPath={`url(#clip-${value}-${max})`}>
                    {hatchLines.map(({ x, wobble1, wobble2, key }) => (
                        <motion.line
                            key={key}
                            x1={x + wobble1}
                            y1={1}
                            x2={x + 2 + wobble2}
                            y2={height - 1}
                            stroke="currentColor"
                            strokeWidth={1.2}
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.7 }}
                            transition={{ duration: 0.15, delay: key * 0.02 }}
                        />
                    ))}
                </g>
            </svg>
            <span className="font-mono text-xs text-muted">{value}/{max}</span>
        </div>
    );
}