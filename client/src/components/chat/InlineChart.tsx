import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type ChartType = "bar" | "line" | "pie";

interface InlineChartProps {
  headers: string[];
  rows: string[][];
  chartType: ChartType;
}

const COLORS = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#ef4444", // red
  "#14b8a6", // teal
];

/**
 * Detect which columns are numeric by scanning all rows.
 * A column is numeric if every non-empty cell can be parsed as a number.
 */
function detectNumericColumns(headers: string[], rows: string[][]): boolean[] {
  return headers.map((_, colIdx) =>
    rows.every((row) => {
      const val = row[colIdx]?.trim();
      if (!val || val === "-" || val === "N/A") return true; // allow empties
      return !isNaN(Number(val.replace(/[$,%]/g, "")));
    })
  );
}

export default function InlineChart({
  headers,
  rows,
  chartType,
}: InlineChartProps) {
  const { data, labelKey, valueKeys } = (() => {
    const isNumeric = detectNumericColumns(headers, rows);

    // First non-numeric column is the label axis
    let labelIdx = headers.findIndex((_, i) => !isNumeric[i]);
    if (labelIdx === -1) labelIdx = 0;

    // All numeric columns (excluding the label column) are value series
    const valIdxs = headers
      .map((_, i) => i)
      .filter((i) => i !== labelIdx && isNumeric[i]);

    // If no numeric columns found, just use columns 1+ as values
    const finalValIdxs = valIdxs.length
      ? valIdxs
      : headers.map((_, i) => i).filter((i) => i !== labelIdx);

    const parsed = rows.map((row) => {
      const entry: Record<string, string | number> = {
        [headers[labelIdx]]: row[labelIdx] ?? "",
      };
      finalValIdxs.forEach((i) => {
        const raw = row[i]?.replace(/[$,%]/g, "").trim() ?? "0";
        entry[headers[i]] = parseFloat(raw) || 0;
      });
      return entry;
    });

    return {
      data: parsed,
      labelKey: headers[labelIdx],
      valueKeys: finalValIdxs.map((i) => headers[i]),
    };
  })();

  if (!data.length || !valueKeys.length) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Not enough numeric data to chart.
      </p>
    );
  }

  const commonProps = {
    data,
    margin: { top: 8, right: 12, bottom: 4, left: 4 },
  };

  const tooltipStyle = {
    contentStyle: {
      background: "#1c1c1e",
      border: "1px solid #2c2c2e",
      borderRadius: "6px",
      fontSize: "12px",
      color: "#f5f5f5",
    },
  };

  if (chartType === "pie") {
    // Pie only uses the first value column
    const vKey = valueKeys[0];
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey={vKey}
            nameKey={labelKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
            fontSize={11}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ChartComponent {...commonProps}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#3f3f46"
          opacity={0.5}
        />
        <XAxis
          dataKey={labelKey}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={{ stroke: "#3f3f46" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={{ stroke: "#3f3f46" }}
          width={50}
        />
        <Tooltip {...tooltipStyle} />
        {valueKeys.length > 1 && (
          <Legend wrapperStyle={{ fontSize: "11px" }} iconSize={10} />
        )}
        {valueKeys.map((key, i) =>
          chartType === "line" ? (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
              activeDot={{ r: 5 }}
            />
          ) : (
            <Bar
              key={key}
              dataKey={key}
              fill={COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          )
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
