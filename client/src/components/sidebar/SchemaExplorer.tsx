import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "../ui/sidebar"

type Schema = Record<
  string,
  {
    name: string
    type: string
    primaryKey: boolean
  }[]
>

export default function SchemaExplorer({ schema }: { schema: Schema }) {
  return (
    <Collapsible className="rounded-md">
      <SidebarGroup>
        <SidebarGroupLabel
          className="text-xs"
          render={
            <CollapsibleTrigger className="group">
              Schema
              <ChevronRight className="ml-auto transition-transform group-data-panel-open:rotate-90" />
            </CollapsibleTrigger>
          }
        />
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(schema).map(([tableName, columns]) => (
                <SidebarMenuItem key={tableName}>
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}
