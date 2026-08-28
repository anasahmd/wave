import {
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  Trash2Icon,
  Square,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import type { Thread } from "@/types";
import { useChat } from "@/providers/ChatProvider";
import { useAppSelector } from "@/store";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { deleteThread as deleteThreadAction } from "@/slices/chatSlice";

export default function ThreadListItem({ thread }: { thread: Thread }) {
  const {
    activeThreadId,
    deleteThread,
    pinThread,
    stopGeneration,
    updateThreadTitle,
  } = useChat();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(thread.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteThread(thread.id);
      if (deleteThreadAction.fulfilled.match(result)) {
        setIsDeleteDialogOpen(false);
        if (activeThreadId === thread.id) {
          navigate("/new");
        }
      }
    } finally {
      setIsDeleting(false);
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

  const threadStatus = useAppSelector(
    (state) => state.chat.threadsData[thread.id]?.status
  );
  const isGenerating = threadStatus === "sending";

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
            render={<Link to={`/t/${thread.id}`} />}
            className={activeThreadId === thread.id ? "bg-accent" : ""}
            title={thread.title}
          >
            <span className="mr-auto truncate">{thread.title}</span>
          </SidebarMenuButton>

          {isGenerating ? (
            <SidebarMenuAction
              className="group/action"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopGeneration(thread.id);
              }}
              title="Stop Generation"
            >
              <Spinner className="size-3 shrink-0 text-muted-foreground group-hover/action:hidden" />
              <Square className="hidden size-3.5 fill-current text-primary group-hover/action:block" />
            </SidebarMenuAction>
          ) : (
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
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(val) => !isDeleting && setIsDeleteDialogOpen(val)}
          >
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chat?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline" disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting && <Spinner />}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarMenuItem>
      )}
    </>
  );
}
