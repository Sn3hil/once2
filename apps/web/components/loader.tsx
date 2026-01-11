// loader by opus , change it later , not looking good

"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ConstellationLoaderProps {
    message?: string;
    className?: string;
}

// Star positions forming an abstract "book" shape (percentage coordinates)
const STARS = [
    { x: 30, y: 35 },  // Left page top
    { x: 25, y: 55 },  // Left page middle
    { x: 35, y: 70 },  // Left page bottom
    { x: 50, y: 75 },  // Spine bottom
    { x: 50, y: 50 },  // Spine center
    { x: 50, y: 30 },  // Spine top
    { x: 65, y: 70 },  // Right page bottom
    { x: 75, y: 55 },  // Right page middle
    { x: 70, y: 35 },  // Right page top
];

// Lines connecting stars (indices into STARS array)
const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], // Left side
    [3, 6], [6, 7], [7, 8], [8, 5],         // Right side
    [0, 5], [5, 8],                          // Top connections
];

const STAR_DELAY = 0.15;
const LINE_DELAY = 0.1;

export function ConstellationLoader({
    message,
    className,
}: ConstellationLoaderProps) {
    const totalStarTime = STARS.length * STAR_DELAY;
    const drawTime = totalStarTime + CONNECTIONS.length * LINE_DELAY;
    const CYCLE_DURATION = 4;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95",
                className
            )}
        >
            {/* Circular container with dashed border */}
            <div className="relative w-64 h-64 rounded-full border border-dashed border-line flex items-center justify-center">
                <motion.svg
                    viewBox="0 0 100 100"
                    className="w-48 h-48"
                    initial="hidden"
                    animate="visible"
                >
                    {/* Lines */}
                    {CONNECTIONS.map(([fromIdx, toIdx], i) => {
                        const from = STARS[fromIdx];
                        const to = STARS[toIdx];
                        const lineDelay = totalStarTime + i * LINE_DELAY;

                        return (
                            <motion.line
                                key={`line-${i}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke="var(--accent)"
                                strokeWidth="0.5"
                                strokeOpacity="0.6"
                                initial={{ pathLength: 0 }}
                                animate={{
                                    pathLength: [0, 1, 1, 0],
                                    opacity: [0.6, 0.6, 0.6, 0],
                                }}
                                transition={{
                                    pathLength: {
                                        times: [0, 0.4, 0.7, 1],
                                        duration: CYCLE_DURATION,
                                        delay: lineDelay,
                                        repeat: Infinity,
                                        repeatDelay: drawTime,
                                    },
                                    opacity: {
                                        times: [0, 0.4, 0.7, 1],
                                        duration: CYCLE_DURATION,
                                        delay: lineDelay,
                                        repeat: Infinity,
                                        repeatDelay: drawTime,
                                    },
                                }}
                            />
                        );
                    })}

                    {/* Stars */}
                    {STARS.map((star, i) => (
                        <motion.g key={`star-${i}`}>
                            {/* Glow effect */}
                            <motion.circle
                                cx={star.x}
                                cy={star.y}
                                r="3"
                                fill="var(--accent)"
                                opacity="0.2"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.5, 1.2, 0],
                                    opacity: [0, 0.3, 0.2, 0],
                                }}
                                transition={{
                                    times: [0, 0.3, 0.7, 1],
                                    duration: CYCLE_DURATION,
                                    delay: i * STAR_DELAY,
                                    repeat: Infinity,
                                    repeatDelay: drawTime,
                                }}
                            />
                            {/* Star core */}
                            <motion.circle
                                cx={star.x}
                                cy={star.y}
                                r="1.5"
                                fill="var(--accent)"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.2, 1, 0],
                                    opacity: [0, 1, 1, 0],
                                }}
                                transition={{
                                    times: [0, 0.2, 0.7, 1],
                                    duration: CYCLE_DURATION,
                                    delay: i * STAR_DELAY,
                                    repeat: Infinity,
                                    repeatDelay: drawTime,
                                }}
                            />
                        </motion.g>
                    ))}
                </motion.svg>
            </div>

            {/* Loading message */}
            {message && (
                <motion.p
                    className="mt-6 text-muted text-sm tracking-wide"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
}