"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Origami,
  User,
  Home,
  BookOpen,
  Compass,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadialMenu, RadialMenuItem } from "@/components/ui/radial-menu";

const navItems: RadialMenuItem[] = [
  {
    title: "Home",
    icon: (className: string) => (
      <Home className={cn("h-full w-full", className)} />
    ),
    href: "/",
  },
  {
    title: "Library",
    icon: (className: string) => (
      <BookOpen className={cn("h-full w-full", className)} />
    ),
    href: "/library",
  },
  {
    title: "Discover",
    icon: (className: string) => (
      <Compass className={cn("h-full w-full", className)} />
    ),
    href: "/discover",
  },
  {
    title: "Create",
    icon: (className: string) => (
      <PlusCircle className={cn("h-full w-full", className)} />
    ),
    href: "/create",
  },
  {
    title: "Profile",
    icon: (className: string) => (
      <User className={cn("h-full w-full", className)} />
    ),
    href: "/profile",
  },
];

export function UserMenu() {
  const pathname = usePathname();
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const toggleRadialMenu = () => {
    setIsRadialOpen(!isRadialOpen);
  };

  const closeRadialMenu = () => {
    setIsRadialOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50">
      {/* Origami button */}
      <button
        onClick={toggleRadialMenu}
        className={cn(
          "relative flex items-center justify-center w-12 h-12 rounded-full",
          "bg-surface border border-line hover:border-accent",
          "transition-colors cursor-pointer focus:outline-none z-10",
          isRadialOpen && "border-accent",
        )}
      >
        <Origami
          className={cn(
            "w-5 h-5",
            isRadialOpen ? "text-accent" : "text-accent",
          )}
        />
      </button>

      {/* Radial navigation menu */}
      <RadialMenu
        items={navItems}
        isOpen={isRadialOpen}
        onClose={closeRadialMenu}
        currentPath={pathname}
      />

      {/* User dropdown - positioned below the origami button when needed */}
      {/* TODO: Integrate user menu items into radial menu later */}
    </div>
  );
}
