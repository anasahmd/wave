import { useAuth } from "@/providers/AuthProvider";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
