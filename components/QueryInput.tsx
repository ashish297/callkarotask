"use client";

interface QueryInputProps {
    query: string;
    setQuery: (q: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
}

export default function QueryInput({
    query,
    setQuery,
    onSubmit,
    loading,
}: QueryInputProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow focus-within:shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/30 dark:border-zinc-800 dark:bg-zinc-900">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit(e);
                        }
                    }}
                    placeholder="e.g. Show me the top 10 most expensive calls this week"
                    rows={3}
                    className="w-full resize-none rounded-2xl bg-transparent px-5 pt-5 pb-14 text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span className="hidden text-xs text-zinc-400 sm:inline">
                        Press{" "}
                        <kbd className="rounded border border-zinc-300 px-1.5 py-0.5 font-mono text-[10px] dark:border-zinc-700">
                            Enter
                        </kbd>{" "}
                        to send
                    </span>
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="h-3.5 w-3.5 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx={12}
                                        cy={12}
                                        r={10}
                                        stroke="currentColor"
                                        strokeWidth={4}
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Running…
                            </>
                        ) : (
                            <>
                                <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Run Query
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
