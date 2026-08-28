import type {
  AuthResponse,
  ChangePasswordPayload,
  Connection,
  ConnectionResponse,
  SavedQuery,
  LoginPayload,
  Message,
  RegisterPayload,
  Thread,
  User,
} from "@/types";
import { fetchEventSource } from "@microsoft/fetch-event-source";
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

  streamChat: async ({
    message,
    connectionId,
    threadId,
    onThreadCreated,
    onToken,
    onDone,
    onError,
    signal,
  }: {
    message: string;
    connectionId: string;
    threadId?: string | null;
    onThreadCreated: (data: { thread: Thread }) => void;
    onToken: (data: { content: string }) => void;
    onDone: (data: { message: Message }) => void;
    onError: (data: { error: string }) => void;
    signal: AbortSignal;
  }): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_URL || "/api";
    const token = localStorage.getItem("wave_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    await fetchEventSource(`${baseURL}/chats`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        connectionId,
        threadId: threadId || undefined,
      }),
      signal,
      async onopen(response) {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("wave_token");
            window.dispatchEvent(new Event("auth:unauthorized"));
          }
          let errorMsg = "Failed to send message";
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch {
            // ignore JSON parse error
          }
          throw new Error(errorMsg);
        }
      },
      onmessage(ev) {
        if (!ev.data) return;
        try {
          const event = JSON.parse(ev.data);
          switch (event.type) {
            case "thread_created":
              onThreadCreated({ thread: event.thread });
              break;
            case "token":
              onToken({ content: event.content });
              break;
            case "done":
              onDone({ message: event.message });
              break;
            case "error":
              toast.error(event.error || "Streaming error");
              onError({ error: event.error || "Streaming error" });
              break;
            default:
              break;
          }
        } catch (e) {
          console.error("Failed to parse SSE event data:", e, ev.data);
        }
      },
      onerror(err) {
        if (signal?.aborted || err?.name === "AbortError") {
          console.log("Stream aborted by user");
          return;
        }
        const errorMsg = err?.message || "Streaming error";
        toast.error(errorMsg);
        onError({ error: errorMsg });
        throw err; // throw to stop auto-retry
      },
    });
  },

  getThreads: (connectionId: string): Promise<Thread[]> =>
    apiClient.get(`/chats/threads/${connectionId}`),

  getMessages: (
    threadId: string
  ): Promise<{ connection_id: string; messages: Message[] }> =>
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

  // Saved Queries
  addSavedQuery: ({
    connectionId,
    question,
    query,
  }: {
    connectionId: string;
    question: string;
    query: string;
  }): Promise<SavedQuery> =>
    apiClient.post("/saved-queries", {
      connectionId,
      question,
      query,
    }),

  getSavedQueries: (connectionId: string): Promise<SavedQuery[]> =>
    apiClient.get(`/saved-queries/${connectionId}`),

  deleteSavedQuery: (id: string): Promise<SavedQuery> =>
    apiClient.delete(`/saved-queries/${id}`),

  updateSavedQuery: ({
    id,
    question,
    query,
  }: {
    id: string;
    question?: string;
    query?: string;
  }): Promise<SavedQuery> =>
    apiClient.patch(`/saved-queries/${id}`, { question, query }),
};
