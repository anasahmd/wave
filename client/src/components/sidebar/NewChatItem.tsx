import { SquarePen } from "lucide-react";
import { useChat } from "@/providers/ChatProvider";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export default function NewChatItem() {
  const { activeThreadId, setActiveThread } = useChat();

  return (
    <SidebarGroup className="py-0.5">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="New Chat"
            title="Start New Chat"
            className={`text-sidebar-foreground hover:bg-accent ${activeThreadId ? "" : "bg-accent"}`}
            onClick={() => setActiveThread("")}
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
