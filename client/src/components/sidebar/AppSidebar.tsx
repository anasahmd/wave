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
import ChatList from "./ChatList";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu />
      </SidebarHeader>
      <SidebarContent>
        <SchemaTable />
        <ChatList />
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
