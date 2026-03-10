"use client";

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type SortingState,
    type ColumnDef,
    type VisibilityState,
} from "@tanstack/react-table";
import { useState, useMemo, useRef, useEffect } from "react";

interface DataTableProps {
    data: Record<string, unknown>[];
}

export default function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsColumnDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]).map((key) => ({
            accessorKey: key,
            header: key,
            cell: (info) => {
                const val = info.getValue();
                if (val === null || val === undefined) return "—";
                if (typeof val === "object") return JSON.stringify(val);
                return String(val);
            },
        }));
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const exportToCSV = () => {
        if (!data || data.length === 0) return;

        // Get visible column headers
        const visibleColumns = table.getVisibleLeafColumns();
        const headers = visibleColumns.map(col => typeof col.columnDef.header === "string" ? col.columnDef.header : col.id);

        // Convert rows to CSV strings
        const csvRows = data.map(row => {
            return visibleColumns.map(col => {
                let cellVal = row[col.id];
                if (cellVal === null || cellVal === undefined) cellVal = "";
                // Handle objects/arrays and escape quotes for CSV
                const cellStr = typeof cellVal === "object" ? JSON.stringify(cellVal) : String(cellVal);
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (/[,"\n]/.test(cellStr)) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(",");
        });

        // Combine headers and rows
        const csvContent = [headers.join(","), ...csvRows].join("\n");

        // Create Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `query_results_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!data || data.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-zinc-500">No data to display.</p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-end gap-2">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Columns
                    </button>
                    {isColumnDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-2 px-2 pb-1 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                Toggle Columns
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {table.getAllLeafColumns().map(column => {
                                    return (
                                        <label key={column.id} className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={column.getIsVisible()}
                                                onChange={column.getToggleVisibilityHandler()}
                                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-700 dark:bg-zinc-800"
                                            />
                                            <span className="truncate">{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Export CSV
                </button>
            </div>
            <div className="custom-scrollbar overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-sm">
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id} className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-semibold text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <span className="text-xs text-zinc-400">
                                                {{ asc: "▲", desc: "▼" }[
                                                    header.column.getIsSorted() as string
                                                ] ?? "⇅"}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row, i) => (
                            <tr
                                key={row.id}
                                className={`border-b border-zinc-100 transition-colors hover:bg-indigo-50/50 dark:border-zinc-800/50 dark:hover:bg-indigo-950/20 ${i % 2 === 0
                                    ? "bg-white dark:bg-zinc-950"
                                    : "bg-zinc-50/50 dark:bg-zinc-900/50"
                                    }`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="max-w-[300px] truncate whitespace-nowrap px-4 py-2.5 text-zinc-600 dark:text-zinc-400"
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
