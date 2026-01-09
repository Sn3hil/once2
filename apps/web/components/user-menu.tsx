"use client";

import { Origami, User, LogOut } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/auth/login";
    };

    return (
        <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-line hover:border-accent transition-colors cursor-pointer focus:outline-none">
                        <Origami className="w-5 h-5 text-accent" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-accent">
                    {session?.user && (
                        <>
                            <div className="px-2 py-1.5 text-sm">
                                <p className="font-medium text-foreground">Author</p>
                                <p className="text-xs text-muted truncate">{session.user.name}</p>
                            </div>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}