import { useAuth } from "@/providers/AuthProvider";
import { fetchConnections } from "@/slices/connectionSlice";
import { useAppDispatch } from "@/store";
import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchConnections());
    }
  }, [user, dispatch]);

  if (loading) return null;

  if (user) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
