import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  Pen,
  Pencil,
  Pin,
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
import type { Thread } from "@/types";
import { useChat } from "@/providers/ChatProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/services/apiClient";

export default function ThreadListItem({ thread }: { thread: Thread }) {
  const { activeThreadId, setActiveThread, deleteThread } = useChat();
  const isMobile = useIsMobile();

  const handleDelete = async () => {
    try {
      const deletedThread = await api.deleteThread(thread.id);
      deleteThread(deletedThread.id);
    } catch {
      // Error toasted by axios interceptor
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={activeThreadId === thread.id ? "bg-accent" : ""}
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
          className="w-52 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem>
            <Pin className="text-muted-foreground" />
            <span>Pin</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil className="text-muted-foreground" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
