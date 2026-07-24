import ChatContext from "@/contexts/ChatContext";
import chatReducer from "@/reducers/chat";
import { api } from "@/services/apiClient";
import type { ChatState } from "@/types";
import { useContext, useEffect, useReducer, type ReactNode } from "react";
import { useConnection } from "./ConnectionProvider";

const initialState: ChatState = {
  threads: [],
  activeThreadId: "",
  messages: [],
  status: "idle",
};

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { activeConnection } = useConnection();

  useEffect(() => {
    const getThreads = async () => {
      if (activeConnection) {
        try {
          const threads = await api.getThreads(activeConnection.id);
          console.log(threads);

          dispatch({ type: "SET_THREADS", payload: threads });
        } catch (error) {}
      }
    };

    getThreads();
  }, [activeConnection]);

  return (
    <ChatContext
      value={{
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        messages: state.messages,
        status: state.status,
      }}
    >
      {children}
    </ChatContext>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
