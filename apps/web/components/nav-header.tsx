"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, PlusCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/library", label: "Library", icon: BookOpen },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/create", label: "Create", icon: PlusCircle },
    { href: "/vault", label: "Vault", icon: Users },
];

export function NavHeader() {
    const pathname = usePathname();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 border-b bg-background">
            <Link href="/" className="text-xl text-foreground tracking-tight">
                Once
            </Link>

            <nav className="flex items-center gap-4 md:gap-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 text-sm transition-colors",
                                isActive ? "text-foreground" : "text-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="size-4" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </header>
    );
}