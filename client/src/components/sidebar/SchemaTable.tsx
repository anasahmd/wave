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
import { useConnection } from "@/providers/ConnectionProvider";
import SchemaTableItem from "./SchemaTableItem";

export default function SchemaTable() {
  const { activeSchema } = useConnection();

  if (!activeSchema) return null;

  return (
    <Collapsible className="rounded-md">
      <SidebarGroup>
        <SidebarGroupLabel
          className="text-xs"
          render={
            <CollapsibleTrigger className="group items-center gap-2">
              <Database />
              <span>Schema</span>
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
