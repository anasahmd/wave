import ChatArea from "@/components/ChatArea"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export function App() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <ChatArea />
      </SidebarProvider>
    </div>
  )
}

export default App
