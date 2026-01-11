'use client';

import { FloatingDock } from "@/components/ui/floating-dock";
import { cn } from "@/lib/utils";
import { BookOpen, Compass, PlusCircle, Users, BarChart2, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingNav() {

    const path = usePathname();

    const links = [
        {
            title: "Home",
            icon: (className: string) => (
                <Home className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/",
        },
        {
            title: "Library",
            icon: (className: string) => (
                <BookOpen className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/library",
        },
        {
            title: "Discover",
            icon: (className: string) => (
                <Compass className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/discover",
        },
        {
            title: "Create",
            icon: (className: string) => (
                <PlusCircle className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/create",
        },
        {
            title: "Vault",
            icon: (className: string) => (
                <Users className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/vault",
        },
        {
            title: "Analytics",
            icon: (className: string) => (
                <BarChart2 className={cn("h-full w-full text-neutral-500 dark:text-neutral-300", className)} />
            ),
            href: "/analytics",
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <FloatingDock
                path={path}
                items={links}
            />
        </div>
    );
}