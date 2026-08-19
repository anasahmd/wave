import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "../ui/sidebar";
import type { Column } from "@/types";

export default function SchemaTableItem({
  tableName,
  columns,
}: {
  tableName: string;
  columns: Column[];
}) {
  return (
    <SidebarMenuItem>
      <Collapsible className="rounded-md data-open:bg-muted">
        <CollapsibleTrigger
          className="group"
          render={
            <SidebarMenuButton className="text-sm" title={tableName}>
              <ChevronRight className="size-3! shrink-0 transition-transform group-data-panel-open:rotate-90" />
              <span className="truncate">{tableName}</span>
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent className="pb-2">
          <SidebarMenuSub>
            {columns.map((col) => (
              <SidebarMenuSubItem
                className="flex items-center justify-between gap-2 text-xs py-0.5"
                key={col.name}
                title={`${col.name}: ${col.type}`}
              >
                <span className="truncate min-w-0">{col.name}</span>
                <span className="truncate text-muted-foreground font-mono text-[11px] shrink-0 max-w-[50%] text-right">
                  {col.type}
                </span>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
