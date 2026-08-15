import { AuthLayout } from "@/components/layouts/AuthLayout";
import ChatArea from "@/components/chatarea/ChatArea";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import ChatProvider from "./providers/ChatProvider";
import { useAppDispatch } from "./store";
import { fetchConnections } from "./slices/connectionSlice";

export function App() {
  const dispatch = useAppDispatch();

  dispatch(fetchConnections());

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
              <ChatProvider>
                <SidebarProvider>
                  <AppSidebar />
                  <ChatArea />
                </SidebarProvider>
              </ChatProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
