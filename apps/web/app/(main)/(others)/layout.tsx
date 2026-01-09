"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { FloatingNav } from "@/components/floating-nav";
import { CampfireToggle } from "@/components/campfire-toggle";
import { UserMenu } from "@/components/user-menu";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth/login");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <>
            <main>{children}</main>
            <FloatingNav />
            <UserMenu />
            <CampfireToggle />
        </>
    );
}