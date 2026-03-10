"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import QueryInput from "@/components/QueryInput";
import LoadingDots from "@/components/LoadingDots";
import ResultView from "@/components/ResultView";

export interface QueryResultSet {
  sql: string;
  data: Record<string, unknown>[];
  error?: string;
}

export interface AISuggestions {
  chartType: string;
  xAxis: string;
  yAxis: string;
  focusedColumns: string[];
}

export interface QueryResponse {
  full: QueryResultSet;
  focused: QueryResultSet;
  suggestions: AISuggestions;
  error?: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [topLevelError, setTopLevelError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setTopLevelError(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const json = await res.json();

      if (!res.ok && !json.full && !json.focused) {
        setTopLevelError(json.error || "Something went wrong");
      } else {
        setResult(json as QueryResponse);
      }
    } catch {
      setTopLevelError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* ─── Top Bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-3 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md">
            CK
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            CallKaro<span className="text-indigo-500">Query</span>
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* ─── Main Content ────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        {/* Hero Text */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Ask your data anything
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Type a natural-language question — Gemini will generate
            a ClickHouse query and fetch the results.
          </p>
        </div>

        {/* ─── Query Input ─────────────────────────────── */}
        <QueryInput
          query={query}
          setQuery={setQuery}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {/* ─── Output ──────────────────────────────────── */}
        {loading && <LoadingDots />}

        {topLevelError && !loading && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx={12} cy={12} r={10} />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {topLevelError}
            </p>
          </div>
        )}

        {result && !loading && (
          <ResultView
            full={result.full}
            focused={result.focused}
            suggestions={result.suggestions}
          />
        )}

        {/* Empty State */}
        {!loading && !result && !topLevelError && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 opacity-40">
            <svg
              className="h-16 w-16 text-zinc-300 dark:text-zinc-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
            </svg>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Your results will appear here
            </p>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        Powered by Gemini 2.5 Flash &amp; ClickHouse
      </footer>
    </div>
  );
}
