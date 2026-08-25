import {
  type ReactNode,
  type ReactElement,
  Children,
  isValidElement,
  useState,
} from "react";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Download } from "lucide-react";
import InlineChart, { type ChartType } from "./InlineChart";
import { exportToCsv } from "@/lib/exportUtils";
import { cn } from "@/lib/utils";

/**
 * Recursively extracts text content from React children.
 */
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (!children) return "";
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (isValidElement(children)) {
    return extractText((children as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return "";
}

/**
 * Parses react-markdown table children (thead + tbody) into structured data.
 */
function parseTableChildren(children: ReactNode): {
  headers: string[];
  rows: string[][];
} {
  const headers: string[] = [];
  const rows: string[][] = [];

  Children.forEach(children, (section) => {
    if (!isValidElement(section)) return;
    const tag = section.type as string;
    const sectionChildren = (section as ReactElement<{ children?: ReactNode }>).props.children;

    if (tag === "thead") {
      // thead > tr > th[]
      Children.forEach(sectionChildren, (tr) => {
        if (!isValidElement(tr)) return;
        Children.forEach(
          (tr as ReactElement<{ children?: ReactNode }>).props.children,
          (th) => {
            headers.push(extractText(isValidElement(th) ? (th as ReactElement<{ children?: ReactNode }>).props.children : th));
          }
        );
      });
    }

    if (tag === "tbody") {
      // tbody > tr[] > td[]
      Children.forEach(sectionChildren, (tr) => {
        if (!isValidElement(tr)) return;
        const row: string[] = [];
        Children.forEach(
          (tr as ReactElement<{ children?: ReactNode }>).props.children,
          (td) => {
            row.push(extractText(isValidElement(td) ? (td as ReactElement<{ children?: ReactNode }>).props.children : td));
          }
        );
        rows.push(row);
      });
    }
  });

  return { headers, rows };
}

const chartOptions: { type: ChartType; icon: typeof BarChart3; label: string }[] = [
  { type: "bar", icon: BarChart3, label: "Bar" },
  { type: "line", icon: LineChartIcon, label: "Line" },
  { type: "pie", icon: PieChartIcon, label: "Pie" },
];

/**
 * Custom table renderer for react-markdown.
 * Intercepts markdown tables, parses them into structured data,
 * and adds chart visualization + CSV export controls.
 */
export default function DataTableRenderer({
  children,
  primaryKeys,
  ...props
}: React.ComponentPropsWithoutRef<"table"> & { primaryKeys?: Set<string> }) {
  const [activeChart, setActiveChart] = useState<ChartType | null>(null);
  const { headers, rows } = parseTableChildren(children);

  // Column visibility state: PK columns start excluded, rest included
  const [excludedCols, setExcludedCols] = useState<Set<number>>(() => {
    const excluded = new Set<number>();
    if (primaryKeys) {
      headers.forEach((h, i) => {
        if (primaryKeys.has(h.trim().toLowerCase())) excluded.add(i);
      });
    }
    return excluded;
  });

  const hasToolbar = headers.length >= 2 && rows.length >= 1;

  const toggleColumn = (idx: number) => {
    setExcludedCols((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Filter headers/rows to only included columns for the chart
  const filteredHeaders = headers.filter((_, i) => !excludedCols.has(i));
  const filteredRows = rows.map((row) => row.filter((_, i) => !excludedCols.has(i)));

  return (
    <div className="my-3">
      {/* Original markdown table */}
      <div className="overflow-auto">
        <table {...props}>{children}</table>
      </div>

      {/* Toolbar */}
      {hasToolbar && (
        <div className="mt-2 flex items-center gap-1">
          {chartOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setActiveChart(activeChart === type ? null : type)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                activeChart === type
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={`${label} chart`}
            >
              <Icon className="size-3" />
              {label}
            </button>
          ))}

          <button
            onClick={() => exportToCsv(headers, rows)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Export as CSV"
          >
            <Download className="size-3" />
            CSV
          </button>
        </div>
      )}

      {/* Chart area with column toggles */}
      {activeChart && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          {/* Column toggle chips */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Columns
            </span>
            {headers.map((header, idx) => (
              <button
                key={idx}
                onClick={() => toggleColumn(idx)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  excludedCols.has(idx)
                    ? "border-border bg-transparent text-muted-foreground/50 line-through"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {header}
              </button>
            ))}
          </div>

          {filteredHeaders.length >= 2 ? (
            <InlineChart
              headers={filteredHeaders}
              rows={filteredRows}
              chartType={activeChart}
            />
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Select at least 2 columns to render a chart.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
