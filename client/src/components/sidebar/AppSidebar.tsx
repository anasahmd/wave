import DatabaseSwitcherMenu from "@/components/sidebar/DatabaseSwitcherMenu";
import AppSidebarFooter from "@/components/sidebar/AppSidebarFooter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuSkeleton,
  SidebarRail,
} from "../ui/sidebar";
import SchemaItem from "./SchemaItem";
import BusinessRulesItem from "./BusinessRulesItem";
import ThreadList from "./ThreadList";
import NewChatItem from "./NewChatItem";
import { useAppSelector } from "@/store";
import { Skeleton } from "../ui/skeleton";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { switchingId, loading, activeConnectionId } = useAppSelector(
    (state) => state.connection
  );
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <DatabaseSwitcherMenu />
      </SidebarHeader>
      {loading || switchingId ? (
        <SidebarContent>
          {/* Business rules */}
          <SidebarGroup>
            <Skeleton className="mb-2 h-6 rounded-md" />
          </SidebarGroup>

          {/* New chat */}
          <SidebarGroup>
            <Skeleton className="mb-4 h-6 rounded-md" />
          </SidebarGroup>

          {/* Schema explorer */}
          <SidebarGroup>
            <Skeleton className="mb-4 h-6 rounded-md" />
          </SidebarGroup>

          {/* Thread list skeleton */}
          <SidebarGroup>
            <Skeleton className="mt-2 mb-2 h-4 rounded-md" />
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, index) => (
                  <SidebarMenuSkeleton key={index} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      ) : (
        <SidebarContent className="gap-1">
          <BusinessRulesItem />
          {activeConnectionId && <NewChatItem />}
          <SchemaItem />
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
