import { SquarePen } from "lucide-react";
import { useChat } from "@/providers/ChatProvider";
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export default function NewChatItem() {
  const { activeThreadId } = useChat();

  return (
    <SidebarGroup className="py-0.5">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link to="/new" />}
            tooltip="New Chat"
            title="Start New Chat"
            className={`text-sidebar-foreground hover:bg-accent ${activeThreadId ? "" : "bg-accent"}`}
          >
            <div className="flex items-center gap-2">
              <SquarePen className="size-4" />
              <span className="truncate text-sm font-medium">New Chat</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
