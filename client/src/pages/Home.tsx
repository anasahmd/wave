import { AppSidebar } from "@/components/sidebar/AppSidebar";
import ChatArea from "@/components/chat/ChatArea";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatProvider from "@/providers/ChatProvider";
import ConnectionProvider from "@/providers/ConnectionProvider";

export default function Home() {
  return (
    <ConnectionProvider>
      <ChatProvider>
        <SidebarProvider>
          <AppSidebar />
          <ChatArea />
        </SidebarProvider>
      </ChatProvider>
    </ConnectionProvider>
  );
}
