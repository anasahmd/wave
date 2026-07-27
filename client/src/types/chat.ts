export interface Thread {
  id: string;
  title: string;
  connection_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  sql_query: string | null;
  content: string;
  created_at: string;
}

export interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  messages: Message[];
  status: "idle" | "loading" | "sending" | "error";
}

export type ChatAction =
  // Thread Actions
  | { type: "SET_THREADS"; payload: Thread[] }
  | { type: "SET_ACTIVE_THREAD"; payload: string | null }
  | { type: "ADD_THREAD"; payload: Thread }
  | { type: "DELETE_THREAD"; payload: string }

  // Message Actions
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }

  // State & Status Actions
  | { type: "SET_STATUS"; payload: "idle" | "loading" | "sending" | "error" }
  | { type: "RESET_CHAT" };

export interface ChatContextType extends ChatState {
  setActiveThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  addThread: (thread: Thread) => void;
  sendMessage: (text: string) => void;
}
