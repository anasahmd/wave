export interface User {
  id: string;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  handleLogin: (user: User, token: string) => void;
  handleLogout: () => void;
}

export type AuthAction =
  | {
      type: "LOGIN";
      payload: { id: string; email: string; name: string };
    }
  | { type: "LOGOUT" }
  | {
      type: "SET_LOADING";
      payload: boolean;
    };
