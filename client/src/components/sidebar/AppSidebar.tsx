import DatabaseSwitcherMenu from "@/components/sidebar/DatabaseSwitcherMenu";
import AppSidebarFooter from "@/components/sidebar/AppSidebarFooter";
import SchemaExplorer from "./SchemaExplorer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu />
      </SidebarHeader>
      <SidebarContent>
        <SchemaExplorer />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
