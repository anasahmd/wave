import type {
  AuthResponse,
  ChangePasswordPayload,
  Connection,
  ConnectionResponse,
  LoginPayload,
  Message,
  RegisterPayload,
  Thread,
  User,
} from "@/types";
import axios from "axios";
import { toast } from "sonner";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 180000, // 3 minutes timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("wave_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("wave_token");
      // Dispatch a custom event for AuthContext
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    const message =
      error.response?.data?.error || error.message || "Request failed";
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post("/auth/register", payload),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    apiClient.post("/auth/login", payload),

  guestLogin: (): Promise<AuthResponse> => apiClient.post("/auth/guest"),

  // Users / Account
  me: (): Promise<User> => apiClient.get("/users/me"),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.put("/users/me/password", payload),

  updateProfile: (payload: { name: string; email: string }): Promise<User> =>
    apiClient.patch("/users/me", payload),

  deleteAccount: (password: string) =>
    apiClient.delete("/users/me", { data: { password } }),

  // Connections
  connectDb: ({
    uri,
    name,
  }: {
    uri: string;
    name: string;
  }): Promise<ConnectionResponse> =>
    apiClient.post("/connections/connect", { uri, name }),

  listConnections: (): Promise<Connection[]> => apiClient.get("/connections"),

  activateConnection: (id: string): Promise<ConnectionResponse> =>
    apiClient.post(`/connections/${id}/activate`),

  disconnectDb: (id: string): Promise<Connection> =>
    apiClient.post(`/connections/${id}/disconnect`),

  removeConnection: (id: string): Promise<Connection> =>
    apiClient.delete(`/connections/${id}`),

  updateConnectionName: ({
    id,
    name,
  }: {
    id: string;
    name: string;
  }): Promise<Connection> =>
    apiClient.patch(`/connections/${id}/name`, { name }),

  updateConnectionInstructions: ({
    id,
    custom_instructions,
  }: {
    id: string;
    custom_instructions: string;
  }): Promise<Connection> =>
    apiClient.patch(`/connections/${id}/instructions`, {
      custom_instructions,
    }),

  // Chat
  chat: ({
    message,
    connectionId,
    threadId,
  }: {
    message: string;
    connectionId: string;
    threadId: string | null;
  }): Promise<{ message: Message; thread: Thread }> =>
    apiClient.post("/chats", { message, connectionId, threadId }),

  getThreads: (connectionId: string): Promise<Thread[]> =>
    apiClient.get(`/chats/threads/${connectionId}`),

  getMessages: (threadId: string): Promise<Message[]> =>
    apiClient.get(`/chats/messages/${threadId}`),

  pinThread: (threadId: string): Promise<Thread> =>
    apiClient.patch(`/chats/threads/${threadId}/pin`),

  updateThreadTitle: ({
    threadId,
    title,
  }: {
    threadId: string;
    title: string;
  }): Promise<Thread> =>
    apiClient.patch(`/chats/threads/${threadId}/title`, { title }),

  deleteThread: (threadId: string): Promise<Thread> =>
    apiClient.delete(`/chats/threads/${threadId}`),
};
