import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  Pen,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/providers/ChatProvider";

export default function ChatList() {
  const isMobile = useIsMobile();
  const { threads, setActiveThread } = useChat();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <SidebarMenuItem key={thread.id}>
            <SidebarMenuButton
              onClick={() => setActiveThread(thread.id)}
              render={
                <SidebarMenuButton title={thread.title}>
                  <span>{thread.title}</span>
                </SidebarMenuButton>
              }
            ></SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Star className="text-muted-foreground" />
                  <span>Star</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}
