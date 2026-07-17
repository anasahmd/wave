import { AuthLayout } from "@/components/layouts/AuthLayout"
import ChatArea from "@/components/ChatArea"
import { AppSidebar } from "@/components/sidebar/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"

export function App() {
  const user = null
  return (
    <div>
      <Routes>
        <Route element={<AuthLayout user={user} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/"
          element={
            <SidebarProvider>
              <ChatArea />
              <AppSidebar />
            </SidebarProvider>
          }
        />
      </Routes>
    </div>
  )
}

export default App
