"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-0",
          "h-[65vh] w-[70vw] opacity-25 blur-[100px]",
          "bg-[conic-gradient(from_105deg_at_0%_0%,transparent_0deg,#FF4D00_20deg,transparent_40deg)]"
        )}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="h-px w-16 bg-[#333]" />

        <p className="text-center text-xl tracking-wide-custom text-[#666]">
          The fuel is ready.
        </p>

        <h1 className="max-w-2xl text-center text-5xl font-bold italic md:text-7xl">
          Bring the spark.
        </h1>

        <Link
          href={"/library"}
          className={cn(
            "mt-8 cursor-pointer rounded-lg border border-[#333] px-12 py-6",
            "text-lg uppercase tracking-[0.2em] text-foreground",
            "transition-all duration-300 hover:border-[#666]"
          )}
        >
          Start Your Story
        </Link>
      </div>
    </main>
  );
}
