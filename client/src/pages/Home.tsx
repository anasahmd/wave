import { AppSidebar } from "@/components/sidebar/AppSidebar";
import ChatArea from "@/components/chatarea/ChatArea";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatProvider from "@/providers/ChatProvider";

export default function Home() {
  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <ChatArea />
      </SidebarProvider>
    </ChatProvider>
  );
}
