import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function MobileDrawer({
    open,
    onClose,
    side,
    children,
    className
}: {
    open: boolean;
    onClose: () => void;
    side: "left" | "right";
    children: React.ReactNode;
    className?: string
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-background/60 lg:hidden"
                        onClick={onClose}
                    />
                    <motion.aside
                        initial={{ x: side === "left" ? "-100%" : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: side === "left" ? "-100%" : "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed top-0 z-50 h-full w-64 bg-surface lg:hidden",
                            className,
                            side === "left" ? "left-0 border-r border-line" : "right-0 border-l border-line"
                        )}
                    >
                        {children}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}