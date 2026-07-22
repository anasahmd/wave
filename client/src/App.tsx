import { AuthLayout } from "@/components/layouts/AuthLayout";
import ChatArea from "@/components/ChatArea";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import { ConnectionProvider } from "./context/ConnectionContext";

export function App() {
  return (
    <div>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/"
          element={
            <PrivateRoute>
              <ConnectionProvider>
                <SidebarProvider>
                  <ChatArea />
                  <AppSidebar />
                </SidebarProvider>
              </ConnectionProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
