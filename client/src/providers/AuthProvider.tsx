import AuthContext from "@/contexts/AuthContext";
import authReducer from "@/reducers/auth";
import { api } from "@/services/apiClient";
import { resetConnection } from "@/slices/connectionSlice";
import { useAppDispatch } from "@/store";
import type { User } from "@/types";
import { useContext, useEffect, useReducer, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  isLoggedIn: false,
  user: null,
  loading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const appDispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("wave_token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
      try {
        const user = await api.me();
        dispatch({ type: "LOGIN", payload: user });
      } catch (error: unknown) {
        console.log("Authentication check failed:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    checkAuth();
  }, []);

  // Handles auth:unauthorized event broadcasted from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("wave_token");
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogin = (user: User, token: string) => {
    dispatch({ type: "LOGIN", payload: user });
    localStorage.setItem("wave_token", token);
    navigate("/");
    toast.success("Welcome back");
  };

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    appDispatch(resetConnection());
    localStorage.removeItem("wave_token");
    navigate("/login");
    toast.success(`You're logged out`);
  };

  const handleGuestLogin = (user: User, token: string) => {
    dispatch({ type: "LOGIN", payload: user });
    localStorage.setItem("wave_token", token);
    navigate("/");
    toast.success("You're logged in as guest user");
  };

  const updateProfile = async (payload: { name: string; email: string }) => {
    const updatedUser = await api.updateProfile(payload);
    dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
    toast.success("Profile updated");
  };

  return (
    <AuthContext
      value={{
        ...state,
        handleLogin,
        handleGuestLogin,
        handleLogout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
