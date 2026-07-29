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

  const sendMessage = async (message: string) => {
    if (activeConnection) {
      dispatch({ type: "SET_STATUS", payload: "sending" });
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "user",
          sql_query: null,
          content: message,
          created_at: new Date().toISOString(),
        },
      });

      try {
        const response = await api.chat({
          message,
          connectionId: activeConnection.id,
          threadId: state.activeThreadId,
        });

        dispatch({ type: "ADD_MESSAGE", payload: response.message });
        dispatch({ type: "SET_STATUS", payload: "idle" });
        if (!state.activeThreadId) {
          addThread(response.thread);
        }
      } catch {
        dispatch({ type: "SET_STATUS", payload: "error" });
        // error toasted by interceptor
      }
    }
  };

  function deleteThread(threadId: string) {
    dispatch({ type: "DELETE_THREAD", payload: threadId });
  }

  function addThread(thread: Thread) {
    dispatch({ type: "ADD_THREAD", payload: thread });
  }

  async function pinThread(threadId: string) {
    const updatedThread = await api.pinThread(threadId);
    dispatch({ type: "UPDATE_THREAD", payload: updatedThread });
  }

  return (
    <ChatContext
      value={{
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        messages: state.messages,
        status: state.status,
        setActiveThread,
        deleteThread,
        addThread,
        sendMessage,
        pinThread,
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
