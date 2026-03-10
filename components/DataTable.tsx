"use client";

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    type SortingState,
    type ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

interface DataTableProps {
    data: Record<string, unknown>[];
}

export default function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

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
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (!data || data.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-zinc-500">No data to display.</p>
        );
    }

    return (
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
    );
}
