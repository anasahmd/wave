import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import type { Thread } from "@/types";
import { useChat } from "@/providers/ChatProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

export default function ThreadListItem({ thread }: { thread: Thread }) {
  const {
    activeThreadId,
    setActiveThread,
    deleteThread,
    pinThread,
    updateThreadTitle,
  } = useChat();
  const isMobile = useIsMobile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(thread.title);

  const handleDelete = async () => {
    try {
      const deletedThread = await api.deleteThread(thread.id);
      deleteThread(deletedThread.id);
    } catch {
      // Error toasted by axios interceptor
    }
  };

  const handleSubmit = async () => {
    setIsEditing(false);
    const trimmed = editedTitle.trim();

    if (!trimmed || trimmed === thread.title) {
      setEditedTitle(thread.title);
      return;
    }
    updateThreadTitle({ threadId: thread.id, title: trimmed });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      {isEditing ? (
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          autoFocus
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <SidebarMenuItem>
          <SidebarMenuButton
            className={activeThreadId === thread.id ? "bg-accent" : ""}
            onClick={() => setActiveThread(thread.id)}
            title={thread.title}
          >
            <span className="mr-auto">{thread.title}</span>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              }
            />
            <DropdownMenuContent
              className="w-52 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem onClick={() => pinThread(thread.id)}>
                {thread.pinned ? (
                  <>
                    <PinOff className="text-muted-foreground" />
                    <span>Unpin</span>
                  </>
                ) : (
                  <>
                    <Pin className="text-muted-foreground" />
                    <span>Pin</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
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
      )}
    </>
  );
}
