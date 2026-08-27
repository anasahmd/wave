import { api } from "@/services/apiClient";
import { switchConnection } from "@/slices/connectionSlice";
import type { RootState } from "@/store";
import type {
  ChatState,
  Message,
  Thread,
  UpdateThreadTitlePayload,
} from "@/types";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

const initialState: ChatState = {
  threads: [],
  activeThreadId: "",
  messages: [],
  status: "idle",
  isThreadsLoading: false,
};

export const fetchThreads = createAsyncThunk(
  "chat/fetchThreads",
  async (connectionId: string) => {
    const threads = await api.getThreads(connectionId);
    return threads;
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (threadId: string, { dispatch, getState }) => {
    const data = await api.getMessages(threadId);
    const state = getState() as RootState;
    if (
      data.connection_id &&
      data.connection_id !== state.connection.activeConnectionId
    ) {
      dispatch(switchConnection(data.connection_id));
    }
    return data.messages;
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    { message, connectionId }: { message: string; connectionId: string | null },
    { getState, rejectWithValue }
  ) => {
    if (!connectionId) return rejectWithValue("No active connection");

    const state = (getState() as RootState).chat;
    const currentThreadId = state.activeThreadId;

    try {
      const response = await api.chat({
        message,
        connectionId,
        threadId: currentThreadId,
      });
      return { response, isNewThread: !currentThreadId };
    } catch (err) {
      return rejectWithValue(
        (err as Error).message || "LLM connection is not enabled"
      );
    }
  }
);

export const deleteThread = createAsyncThunk(
  "chat/deleteThread",
  async (threadId: string) => {
    const deletedThread = await api.deleteThread(threadId);
    return deletedThread.id;
  }
);

export const pinThread = createAsyncThunk(
  "chat/pinThread",
  async (threadId: string) => {
    const updatedThread = await api.pinThread(threadId);
    return updatedThread;
  }
);

export const updateThreadTitle = createAsyncThunk(
  "chat/updateThreadTitle",
  async (
    { threadId, title }: UpdateThreadTitlePayload,
    { getState, rejectWithValue }
  ) => {
    const state = (getState() as RootState).chat;
    const originalThread = state.threads.find((t) => t.id === threadId);
    if (!originalThread) return rejectWithValue("Thread not found");

    try {
      const updatedThread = await api.updateThreadTitle({ threadId, title });
      return { updatedThread };
    } catch (err) {
      return rejectWithValue({ threadId, originalThread, error: err });
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveThread: (state, action: PayloadAction<string>) => {
      const newThreadId = action.payload;
      const isSameThread = newThreadId === state.activeThreadId;
      state.activeThreadId = newThreadId;
      if (!isSameThread) {
        state.messages = [];
        // if newThreadId is empty, it means that we're in the new chat
        if (newThreadId) {
          state.status = "loading";
        } else {
          state.status = "idle";
        }
      }
    },
    addThread: (state, action: PayloadAction<Thread>) => {
      state.threads.unshift(action.payload);
      state.activeThreadId = action.payload.id;
    },
    resetChat: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Threads
    builder.addCase(fetchThreads.pending, (state) => {
      state.threads = [];
      state.isThreadsLoading = true;
    });
    builder.addCase(fetchThreads.fulfilled, (state, action) => {
      state.threads = action.payload;
      state.isThreadsLoading = false;
    });
    builder.addCase(fetchThreads.rejected, (state) => {
      state.threads = [];
      state.isThreadsLoading = false;
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.messages = [];
      state.status = "loading";
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
      state.status = "idle";
    });
    builder.addCase(fetchMessages.rejected, (state) => {
      state.messages = [];
      state.status = "idle";
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state, action) => {
      state.status = "sending";
      const userMsgId = crypto.randomUUID();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        query_used: null,
        content: action.meta.arg.message,
        created_at: new Date().toISOString(),
      };
      const pendingAssistantMsg: Message = {
        id: `pending-${userMsgId}`,
        role: "assistant",
        query_used: null,
        content: "",
        created_at: new Date().toISOString(),
      };
      state.messages.push(userMsg, pendingAssistantMsg);
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const { response, isNewThread } = action.payload;
      state.status = "idle";

      const pendingIndex = state.messages.findIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingIndex !== -1) {
        const existingId = state.messages[pendingIndex].id;
        state.messages[pendingIndex] = {
          ...response.message,
          id: response.message.id || existingId,
        };
      } else {
        state.messages.push(response.message);
      }

      if (isNewThread && response.thread) {
        state.threads.unshift(response.thread);
        state.activeThreadId = response.thread.id;
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.status = "error";
      const index = state.messages.findIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (index !== -1) {
        state.messages.splice(index, 1);
      }
    });

    // Delete Thread
    builder.addCase(deleteThread.fulfilled, (state, action) => {
      const deletedId = action.payload;
      const index = state.threads.findIndex((t) => t.id === deletedId);
      if (index !== -1) {
        state.threads.splice(index, 1);
      }
      if (state.activeThreadId === deletedId) {
        state.activeThreadId = "";
        state.messages = [];
      }
    });

    // Pin Thread
    builder.addCase(pinThread.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.threads.findIndex((t) => t.id === updated.id);
      if (index !== -1) {
        state.threads[index] = updated;
      }
    });

    // Update Thread Title
    builder.addCase(updateThreadTitle.pending, (state, action) => {
      const { threadId, title } = action.meta.arg;
      const index = state.threads.findIndex((t) => t.id === threadId);
      if (index !== -1) {
        state.threads[index].title = title;
      }
    });
    builder.addCase(updateThreadTitle.fulfilled, (state, action) => {
      const { updatedThread } = action.payload;
      const index = state.threads.findIndex((t) => t.id === updatedThread.id);
      if (index !== -1) {
        state.threads[index] = updatedThread;
      }
    });
    builder.addCase(updateThreadTitle.rejected, (state, action) => {
      const payload = action.payload as
        { threadId: string; originalThread?: Thread } | undefined;
      if (payload?.threadId && payload.originalThread) {
        const index = state.threads.findIndex((t) => t.id === payload.threadId);
        if (index !== -1) {
          state.threads[index] = payload.originalThread;
        }
      }
    });
  },
});

export const { setActiveThread, addThread, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
