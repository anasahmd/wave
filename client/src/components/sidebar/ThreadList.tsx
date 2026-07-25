import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";
import { useChat } from "@/providers/ChatProvider";
import ThreadListItem from "./ThreadListItem";

export default function ThreadList() {
  const { threads } = useChat();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recents</SidebarGroupLabel>
      <SidebarMenu>
        {threads.map((thread) => (
          <ThreadListItem thread={thread} key={thread.id} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
