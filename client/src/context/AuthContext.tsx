import authReducer, {
  type AuthAction,
  type AuthState,
  type User,
} from "@/reducers/auth-reducer";
import { api } from "@/services/apiClient";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  isLoggedIn: false,
  user: null,
  loading: true,
};

interface AuthContextType extends AuthState {
  handleLogin: (user: User, token: string) => void;
  handleLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

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
    localStorage.removeItem("wave_token");
    navigate("/login");
    toast.success(`You're logged out`);
  };

  return (
    <AuthContext value={{ ...state, handleLogin, handleLogout }}>
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
