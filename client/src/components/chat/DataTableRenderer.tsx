import {
  type ReactNode,
  type ReactElement,
  Children,
  isValidElement,
  useState,
  useMemo,
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
  ...props
}: React.ComponentPropsWithoutRef<"table">) {
  const [activeChart, setActiveChart] = useState<ChartType | null>(null);
  const { headers, rows } = useMemo(() => parseTableChildren(children), [children]);

  const hasChartableData = headers.length >= 2 && rows.length >= 1;

  return (
    <div className="my-3">
      {/* Original markdown table */}
      <div className="overflow-auto">
        <table {...props}>{children}</table>
      </div>

      {/* Toolbar */}
      {hasChartableData && (
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

      {/* Chart area */}
      {activeChart && hasChartableData && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3">
          <InlineChart
            headers={headers}
            rows={rows}
            chartType={activeChart}
          />
        </div>
      )}
    </div>
  );
}
