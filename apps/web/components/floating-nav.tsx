'use client'

import { Dispatch, SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Origami, BookOpen, Compass, PlusCircle, Users, BarChart2, X, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/create', label: 'Create', icon: PlusCircle },
    { href: '/vault', label: 'Vault', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 }
]

export function FloatingNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="fixed top-3 md:top-8 md:right-12 right-6 z-50">
            <NavItem isOpen={isOpen} pathname={pathname} setIsOpen={setIsOpen} />
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative z-10 flex items-center justify-center",
                    "w-12 h-12 md:w-14 md:h-14 rounded-full",
                    "bg-surface border border-line",
                    "transition-colors hover:border-accent cursor-pointer"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, rotate: -45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Origami className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

        </div>
    )
}

function NavItem({ isOpen, setIsOpen, pathname }: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>, pathname: string }) {

    const getItemPosition = (index: number, total: number) => {
        // const startAngle = 90;
        // const spreadAngle = 90;
        // const angle = startAngle + (spreadAngle / (total - 1)) * index;

        // const radian = (angle * Math.PI) / 180;
        // const radius = 200;

        return {
            x: -index * 25,
            y: (index + 1) * 45
        }
    }

    return (
        <AnimatePresence>
            {isOpen && navItems.map((item, index) => {
                const position = getItemPosition(index, navItems.length);
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                        animate={{ opacity: 1, x: position.x, y: position.y, scale: 1 }}
                        exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                        transition={{ type: "tween", duration: 0.2, ease: 'easeOut', delay: index * 0.03 }}
                        className="absolute bottom-0 right-0"
                    >
                        <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-2",
                                "bg-surface border border-line",
                                "w-32",
                                "transition-colors hover:bg-accent hover:text-background",
                                isActive && "bg-accent text-background"
                            )}
                        >
                            <item.icon className="size-4" />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    </motion.div>
                )
            })}
        </AnimatePresence>
    )
}