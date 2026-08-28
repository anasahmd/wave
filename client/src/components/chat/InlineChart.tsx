import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

export type ChartType = "bar" | "line" | "pie";

interface InlineChartProps {
  headers: string[];
  rows: string[][];
  chartType: ChartType;
}

function detectNumericColumns(headers: string[], rows: string[][]): boolean[] {
  return headers.map((_, colIdx) =>
    rows.every((row) => {
      const val = row[colIdx]?.trim();
      if (!val || val === "-" || val === "N/A") return true;
      return !isNaN(Number(val.replace(/[$,%]/g, "")));
    })
  );
}

export default function InlineChart({
  headers,
  rows,
  chartType,
}: InlineChartProps) {
  const { data, config, lines, pieDataKey, pieNameKey } = (() => {
    const isNumeric = detectNumericColumns(headers, rows);
    let labelIdx = headers.findIndex((_, i) => !isNumeric[i]);
    if (labelIdx === -1) labelIdx = 0;

    const valIdxs = headers
      .map((_, i) => i)
      .filter((i) => i !== labelIdx && isNumeric[i]);
    const finalValIdxs = valIdxs.length
      ? valIdxs
      : headers.map((_, i) => i).filter((i) => i !== labelIdx);

    if (chartType === "pie") {
      // For Pie: Config is based on rows (slices)
      const vKey = finalValIdxs[0];
      const pieConfig: ChartConfig = {};
      const pieData = rows.map((row, idx) => {
        const raw = row[vKey]?.replace(/[$,%]/g, "").trim() ?? "0";
        const val = parseFloat(raw) || 0;

        // Ensure valid css identifier for the key
        const sliceKey = `slice_${idx}`;
        const colorIndex = (idx % 5) + 1;

        pieConfig[sliceKey] = {
          label: row[labelIdx] ?? `Item ${idx}`,
          color: `var(--chart-${colorIndex})`,
        };

        return {
          nameKey: sliceKey,
          value: val,
          fill: `var(--color-${sliceKey})`,
        };
      });

      return {
        data: pieData,
        config: pieConfig,
        lines: [],
        pieDataKey: "value",
        pieNameKey: "nameKey",
      };
    } else {
      // For Line/Bar: Config is based on columns (series)
      const lineConfig: ChartConfig = {};
      const linesData = finalValIdxs.map((colIdx, idx) => {
        const seriesKey = `series_${idx}`;
        const colorIndex = (idx % 5) + 1;
        lineConfig[seriesKey] = {
          label: headers[colIdx] || `Series ${idx}`,
          color: `var(--chart-${colorIndex})`,
        };
        return { key: seriesKey, originalIdx: colIdx };
      });

      const chartData = rows.map((row) => {
        const entry: Record<string, string | number> = {
          label: row[labelIdx] ?? "",
        };
        linesData.forEach(({ key, originalIdx }) => {
          const raw = row[originalIdx]?.replace(/[$,%]/g, "").trim() ?? "0";
          entry[key] = parseFloat(raw) || 0;
        });
        return entry;
      });

      return {
        data: chartData,
        config: lineConfig,
        lines: linesData,
        pieDataKey: "",
        pieNameKey: "",
      };
    }
  })();

  if (!data.length) {
    return (
      <p className="py-4 text-center text-xs text-muted-foreground">
        Not enough data to chart.
      </p>
    );
  }

  if (chartType === "pie") {
    return (
      <ChartContainer config={config} className="min-h-[350px] w-full pb-4">
        <PieChart>
          <Pie
            data={data}
            dataKey={pieDataKey}
            nameKey={pieNameKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={2}
            labelLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend
            content={<ChartLegendContent />}
            className="-translate-y-2 flex-wrap gap-2"
          />
        </PieChart>
      </ChartContainer>
    );
  }

  const ChartComponent = chartType === "line" ? LineChart : BarChart;

  return (
    <ChartContainer config={config} className="min-h-[350px] w-full pb-4">
      <ChartComponent
        data={data}
        margin={{ top: 8, right: 12, bottom: 20, left: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={50} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {lines.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {lines.map(({ key }) =>
          chartType === "line" ? (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={{ r: 3, fill: `var(--color-${key})` }}
              activeDot={{ r: 5 }}
            />
          ) : (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={[4, 4, 0, 0]}
            />
          )
        )}
      </ChartComponent>
    </ChartContainer>
  );
}
