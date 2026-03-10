export interface SmartSuggestResult {
    chartType: "line" | "bar" | "area" | "scatter" | "donut";
    xKey: string;
    yKey: string;
    allColumns: string[];
    numericColumns: string[];
    dateColumns: string[];
    stringColumns: string[];
}

const DATE_PATTERNS = [
    "date",
    "time",
    "created",
    "updated",
    "day",
    "month",
    "year",
    "timestamp",
];

function isDateColumn(key: string, value: unknown): boolean {
    const lowerKey = key.toLowerCase();
    if (DATE_PATTERNS.some((p) => lowerKey.includes(p))) return true;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return true;
    return false;
}

function isNumericColumn(value: unknown): boolean {
    if (typeof value === "number") return true;
    if (typeof value === "string" && value !== "" && !isNaN(Number(value))) return true;
    return false;
}

export function smartSuggest(
    data: Record<string, unknown>[]
): SmartSuggestResult | null {
    if (!data || data.length === 0) return null;

    const sample = data[0];
    const allColumns = Object.keys(sample);

    const dateColumns: string[] = [];
    const numericColumns: string[] = [];
    const stringColumns: string[] = [];

    for (const key of allColumns) {
        const value = sample[key];
        if (isDateColumn(key, value)) {
            dateColumns.push(key);
        } else if (isNumericColumn(value)) {
            numericColumns.push(key);
        } else {
            stringColumns.push(key);
        }
    }

    if (numericColumns.length === 0) return null;

    let chartType: SmartSuggestResult["chartType"] = "bar";
    let xKey = allColumns[0];
    let yKey = numericColumns[0];

    if (dateColumns.length > 0 && numericColumns.length > 0) {
        // Time-series → line chart
        chartType = "line";
        xKey = dateColumns[0];
        yKey = numericColumns[0];
    } else if (stringColumns.length > 0 && numericColumns.length > 0) {
        // Categorical → bar chart
        chartType = "bar";
        xKey = stringColumns[0];
        yKey = numericColumns[0];
    } else if (numericColumns.length >= 2) {
        // Correlational → scatter
        chartType = "scatter";
        xKey = numericColumns[0];
        yKey = numericColumns[1];
    }

    return {
        chartType,
        xKey,
        yKey,
        allColumns,
        numericColumns,
        dateColumns,
        stringColumns,
    };
}
