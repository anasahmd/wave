import { useAppDispatch, useAppSelector } from "@/store";
import type { Thread, UpdateThreadTitlePayload } from "@/types";
import { useEffect, type ReactNode } from "react";
import {
  addThread as addThreadAction,
  deleteThread as deleteThreadAction,
  fetchMessages,
  fetchThreads,
  pinThread as pinThreadAction,
  resetChat as resetChatAction,
  sendMessage as sendMessageAction,
  setActiveThread as setActiveThreadAction,
  updateThreadTitle as updateThreadTitleAction,
} from "@/slices/chatSlice";

export default function ChatProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { activeConnectionId } = useAppSelector((state) => state.connection);
  const { activeThreadId } = useAppSelector((state) => state.chat);

  // Fetch threads when active connection changes
  useEffect(() => {
    if (activeConnectionId) {
      dispatch(fetchThreads(activeConnectionId));
    } else {
      dispatch(resetChatAction());
    }
  }, [activeConnectionId, dispatch]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      dispatch(fetchMessages(activeThreadId));
    }
  }, [activeThreadId, dispatch]);

  // Listen for logout event to reset chat state
  useEffect(() => {
    const handleLogout = () => {
      dispatch(resetChatAction());
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [dispatch]);

  return <>{children}</>;
}

export function useChat() {
  const dispatch = useAppDispatch();
  const { threads, activeThreadId, messages, status, isThreadsLoading } =
    useAppSelector((state) => state.chat);
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  const setActiveThread = (threadId: string) => {
    dispatch(setActiveThreadAction(threadId));
  };

  const sendMessage = (message: string) => {
    dispatch(
      sendMessageAction({
        message,
        connectionId: activeConnectionId,
      })
    );
  };

  const deleteThread = (threadId: string) => {
    dispatch(deleteThreadAction(threadId));
  };

  const addThread = (thread: Thread) => {
    dispatch(addThreadAction(thread));
  };

  const pinThread = (threadId: string) => {
    dispatch(pinThreadAction(threadId));
  };

  const updateThreadTitle = (payload: UpdateThreadTitlePayload) => {
    dispatch(updateThreadTitleAction(payload));
  };

  const resetChat = () => {
    dispatch(resetChatAction());
  };

  return {
    threads,
    activeThreadId,
    messages,
    status,
    isThreadsLoading,
    setActiveThread,
    deleteThread,
    addThread,
    sendMessage,
    pinThread,
    updateThreadTitle,
    resetChat,
  };
}
