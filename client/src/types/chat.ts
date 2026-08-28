import type { SavedQueryUsed } from "./savedQuery";

export interface Thread {
  id: string;
  title: string;
  connection_id: string;
  created_at: string;
  updated_at?: string;
  pinned: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  query_used: string | null;
  saved_queries_used?: SavedQueryUsed[];
  content: string;
  statusText?: string;
  is_aborted?: boolean;
  created_at: string;
}

export interface ThreadData {
  messages: Message[];
  status: "idle" | "loading" | "sending" | "error";
}

export interface ChatState {
  threads: Thread[];
  threadsData: Record<string, ThreadData>;
  isThreadsLoading: boolean;
}

export interface UpdateThreadTitlePayload {
  threadId: string;
  title: string;
}

export type ChatAction =
  // Thread Actions
  | { type: "SET_THREADS"; payload: Thread[] }
  | { type: "ADD_THREAD"; payload: Thread }
  | { type: "DELETE_THREAD"; payload: string }
  | { type: "UPDATE_THREAD"; payload: Thread }

  // Message Actions
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }

  // State & Status Actions
  | {
      type: "SET_STATUS";
      payload: "idle" | "loading_threads" | "loading" | "sending" | "error";
    }
  | { type: "RESET_CHAT" };

export interface ChatContextType extends ChatState {
  activeThreadId: string;
  isThreadsLoading: boolean;
  setActiveThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  addThread: (thread: Thread) => void;
  sendMessage: (text: string) => void;
  stopGeneration?: () => void;
  pinThread: (threadId: string) => void;
  updateThreadTitle: (payload: UpdateThreadTitlePayload) => void;
  resetChat: () => void;
}
