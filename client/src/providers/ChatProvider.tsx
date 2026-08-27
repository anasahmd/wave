import { useAppDispatch, useAppSelector } from "@/store";
import type { Thread, UpdateThreadTitlePayload } from "@/types";
import { useEffect, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { threadId: urlThreadId } = useParams<{ threadId?: string }>();

  // Synchronize URL :threadId with Redux activeThreadId
  useEffect(() => {
    const targetThreadId = urlThreadId || "";
    if (activeThreadId !== targetThreadId) {
      dispatch(setActiveThreadAction(targetThreadId));
    }
  }, [urlThreadId, activeThreadId, dispatch]);

  // Fetch threads when active connection changes
  useEffect(() => {
    if (activeConnectionId) {
      dispatch(fetchThreads(activeConnectionId));
    }
  }, [activeConnectionId, dispatch]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      dispatch(fetchMessages(activeThreadId));
    }
  }, [activeThreadId, dispatch]);

  return <>{children}</>;
}

export function useChat() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { threads, activeThreadId, messages, status, isThreadsLoading } =
    useAppSelector((state) => state.chat);
  const { activeConnectionId } = useAppSelector((state) => state.connection);

  const setActiveThread = (threadId: string) => {
    dispatch(setActiveThreadAction(threadId));
  };

  const sendMessage = async (message: string) => {
    const actionResult = await dispatch(
      sendMessageAction({
        message,
        connectionId: activeConnectionId,
      })
    );
    if (sendMessageAction.fulfilled.match(actionResult)) {
      const { response, isNewThread } = actionResult.payload;
      if (isNewThread && response.thread?.id) {
        navigate(`/t/${response.thread.id}`);
      }
    }
  };

  const deleteThread = (threadId: string) => {
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
