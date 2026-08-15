export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
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

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  handleLogin: (user: User, token: string) => void;
  handleLogout: () => void;
  handleGuestLogin: (user: User, token: string) => void;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

export type AuthAction =
  | {
      type: "LOGIN";
      payload: User;
    }
  | { type: "LOGOUT" }
  | {
      type: "SET_LOADING";
      payload: boolean;
    }
  | {
      type: "UPDATE_PROFILE";
      payload: User;
    };
