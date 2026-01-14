"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export interface RadialMenuItem {
  title: string;
  icon: (className: string) => React.ReactNode;
  href: string;
}

interface RadialMenuProps {
  items: RadialMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export function RadialMenu({
  items,
  isOpen,
  onClose,
  currentPath,
}: RadialMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Arc configuration
  const radius = 150;
  const startAngle = 90; // degrees, directly down (Home)
  const endAngle = 180; // degrees, directly left (Analytics)
  const angleStep = (endAngle - startAngle) / (items.length - 1);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 10);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className="absolute top-6 left-6">
      <AnimatePresence>
        {isOpen &&
          items.map((item, index) => {
            const angle = startAngle + index * angleStep;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

            const isActive = currentPath === item.href;

            return (
              <RadialMenuItem
                key={item.title}
                item={item}
                index={index}
                x={x}
                y={y}
                isActive={isActive}
                totalItems={items.length}
                onClose={onClose}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}

interface RadialMenuItemComponentProps {
  item: RadialMenuItem;
  index: number;
  x: number;
  y: number;
  isActive: boolean;
  totalItems: number;
  onClose: () => void;
}

function RadialMenuItem({
  item,
  index,
  x,
  y,
  isActive,
  totalItems,
  onClose,
}: RadialMenuItemComponentProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={item.href}
      onClick={onClose}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: x,
        y: y,
      }}
      exit={{
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0,
        transition: {
          delay: (totalItems - 1 - index) * 0.03,
          duration: 0.2,
        },
      }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        zIndex: hovered ? 60 : 10,
      }}
      className={cn(
        "absolute flex items-center justify-center w-12 h-12 rounded-full",
        "bg-surface/80 backdrop-blur-md border border-line hover:border-accent",
        "transition-colors cursor-pointer",
        "top-0 left-0",
        "-translate-x-1/2 -translate-y-1/2",
      )}
    >
      <div className="w-5 h-5">
        {item.icon(
          isActive ? "text-accent" : "text-neutral-500 dark:text-neutral-300",
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute right-full mr-2 px-2 py-1 rounded-md text-xs whitespace-nowrap",
              "bg-surface border border-line z-50",
              isActive && "text-accent",
            )}
          >
            {item.title}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
