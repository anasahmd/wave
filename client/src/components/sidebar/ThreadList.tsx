import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSkeleton,
} from "../ui/sidebar";
import { useChat } from "@/providers/ChatProvider";
import ThreadListItem from "./ThreadListItem";
import { Skeleton } from "../ui/skeleton";

export default function ThreadList() {
  const { threads, status } = useChat();

  const pinnedThreads = threads.filter((thread) => thread.pinned);
  const normalThreads = threads.filter((thread) => !thread.pinned);

  if (status === "loading") {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <Skeleton className="mt-2 mb-2 h-4 rounded-md" />
        <SidebarGroupContent>
          <SidebarMenu>
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuSkeleton key={index} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {pinnedThreads.length > 0 && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Pinned</SidebarGroupLabel>
          <SidebarMenu>
            {pinnedThreads.map((thread) => (
              <ThreadListItem thread={thread} key={thread.id} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {normalThreads.length > 0 && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarMenu>
            {threads
              .filter((thread) => !thread.pinned)
              .map((thread) => (
                <ThreadListItem thread={thread} key={thread.id} />
              ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
