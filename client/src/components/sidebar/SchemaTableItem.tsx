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
            <SidebarMenuButton className="text-sm">
              <ChevronRight className="size-3! transition-transform group-data-panel-open:rotate-90" />
              {tableName}
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent className="pb-2">
          <SidebarMenuSub>
            {columns.map((col) => (
              <SidebarMenuSubItem
                className="flex justify-between text-xs"
                key={col.name}
              >
                <span>{col.name}</span> <span>{col.type}</span>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
