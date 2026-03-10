"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    ScatterChart,
    Scatter,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { useMemo } from "react";

type ChartType = "line" | "bar" | "area" | "scatter" | "donut";

interface DataChartProps {
    data: Record<string, unknown>[];
    chartType: ChartType;
    xKey: string;
    yKey: string;
}

const COLORS = [
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
];

const GRID_STYLE = { strokeDasharray: "3 3", stroke: "rgba(128,128,128,0.15)" };

export default function DataChart({ data, chartType, xKey, yKey }: DataChartProps) {
    // Ensure numeric values for Y axis
    const processedData = useMemo(() => {
        return data.map((row) => ({
            ...row,
            [yKey]: Number(row[yKey]) || 0,
        }));
    }, [data, yKey]);

    // Aggregate data for donut chart
    const donutData = useMemo(() => {
        if (chartType !== "donut") return [];
        const map = new Map<string, number>();
        for (const row of data) {
            const label = String(row[xKey] ?? "Unknown");
            map.set(label, (map.get(label) || 0) + (Number(row[yKey]) || 0));
        }
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [data, chartType, xKey, yKey]);

    const commonProps = {
        data: processedData,
        margin: { top: 10, right: 30, left: 10, bottom: 10 },
    };

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: "rgba(24,24,27,0.95)",
            border: "1px solid rgba(63,63,70,0.5)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e4e4e7",
        },
    };

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                    <LineChart {...commonProps}>
                        <CartesianGrid {...GRID_STYLE} />
                        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={yKey}
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#6366f1" }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                ) : chartType === "bar" ? (
                    <BarChart {...commonProps}>
                        <CartesianGrid {...GRID_STYLE} />
                        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                        <Bar dataKey={yKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : chartType === "area" ? (
                    <AreaChart {...commonProps}>
                        <CartesianGrid {...GRID_STYLE} />
                        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey={yKey}
                            stroke="#6366f1"
                            strokeWidth={2}
                            fill="url(#areaGrad)"
                        />
                    </AreaChart>
                ) : chartType === "scatter" ? (
                    <ScatterChart margin={commonProps.margin}>
                        <CartesianGrid {...GRID_STYLE} />
                        <XAxis
                            dataKey={xKey}
                            type="number"
                            name={xKey}
                            tick={{ fontSize: 11, fill: "#a1a1aa" }}
                        />
                        <YAxis
                            dataKey={yKey}
                            type="number"
                            name={yKey}
                            tick={{ fontSize: 11, fill: "#a1a1aa" }}
                        />
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                        <Scatter name={`${xKey} vs ${yKey}`} data={processedData} fill="#6366f1">
                            {processedData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                ) : (
                    /* donut */
                    <PieChart>
                        <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: { name?: string; percent?: number }) =>
                                `${name ?? ""} (${((percent ?? 0) * 100).toFixed(0)}%)`
                            }
                            labelLine={{ stroke: "#a1a1aa" }}
                        >
                            {donutData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                        <Legend />
                    </PieChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
