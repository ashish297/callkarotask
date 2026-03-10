import { NextRequest, NextResponse } from "next/server";
import { generateSQLQuery, fixSQLQuery } from "@/lib/gemini";
import { executeQuery } from "@/lib/clickhouse";

const MAX_RETRIES = 2;

async function executeWithRetry(
    userQuery: string,
    sql: string
): Promise<{ data: unknown; finalSql: string; retries: number }> {
    let currentSql = sql;
    let data: unknown;
    let lastError: string | null = null;
    let retries = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            data = await executeQuery(currentSql);
            lastError = null;
            break;
        } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
            console.error(
                `ClickHouse error (attempt ${attempt + 1}):`,
                lastError
            );

            if (attempt < MAX_RETRIES) {
                try {
                    currentSql = await fixSQLQuery(
                        userQuery,
                        currentSql,
                        lastError
                    );
                    retries++;
                } catch (fixErr) {
                    console.error("Gemini fix error:", fixErr);
                    break;
                }
            }
        }
    }

    if (lastError) {
        throw new Error(lastError);
    }

    return { data, finalSql: currentSql, retries };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== "string") {
            return NextResponse.json(
                { error: "Missing or invalid 'query' field in request body." },
                { status: 400 }
            );
        }

        // Step 1: Generate both queries + suggestions from Gemini
        let geminiResult;
        try {
            geminiResult = await generateSQLQuery(query);
        } catch (err) {
            console.error("Gemini error:", err);
            return NextResponse.json(
                {
                    error: "Failed to generate SQL query from Gemini.",
                    details:
                        err instanceof Error ? err.message : String(err),
                },
                { status: 502 }
            );
        }

        // Step 2: Execute both queries in parallel
        let fullResult, focusedResult;
        const errors: string[] = [];

        try {
            [fullResult, focusedResult] = await Promise.allSettled([
                executeWithRetry(query, geminiResult.fullQuery),
                executeWithRetry(query, geminiResult.focusedQuery),
            ]);
        } catch (err) {
            console.error("Execution error:", err);
            return NextResponse.json(
                {
                    error: "Failed to execute queries.",
                    details:
                        err instanceof Error ? err.message : String(err),
                },
                { status: 500 }
            );
        }

        // Build response
        const response: Record<string, unknown> = {
            suggestions: {
                chartType: geminiResult.suggestedChartType,
                xAxis: geminiResult.suggestedXAxis,
                yAxis: geminiResult.suggestedYAxis,
                focusedColumns: geminiResult.focusedColumns,
            },
        };

        if (fullResult.status === "fulfilled") {
            response.full = {
                sql: fullResult.value.finalSql,
                data: fullResult.value.data,
                ...(fullResult.value.retries > 0
                    ? { retries: fullResult.value.retries }
                    : {}),
            };
        } else {
            errors.push(`Full query: ${fullResult.reason}`);
            response.full = {
                sql: geminiResult.fullQuery,
                data: [],
                error: fullResult.reason?.message || String(fullResult.reason),
            };
        }

        if (focusedResult.status === "fulfilled") {
            response.focused = {
                sql: focusedResult.value.finalSql,
                data: focusedResult.value.data,
                ...(focusedResult.value.retries > 0
                    ? { retries: focusedResult.value.retries }
                    : {}),
            };
        } else {
            errors.push(`Focused query: ${focusedResult.reason}`);
            response.focused = {
                sql: geminiResult.focusedQuery,
                data: [],
                error:
                    focusedResult.reason?.message ||
                    String(focusedResult.reason),
            };
        }

        // If both failed, return 500
        if (
            fullResult.status === "rejected" &&
            focusedResult.status === "rejected"
        ) {
            return NextResponse.json(
                {
                    error: "Both queries failed.",
                    details: errors.join("; "),
                    ...response,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(response);
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json(
            {
                error: "An unexpected error occurred.",
                details: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}
