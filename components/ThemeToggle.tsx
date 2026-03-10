"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [dark, setDark] = useState(true);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme");
        if (stored) {
            setDark(stored === "dark");
        } else {
            setDark(document.documentElement.classList.contains("dark"));
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark, mounted]);

    // Prevent rendering the toggle in the wrong state during SSR
    if (!mounted) {
        return <div className="h-8 w-16" />; // Placeholder of same size
    }

    return (
        <button
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="relative flex h-8 w-16 items-center rounded-full border border-zinc-300 bg-zinc-100 p-1 transition-colors duration-300 dark:border-zinc-700 dark:bg-zinc-800"
        >
            <svg
                className="absolute left-1.5 h-4 w-4 text-amber-500 transition-opacity duration-300"
                style={{ opacity: dark ? 0.3 : 1 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <circle cx={12} cy={12} r={5} />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <svg
                className="absolute right-1.5 h-4 w-4 text-indigo-400 transition-opacity duration-300"
                style={{ opacity: dark ? 1 : 0.3 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <span
                className="h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 dark:bg-zinc-200"
                style={{ transform: dark ? "translateX(32px)" : "translateX(0)" }}
            />
        </button>
    );
}
