import type {
  AuthResponse,
  ChangePasswordPayload,
  Connection,
  ConnectionResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000, // 10 seconds timeout
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
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // Auth
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post("/auth/register", payload),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    apiClient.post("/auth/login", payload),

  me: (): Promise<User> => apiClient.get("/auth/me"),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.put("/auth/password", payload),

  deleteAccount: (password: string) =>
    apiClient.delete("/auth/account", { data: { password } }),

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

  disconnectDb: (id: string) => apiClient.post(`/connections/${id}/disconnect`),
  removeConnection: (id: string) => apiClient.delete(`/connections/${id}`),

  // Chat
  chat: ({
    message,
    connectionId,
    threadId,
  }: {
    message: string;
    connectionId: string;
    threadId: string;
  }) => apiClient.post("/chats", { message, connectionId, threadId }),

  getThreads: (connectionId: string) =>
    apiClient.get(`/chats/threads/${connectionId}`),

  getMessages: (threadId: string) =>
    apiClient.get(`/chats/messages/${threadId}`),

  deleteThread: (threadId: string) =>
    apiClient.delete(`/chats/threads/${threadId}`),
};

export default apiClient;
