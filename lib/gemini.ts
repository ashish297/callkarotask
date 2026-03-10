import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SCHEMA = process.env.CLICKHOUSE_SCHEMA || "No schema provided.";

const SYSTEM_PROMPT = `You are a SQL expert for ClickHouse databases.
Given the user's natural-language question and the database schema below, generate TWO valid ClickHouse SQL queries and chart visualization suggestions.

You MUST respond with a valid JSON object in this exact format (no markdown, no backticks around the JSON):
{
  "fullQuery": "SELECT * FROM ...",
  "focusedQuery": "SELECT col1, col2, col3 FROM ...",
  "focusedColumns": ["col1", "col2", "col3"],
  "suggestedChartType": "line",
  "suggestedXAxis": "col1",
  "suggestedYAxis": "col2"
}

QUERY RULES:
- fullQuery: Uses SELECT * to return all columns. This is for the "All Columns" view.
- focusedQuery: Selects ONLY the columns directly relevant to the user's question, plus createdAt or call_day for time context. This is for the "Relevant Columns" view.
- Both queries must have the same WHERE, ORDER BY, and LIMIT clauses.
- Use ClickHouse-compatible SQL syntax.
- If the question is ambiguous, make reasonable assumptions.
- Always add a LIMIT clause (default 100) unless the user specifies otherwise.
- When searching for model names (like "gpt 4.1 mini" or "gpt-4-turbo"), ALWAYS replace spaces with hyphens (e.g., '%gpt-4.1-mini%').
- For vendor names, DO NOT use hyphens for "eleven labs". Instead, use "elevenlabs" (e.g., '%elevenlabs%').

CHART SUGGESTION RULES:
- suggestedChartType: one of "line", "bar", "area", "scatter", "donut"
- If data has a time dimension, suggest "line" with the date column as X axis
- If data is categorical with numbers, suggest "bar" with the category as X axis
- suggestedXAxis and suggestedYAxis must be column names from focusedColumns
- Pick the most insightful Y axis based on the user's question

CLICKHOUSE FUNCTION NOTES:
- There is NO toEndOfMonth(). Use toLastDayOfMonth() instead.
- Use toStartOfMonth(), toStartOfWeek(), toStartOfDay() for period starts.
- Use today(), now(), yesterday() for current date/time.
- Use dateDiff('unit', start, end) for date differences.
- Use toDate() and toDateTime() for casting.

DATABASE SCHEMA:
${SCHEMA}
`;

const FIX_SYSTEM_PROMPT = `You are a SQL expert for ClickHouse databases.
You fix broken SQL queries. You MUST respond with ONLY the corrected raw SQL query, nothing else.
Do NOT wrap it in JSON or markdown. Just the plain SQL.

CLICKHOUSE FUNCTION NOTES:
- There is NO toEndOfMonth(). Use toLastDayOfMonth() instead.
- Use toStartOfMonth(), toStartOfWeek(), toStartOfDay() for period starts.
- Use today(), now(), yesterday() for current date/time.
- Use dateDiff('unit', start, end) for date differences.

DATABASE SCHEMA:
${SCHEMA}
`;

export interface GeminiQueryResult {
    fullQuery: string;
    focusedQuery: string;
    focusedColumns: string[];
    suggestedChartType: string;
    suggestedXAxis: string;
    suggestedYAxis: string;
}

export async function generateSQLQuery(
    userQuery: string
): Promise<GeminiQueryResult> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userQuery,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0,
        },
    });

    const raw = (response.text ?? "").trim();

    // Parse JSON response — strip markdown fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "");

    try {
        const parsed = JSON.parse(cleaned) as GeminiQueryResult;
        return parsed;
    } catch {
        // Fallback: treat entire response as a single SQL query
        return {
            fullQuery: cleaned,
            focusedQuery: cleaned,
            focusedColumns: [],
            suggestedChartType: "bar",
            suggestedXAxis: "",
            suggestedYAxis: "",
        };
    }
}

export async function fixSQLQuery(
    originalQuery: string,
    failedSQL: string,
    errorMessage: string
): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `The user asked: "${originalQuery}"

I generated this SQL: ${failedSQL}

But ClickHouse returned this error: ${errorMessage}

Please fix the SQL query. Output ONLY the corrected raw SQL, nothing else.`,
        config: {
            systemInstruction: FIX_SYSTEM_PROMPT,
            temperature: 0,
        },
    });

    const sql = (response.text ?? "").trim();
    return sql;
}
