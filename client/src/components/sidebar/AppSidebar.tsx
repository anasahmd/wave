import DatabaseSwitcherMenu from "@/components/sidebar/DatabaseSwitcherMenu";
import AppSidebarFooter from "@/components/sidebar/AppSidebarFooter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import SchemaTable from "./SchemaTable";
import ThreadList from "./ThreadList";
import NewChat from "./NewChat";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu />
      </SidebarHeader>
      <SidebarContent>
        <SchemaTable />
        <NewChat />
        <ThreadList />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
