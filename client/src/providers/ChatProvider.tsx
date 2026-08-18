import ChatContext from "@/contexts/ChatContext";
import chatReducer from "@/reducers/chat";
import { api } from "@/services/apiClient";
import type { ChatState, Thread, UpdateThreadTitlePayload } from "@/types";
import { useContext, useEffect, useReducer, type ReactNode } from "react";
import { useAppSelector } from "@/store";

export const chatInitialState: ChatState = {
  threads: [],
  activeThreadId: "",
  messages: [],
  status: "idle",
  isThreadsLoading: true,
};

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, chatInitialState);
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  // Fetch threads when active connection changes
  useEffect(() => {
    const getThreads = async () => {
      if (activeConnectionId) {
        dispatch({ type: "SET_THREADS_LOADING", payload: true });
        try {
          const threads = await api.getThreads(activeConnectionId);
          dispatch({ type: "SET_THREADS", payload: threads });
        } catch (error) {
          console.log(error);
        } finally {
          dispatch({ type: "SET_THREADS_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_THREADS_LOADING", payload: false });
      }
    };

    getThreads();
  }, [activeConnectionId]);

  // Fetch messages when active thread changes
  useEffect(() => {
    const getMessages = async () => {
      if (state.activeThreadId) {
        dispatch({ type: "SET_STATUS", payload: "loading" });
        try {
          const chats = await api.getMessages(state.activeThreadId);
          dispatch({ type: "SET_MESSAGES", payload: chats });
        } catch (error) {
          console.log(error);
        } finally {
          dispatch({ type: "SET_STATUS", payload: "idle" });
        }
      }
    };
    getMessages();
  }, [state.activeThreadId]);

  // Listen for logout event to reset chat state
  useEffect(() => {
    const handleLogout = () => {
      dispatch({ type: "RESET_CHAT" });
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const setActiveThread = async (threadId: string) => {
    dispatch({ type: "SET_ACTIVE_THREAD", payload: threadId });
  };

  const sendMessage = async (message: string) => {
    if (activeConnectionId) {
      dispatch({ type: "SET_STATUS", payload: "sending" });
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: crypto.randomUUID(),
          role: "user",
          query_used: null,
          content: message,
          created_at: new Date().toISOString(),
        },
      });

      try {
        const response = await api.chat({
          message,
          connectionId: activeConnectionId,
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

  async function deleteThread(threadId: string) {
    try {
      const deletedThread = await api.deleteThread(threadId);
      dispatch({ type: "DELETE_THREAD", payload: deletedThread.id });
    } catch {
      // error toasted by interceptor
    }
  }

  function addThread(thread: Thread) {
    dispatch({ type: "ADD_THREAD", payload: thread });
  }

  async function pinThread(threadId: string) {
    try {
      const updatedThread = await api.pinThread(threadId);
      dispatch({ type: "UPDATE_THREAD", payload: updatedThread });
    } catch {
      // error toasted by interceptor
    }
  }

  async function updateThreadTitle({
    threadId,
    title,
  }: UpdateThreadTitlePayload) {
    const originalThread = state.threads.find((t) => t.id === threadId);
    if (!originalThread) return;

    // optimistic ui update
    dispatch({
      type: "UPDATE_THREAD",
      payload: { ...originalThread, title },
    });
    try {
      const updatedThread = await api.updateThreadTitle({ threadId, title });
      dispatch({ type: "UPDATE_THREAD", payload: updatedThread });
    } catch {
      // error toasted by interceptor
      dispatch({ type: "UPDATE_THREAD", payload: originalThread });
    }
  }

  function resetChat() {
    dispatch({ type: "RESET_CHAT" });
  }

  return (
    <ChatContext
      value={{
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        messages: state.messages,
        status: state.status,
        isThreadsLoading: state.isThreadsLoading,
        setActiveThread,
        deleteThread,
        addThread,
        sendMessage,
        pinThread,
        updateThreadTitle,
        resetChat,
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
