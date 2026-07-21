import { Navigate, Outlet } from "react-router-dom";
import AuthHeader from "../AuthHeader";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "../ui/spinner";

export function AuthLayout() {
  const { loading, user } = useAuth();

  if (loading) return <Spinner />;

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col px-6 sm:px-12">
      <AuthHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
