import { ChevronRight, Database } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "../ui/sidebar";
import SchemaTableItem from "./SchemaTableItem";
import { useAppSelector } from "@/store";

export default function SchemaItem() {
  const { activeSchema } = useAppSelector((state) => state.connection);

  if (!activeSchema) return null;

  return (
    <Collapsible className="rounded-md group-data-[collapsible=icon]:hidden">
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel
          className="text-sm text-sidebar-foreground hover:bg-accent"
          title="Database Schema"
          render={
            <CollapsibleTrigger className="group items-center gap-2">
              <Database className="size-4" />
              <span className="truncate text-sm font-medium">Schema</span>
              <ChevronRight className="ml-auto transition-transform group-data-panel-open:rotate-90" />
            </CollapsibleTrigger>
          }
        />
        <CollapsibleContent className="ml-4.5">
          <SidebarGroupContent className="border-l border-sidebar-border pl-2.5">
            <SidebarMenu>
              {Object.entries(activeSchema).map(([tableName, columns]) => (
                <SchemaTableItem
                  key={tableName}
                  tableName={tableName}
                  columns={columns}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
