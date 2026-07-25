import ChatContext from "@/contexts/ChatContext";
import chatReducer from "@/reducers/chat";
import { api } from "@/services/apiClient";
import type { ChatState, Message, Thread } from "@/types";
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
          dispatch({ type: "SET_THREADS", payload: threads });
        } catch (error) {
          console.log(error);
        }
      }
    };

    getThreads();
  }, [activeConnection]);

  useEffect(() => {
    const getMessages = async () => {
      if (state.activeThreadId) {
        try {
          const chats = await api.getMessages(state.activeThreadId);
          dispatch({ type: "SET_MESSAGES", payload: chats });
        } catch (error) {
          console.log(error);
        }
      }
    };
    getMessages();
  }, [state.activeThreadId]);

  const setActiveThread = async (threadId: string) => {
    dispatch({ type: "SET_ACTIVE_THREAD", payload: threadId });
  };

  const addMessage = (message: Message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  };

  const deleteThread = (threadId: string) => {
    dispatch({ type: "DELETE_THREAD", payload: threadId });
  };

  const addThread = (thread: Thread) => {
    dispatch({ type: "ADD_THREAD", payload: thread });
  };

  return (
    <ChatContext
      value={{
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        messages: state.messages,
        status: state.status,
        setActiveThread,
        addMessage,
        deleteThread,
        addThread,
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
