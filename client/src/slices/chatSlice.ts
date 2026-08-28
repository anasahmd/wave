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
  messages: [],
  status: "idle",
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
      // sending original thread in case api call fails
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
    clearMessages: (state) => {
      state.messages = [];
      state.status = "idle";
    },
    resetChat: () => initialState,

    // Streaming reducers
    startStreamingMessage: (
      state,
      action: PayloadAction<{ userMessage: string }>
    ) => {
      state.status = "sending";
      const userMsgId = crypto.randomUUID();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        query_used: null,
        content: action.payload.userMessage,
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
    },

    appendTokenDelta: (state, action: PayloadAction<{ content: string }>) => {
      const pendingMsg = state.messages.findLast((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingMsg && typeof action.payload.content === "string") {
        pendingMsg.content += action.payload.content;
      }
    },

    setStatusText: (state, action: PayloadAction<{ statusText: string }>) => {
      const pendingMsg = state.messages.findLast((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingMsg) {
        pendingMsg.statusText = action.payload.statusText;
      }
    },

    finishStreamingMessage: (
      state,
      action: PayloadAction<{ message: Message }>
    ) => {
      state.status = "idle";
      const { message } = action.payload;
      console.log(message);

      const pendingIndex = state.messages.findLastIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingIndex !== -1) {
        state.messages[pendingIndex] = {
          ...message,
          id: state.messages[pendingIndex].id,
        };
      } else {
        state.messages.push(message);
      }
    },

    cancelStreaming: (state) => {
      state.status = "idle";
      const pendingIndex = state.messages.findLastIndex((m) =>
        m.id.startsWith("pending-")
      );
      if (pendingIndex !== -1) {
        state.messages[pendingIndex].statusText = undefined;
        state.messages[pendingIndex].is_aborted = true;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Threads
    builder.addCase(fetchThreads.pending, (state) => {
      state.threads = [];
      state.status = "loading_threads";
    });
    builder.addCase(fetchThreads.fulfilled, (state, action) => {
      state.threads = action.payload;
      state.status = "idle";
    });
    builder.addCase(fetchThreads.rejected, (state) => {
      state.threads = [];
      state.status = "idle";
    });

    // Fetch Messages
    builder.addCase(fetchMessages.pending, (state) => {
      if (state.status !== "sending") {
        state.messages = [];
        state.status = "loading";
      }
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (state.status !== "sending") {
        state.messages = action.payload;
        state.status = "idle";
      }
    });
    builder.addCase(fetchMessages.rejected, (state) => {
      if (state.status !== "sending") {
        state.messages = [];
        state.status = "idle";
      }
    });

    // Delete Thread
    builder.addCase(deleteThread.fulfilled, (state, action) => {
      const deletedId = action.payload;
      const index = state.threads.findIndex((t) => t.id === deletedId);
      if (index !== -1) {
        state.threads.splice(index, 1);
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

export const {
  addThread,
  clearMessages,
  resetChat,
  startStreamingMessage,
  appendTokenDelta,
  setStatusText,
  finishStreamingMessage,
  cancelStreaming,
} = chatSlice.actions;
export default chatSlice.reducer;
