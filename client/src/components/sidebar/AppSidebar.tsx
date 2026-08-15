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
import { useAppSelector } from "@/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { switchingId } = useAppSelector((state) => state.connection);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu />
      </SidebarHeader>
      {switchingId ? (
        <SidebarContent>Loading...</SidebarContent>
      ) : (
        <SidebarContent>
          <SchemaTable />
          <NewChat />
          <ThreadList />
        </SidebarContent>
      )}

      <SidebarFooter>
        <AppSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
