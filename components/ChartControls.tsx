"use client";

type ChartType = "line" | "bar" | "area" | "scatter" | "donut";

interface ChartControlsProps {
    chartType: ChartType;
    setChartType: (t: ChartType) => void;
    xKey: string;
    setXKey: (k: string) => void;
    yKey: string;
    setYKey: (k: string) => void;
    allColumns: string[];
    numericColumns: string[];
}

const CHART_OPTIONS: { type: ChartType; label: string; icon: string }[] = [
    { type: "line", label: "Line", icon: "📈" },
    { type: "bar", label: "Bar", icon: "📊" },
    { type: "area", label: "Area", icon: "📉" },
    { type: "scatter", label: "Scatter", icon: "🔵" },
    { type: "donut", label: "Donut", icon: "🍩" },
];

export default function ChartControls({
    chartType,
    setChartType,
    xKey,
    setXKey,
    yKey,
    setYKey,
    allColumns,
    numericColumns,
}: ChartControlsProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            {/* Chart type buttons */}
            <div className="flex items-center gap-1">
                {CHART_OPTIONS.map((opt) => (
                    <button
                        key={opt.type}
                        onClick={() => setChartType(opt.type)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${chartType === opt.type
                                ? "bg-indigo-500 text-white shadow-sm"
                                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                            }`}
                    >
                        <span>{opt.icon}</span>
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

            {/* X Axis selector */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    X Axis
                </label>
                <select
                    value={xKey}
                    onChange={(e) => setXKey(e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                    {allColumns.map((col) => (
                        <option key={col} value={col}>
                            {col}
                        </option>
                    ))}
                </select>
            </div>

            {/* Y Axis selector */}
            {chartType !== "donut" && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Y Axis
                    </label>
                    <select
                        value={yKey}
                        onChange={(e) => setYKey(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                        {numericColumns.map((col) => (
                            <option key={col} value={col}>
                                {col}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
