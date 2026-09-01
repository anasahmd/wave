import { api } from "@/services/apiClient";
import {
  addThread as addThreadAction,
  appendTokenDelta,
  cancelStreaming,
  clearNewThreadState,
  deleteThread as deleteThreadAction,
  fetchMessages,
  fetchThreads,
  finishStreamingMessage,
  migrateThreadState,
  pinThread as pinThreadAction,
  resetChat as resetChatAction,
  startStreamingMessage,
  updateThreadTitle as updateThreadTitleAction,
} from "@/slices/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import type { Thread, UpdateThreadTitlePayload } from "@/types";
import { useEffect, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Global map to track active stream controllers per thread
export const streamControllers = new Map<string, AbortController>();

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
      dispatch(clearNewThreadState());
    }
  }, [urlThreadId, dispatch]);

  return <>{children}</>;
}

export function useChat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { threadId: urlThreadId } = useParams<{ threadId?: string }>();
  const activeThreadId = urlThreadId || "new";

  const { threads, threadsData, isThreadsLoading } = useAppSelector(
    (state) => state.chat
  );
  
  const currentThreadData = threadsData[activeThreadId] || {
    messages: [],
    status: activeThreadId === "new" ? "idle" : "loading",
  };
  const { messages, status } = currentThreadData;
  
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  const setActiveThread = (threadId: string) => {
    if (threadId) {
      navigate(`/t/${threadId}`);
    } else {
      navigate("/new");
    }
  };

  const stopGeneration = (targetThreadId?: string) => {
    const threadIdToStop = targetThreadId || activeThreadId;
    const controller = streamControllers.get(threadIdToStop);
    if (controller) {
      controller.abort();
      streamControllers.delete(threadIdToStop);
      dispatch(cancelStreaming({ threadId: threadIdToStop }));
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeConnectionId) {
      toast.error("No active database connection selected");
      return;
    }

    let currentThreadId = activeThreadId;
    const controller = new AbortController();
    streamControllers.set(currentThreadId, controller);

    dispatch(startStreamingMessage({ threadId: currentThreadId, userMessage: message }));

    try {
      await api.streamChat({
        message,
        connectionId: activeConnectionId,
        threadId: activeThreadId === "new" ? undefined : activeThreadId,
        signal: controller.signal,
        onThreadCreated: ({ thread }) => {
          dispatch(addThreadAction(thread));
          if (thread.id && currentThreadId !== thread.id) {
            // Perform the handoff mid-stream
            streamControllers.set(thread.id, controller);
            streamControllers.delete(currentThreadId);
            dispatch(migrateThreadState({ oldId: currentThreadId, newId: thread.id }));
            currentThreadId = thread.id; // Update our local reference for subsequent events
            
            if (activeThreadId === "new") {
              navigate(`/t/${thread.id}`);
            }
          }
        },
        onToken: ({ content }) => {
          dispatch(appendTokenDelta({ threadId: currentThreadId, content }));
        },
        onDone: ({ message: finalMsg }) => {
          dispatch(finishStreamingMessage({ threadId: currentThreadId, message: finalMsg }));
          streamControllers.delete(currentThreadId);
        },
        onError: () => {
          dispatch(cancelStreaming({ threadId: currentThreadId }));
          streamControllers.delete(currentThreadId);
        },
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        dispatch(cancelStreaming({ threadId: currentThreadId }));
      }
      streamControllers.delete(currentThreadId);
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
    return dispatch(pinThreadAction(threadId));
  };

  const updateThreadTitle = (payload: UpdateThreadTitlePayload) => {
    return dispatch(updateThreadTitleAction(payload));
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
    stopGeneration,
    pinThread,
    updateThreadTitle,
    resetChat,
  };
}
