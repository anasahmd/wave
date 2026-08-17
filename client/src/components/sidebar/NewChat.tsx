import { SquarePen } from "lucide-react";
import { useChat } from "@/providers/ChatProvider";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export default function NewChat() {
  const { activeThreadId, setActiveThread } = useChat();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="New Chat"
            className={activeThreadId ? "" : "bg-accent"}
            onClick={() => setActiveThread("")}
          >
            <SquarePen />
            <span>New chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
