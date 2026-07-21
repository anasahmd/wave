import authReducer, {
  type AuthAction,
  type AuthState,
  type User,
} from "@/reducers/auth-reducer";
import apiClient from "@/services/apiClient";
import { AxiosError } from "axios";
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
        const response = await apiClient.get("/auth/me");
        if (response.data?.user) {
          dispatch({ type: "LOGIN", payload: response.data.user });
          navigate("/");
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          dispatch({ type: "LOGOUT" });
          localStorage.removeItem("wave_token");
          navigate("/login");
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    checkAuth();
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
