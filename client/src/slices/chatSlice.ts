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
  threadsData: {},
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
  },
  {
    condition: (threadId, { getState }) => {
      const state = getState() as RootState;
      const threadData = state.chat.threadsData[threadId];
      if (threadData && (threadData.messages.length > 0 || threadData.status === "sending")) {
        return false;
      }
      return true;
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
    addThread: (state, action: PayloadAction<Thread>) => {
      const exists = state.threads.some((t) => t.id === action.payload.id);
      if (!exists) {
        state.threads.unshift(action.payload);
      }
    },
    clearNewThreadState: (state) => {
      if (state.threadsData["new"]) {
        delete state.threadsData["new"];
      }
    },
    resetChat: () => initialState,

    migrateThreadState: (
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) => {
      const { oldId, newId } = action.payload;
      if (oldId !== newId && state.threadsData[oldId]) {
        state.threadsData[newId] = state.threadsData[oldId];
        delete state.threadsData[oldId];
      }
    },

    startStreamingMessage: (
      state,
      action: PayloadAction<{ threadId: string; userMessage: string }>
    ) => {
      const { threadId, userMessage } = action.payload;
      if (!state.threadsData[threadId]) {
        state.threadsData[threadId] = { messages: [], status: "idle" };
      }
      state.threadsData[threadId].status = "sending";
      
      const userMsgId = crypto.randomUUID();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        query_used: null,
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      const pendingAssistantMsg: Message = {
        id: `pending-${userMsgId}`,
        role: "assistant",
        query_used: null,
        content: "",
        created_at: new Date().toISOString(),
      };
      state.threadsData[threadId].messages.push(userMsg, pendingAssistantMsg);
    },

    appendTokenDelta: (
      state,
      action: PayloadAction<{ threadId: string; content: string }>
    ) => {
      const { threadId, content } = action.payload;
      const threadData = state.threadsData[threadId];
      if (!threadData) return;

      const pendingMsg = threadData.messages.findLast((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingMsg && typeof content === "string") {
        pendingMsg.content += content;
      }
    },

    finishStreamingMessage: (
      state,
      action: PayloadAction<{ threadId: string; message: Message }>
    ) => {
      const { threadId, message } = action.payload;
      const threadData = state.threadsData[threadId];
      if (!threadData) return;

      threadData.status = "idle";
      console.log(message);

      const pendingIndex = threadData.messages.findLastIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingIndex !== -1) {
        threadData.messages[pendingIndex] = {
          ...message,
          id: threadData.messages[pendingIndex].id,
        };
      } else {
        threadData.messages.push(message);
      }
    },

    cancelStreaming: (
      state,
      action: PayloadAction<{ threadId: string }>
    ) => {
      const { threadId } = action.payload;
      const threadData = state.threadsData[threadId];
      if (!threadData) return;

      threadData.status = "idle";
      const pendingIndex = threadData.messages.findLastIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingIndex !== -1) {
        threadData.messages[pendingIndex].statusText = undefined;
        threadData.messages[pendingIndex].is_aborted = true;
      }
    },
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
    builder.addCase(fetchMessages.pending, (state, action) => {
      const threadId = action.meta.arg;
      if (!state.threadsData[threadId]) {
        state.threadsData[threadId] = { messages: [], status: "loading" };
      } else if (state.threadsData[threadId].status !== "sending") {
        state.threadsData[threadId].status = "loading";
      }
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      const threadId = action.meta.arg;
      if (!state.threadsData[threadId]) {
        state.threadsData[threadId] = { messages: action.payload, status: "idle" };
      } else if (state.threadsData[threadId].status !== "sending") {
        state.threadsData[threadId].messages = action.payload;
        state.threadsData[threadId].status = "idle";
      }
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      const threadId = action.meta.arg;
      if (!state.threadsData[threadId]) {
        state.threadsData[threadId] = { messages: [], status: "error" };
      } else if (state.threadsData[threadId].status !== "sending") {
        state.threadsData[threadId].status = "error";
      }
    });

    // Delete Thread
    builder.addCase(deleteThread.fulfilled, (state, action) => {
      const deletedId = action.payload;
      const index = state.threads.findIndex((t) => t.id === deletedId);
      if (index !== -1) {
        state.threads.splice(index, 1);
      }
      delete state.threadsData[deletedId];
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

export const {
  addThread,
  clearNewThreadState,
  resetChat,
  migrateThreadState,
  startStreamingMessage,
  appendTokenDelta,
  finishStreamingMessage,
  cancelStreaming,
} = chatSlice.actions;
export default chatSlice.reducer;
