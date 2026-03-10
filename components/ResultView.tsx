"use client";

import { useState, useMemo, useEffect } from "react";
import { smartSuggest } from "@/lib/smartSuggest";
import DataTable from "./DataTable";
import DataChart from "./DataChart";
import ChartControls from "./ChartControls";
import type { QueryResultSet, AISuggestions } from "@/app/page";

type ViewTab = "table" | "chart";
type DataMode = "relevant" | "all";
type ChartType = "line" | "bar" | "area" | "scatter" | "donut";

interface ResultViewProps {
    full: QueryResultSet;
    focused: QueryResultSet;
    suggestions: AISuggestions;
}

export default function ResultView({
    full,
    focused,
    suggestions,
}: ResultViewProps) {
    const [activeTab, setActiveTab] = useState<ViewTab>("table");
    const [dataMode, setDataMode] = useState<DataMode>("relevant");

    // Current data based on mode
    const currentResult = dataMode === "relevant" ? focused : full;
    const rows = Array.isArray(currentResult.data)
        ? (currentResult.data as Record<string, unknown>[])
        : [];
    const currentSql = currentResult.sql;

    // Smart suggest from data structure
    const localSuggestion = useMemo(() => {
        if (rows.length === 0) return null;
        return smartSuggest(rows);
    }, [rows]);

    // Chart state — initialized from AI suggestions
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [xKey, setXKey] = useState("");
    const [yKey, setYKey] = useState("");

    // Apply AI suggestions on first load, fall back to local smart suggest
    useEffect(() => {
        const validChartTypes = ["line", "bar", "area", "scatter", "donut"];
        const aiType = suggestions.chartType;

        if (validChartTypes.includes(aiType)) {
            setChartType(aiType as ChartType);
        } else if (localSuggestion) {
            setChartType(localSuggestion.chartType);
        }

        // For axes, prefer AI suggestions if columns exist in current data
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        const aiX = suggestions.xAxis;
        const aiY = suggestions.yAxis;

        if (aiX && columns.includes(aiX)) {
            setXKey(aiX);
        } else if (localSuggestion) {
            setXKey(localSuggestion.xKey);
        }

        if (aiY && columns.includes(aiY)) {
            setYKey(aiY);
        } else if (localSuggestion) {
            setYKey(localSuggestion.yKey);
        }
    }, [suggestions, localSuggestion, rows]);

    // Get column lists for chart controls
    const allColumns = useMemo(() => {
        if (rows.length === 0) return [];
        return Object.keys(rows[0]);
    }, [rows]);

    const numericColumns = useMemo(() => {
        if (rows.length === 0) return [];
        const sample = rows[0];
        return Object.keys(sample).filter((k) => {
            const v = sample[k];
            return typeof v === "number" || (typeof v === "string" && v !== "" && !isNaN(Number(v)));
        });
    }, [rows]);

    // Error for current mode
    if (currentResult.error && rows.length === 0) {
        return (
            <div className="space-y-4">
                <DataModeToggle
                    dataMode={dataMode}
                    setDataMode={setDataMode}
                />
                <div className="rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx={12} cy={12} r={10} />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                        Error
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {currentResult.error}
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-red-100 p-3 text-xs text-red-800 dark:bg-red-950/50 dark:text-red-300">
                        <code>{currentSql}</code>
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Data Mode Toggle */}
            <DataModeToggle dataMode={dataMode} setDataMode={setDataMode} />

            {/* SQL Card */}
            {currentSql && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-800/50 dark:bg-indigo-950/20">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Generated SQL
                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                {dataMode === "relevant"
                                    ? "Relevant Columns"
                                    : "All Columns"}
                            </span>
                        </h3>
                    </div>
                    <pre className="custom-scrollbar overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-emerald-400 shadow-inner">
                        <code>{currentSql}</code>
                    </pre>
                </div>
            )}

            {/* Data Results */}
            {rows.length > 0 && (
                <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Tab Bar + Row Count */}
                    <div className="flex items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("table")}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "table"
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                                </svg>
                                Table
                            </button>
                            <button
                                onClick={() => setActiveTab("chart")}
                                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "chart"
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                        : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M4 20h16M4 20V4m4 16V10m4 10V8m4 12V6" />
                                </svg>
                                Chart
                            </button>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {rows.length} rows
                        </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        {activeTab === "table" ? (
                            <DataTable data={rows} />
                        ) : (
                            <div className="space-y-4">
                                {allColumns.length > 0 && numericColumns.length > 0 && (
                                    <ChartControls
                                        chartType={chartType}
                                        setChartType={setChartType}
                                        xKey={xKey}
                                        setXKey={setXKey}
                                        yKey={yKey}
                                        setYKey={setYKey}
                                        allColumns={allColumns}
                                        numericColumns={numericColumns}
                                    />
                                )}
                                {xKey && yKey && (
                                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                        <DataChart
                                            data={rows}
                                            chartType={chartType}
                                            xKey={xKey}
                                            yKey={yKey}
                                        />
                                    </div>
                                )}
                                {numericColumns.length === 0 && (
                                    <p className="py-8 text-center text-sm text-zinc-500">
                                        No numeric columns detected for
                                        charting.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Data Mode Toggle ─────────────────────────────────────────────────
function DataModeToggle({
    dataMode,
    setDataMode,
}: {
    dataMode: DataMode;
    setDataMode: (m: DataMode) => void;
}) {
    return (
        <div className="flex items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <button
                onClick={() => setDataMode("relevant")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${dataMode === "relevant"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Relevant Columns
            </button>
            <button
                onClick={() => setDataMode("all")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all ${dataMode === "all"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                All Columns
            </button>
        </div>
    );
}
