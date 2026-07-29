import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";
import { useChat } from "@/providers/ChatProvider";
import ThreadListItem from "./ThreadListItem";

export default function ThreadList() {
  const { threads } = useChat();

  const pinnedThreads = threads.filter((thread) => thread.pinned);
  const normalThreads = threads.filter((thread) => !thread.pinned);
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
