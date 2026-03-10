"use client";

export default function LoadingDots() {
    return (
        <div className="flex items-center justify-center gap-3 py-16">
            <div className="flex items-center gap-1.5">
                <span className="dot-1 inline-block h-3 w-3 rounded-full bg-indigo-500" />
                <span className="dot-2 inline-block h-3 w-3 rounded-full bg-indigo-500" />
                <span className="dot-3 inline-block h-3 w-3 rounded-full bg-indigo-500" />
            </div>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Generating query &amp; fetching data…
            </span>
        </div>
    );
}
