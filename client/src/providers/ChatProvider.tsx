import { api } from "@/services/apiClient";
import {
  addThread as addThreadAction,
  appendTokenDelta,
  cancelStreaming,
  clearMessages,
  deleteThread as deleteThreadAction,
  fetchMessages,
  fetchThreads,
  finishStreamingMessage,
  pinThread as pinThreadAction,
  resetChat as resetChatAction,
  setStatusText,
  startStreamingMessage,
  updateThreadTitle as updateThreadTitleAction,
} from "@/slices/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import type { Thread, UpdateThreadTitlePayload } from "@/types";
import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChatProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { activeConnectionId } = useAppSelector((state) => state.connection);
  const { threadId: urlThreadId } = useParams<{ threadId?: string }>();

  // Fetch threads when active connection changes
  useEffect(() => {
    if (activeConnectionId) {
      dispatch(fetchThreads(activeConnectionId));
    }
  }, [activeConnectionId, dispatch]);

  // Fetch messages when URL threadId changes
  useEffect(() => {
    if (urlThreadId) {
      dispatch(fetchMessages(urlThreadId));
    } else {
      dispatch(clearMessages());
    }
  }, [urlThreadId, dispatch]);

  return <>{children}</>;
}

export function useChat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { threadId: urlThreadId } = useParams<{ threadId?: string }>();
  const activeThreadId = urlThreadId || "";
  const abortControllerRef = useRef<AbortController | null>(null);

  const { threads, messages, status } = useAppSelector(
    (state) => state.chat
  );
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  const setActiveThread = (threadId: string) => {
    if (threadId) {
      navigate(`/t/${threadId}`);
    } else {
      navigate("/new");
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch(cancelStreaming());
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeConnectionId) {
      toast.error("No active database connection selected");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    dispatch(startStreamingMessage({ userMessage: message }));

    try {
      await api.streamChat({
        message,
        connectionId: activeConnectionId,
        threadId: activeThreadId || undefined,
        signal: controller.signal,
        onThreadCreated: ({ thread }) => {
          dispatch(addThreadAction(thread));
          if (thread.id && thread.id !== activeThreadId) {
            navigate(`/t/${thread.id}`);
          }
        },
        onToken: ({ content }) => {
          dispatch(appendTokenDelta({ content }));
        },
        onDone: ({ message: finalMsg }) => {
          dispatch(finishStreamingMessage({ message: finalMsg }));
          abortControllerRef.current = null;
        },
        onError: () => {
          dispatch(cancelStreaming());
          abortControllerRef.current = null;
        },
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        dispatch(cancelStreaming());
      }
      abortControllerRef.current = null;
    }
  };

  const deleteThread = (threadId: string) => {
    if (activeThreadId === threadId) {
      navigate("/new");
    }
    return dispatch(deleteThreadAction(threadId));
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
    isThreadsLoading: status === "loading_threads",
    setActiveThread,
    deleteThread,
    addThread,
    sendMessage,
    stopGeneration,
    pinThread,
    updateThreadTitle,
    resetChat,
  };
}
