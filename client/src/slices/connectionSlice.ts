import { api } from "@/services/apiClient";
import type { RootState } from "@/store";
import type { Connection, Schema } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "wave_active_connection";

interface ConnectionState {
  connections: Connection[];
  activeConnectionId: string | null;
  activeSchema: Schema | null;
  loading: boolean;
  switchingId: string | null;
}

const initialState: ConnectionState = {
  connections: [],
  activeConnectionId: null,
  activeSchema: null,
  loading: true,
  switchingId: null,
};

export const fetchConnections = createAsyncThunk(
  "connection/fetchAll",
  async (_, { dispatch }) => {
    const connections = await api.listConnections();
    let activeSchema: Schema | null = null;
    let activeConnectionId: string | null = null;

    if (connections.length > 0) {
      // Check if URL specifies a thread (e.g. /t/:threadId) to prioritize its connection over localStorage
      const match = window.location.pathname.match(/^\/t\/([^/]+)$/);
      const urlThreadId = match ? match[1] : null;

      let targetId: string | null = null;

      if (urlThreadId) {
        try {
          const threadData = await api.getMessages(urlThreadId);
          if (
            threadData.connection_id &&
            connections.some((c) => c.id === threadData.connection_id)
          ) {
            targetId = threadData.connection_id;
          }
        } catch {
          // If thread fails to fetch, fallback to localStorage or default
        }
      }

      if (!targetId) {
        if (urlThreadId) {
          window.history.replaceState(null, "", "/new");
        }
        const savedId = localStorage.getItem(STORAGE_KEY);
        const target =
          connections.find((c) => c.id === savedId) ?? connections[0];
        targetId = target.id;
      }

      // Update state with connections list and set switchingId so UI shows "Connecting to <target.name>..."
      dispatch(
        connectionSlice.actions.setSwitchingState({
          connections,
          switchingId: targetId,
        })
      );

      const response = await api.activateConnection(targetId);
      activeSchema = response.schema;
      activeConnectionId = targetId;
    }

    return { connections, activeSchema, activeConnectionId };
  }
);

export const switchConnection = createAsyncThunk(
  "connection/switch",
  async (id: string, { getState, rejectWithValue }) => {
    const { activeConnectionId } = (getState() as RootState).connection;

    // No-op if already active
    if (id === activeConnectionId) return rejectWithValue("Already active");

    if (activeConnectionId) {
      await api.disconnectDb(activeConnectionId);
    }
    const { connection, schema } = await api.activateConnection(id);
    return { connection, schema };
  }
);

export const addConnection = createAsyncThunk(
  "connection/add",
  async (
    payload: {
      uri: string;
      name: string;
    },
    { getState }
  ) => {
    const { activeConnectionId } = (getState() as RootState).connection;
    if (activeConnectionId) {
      await api.disconnectDb(activeConnectionId);
    }
    const { connection, schema } = await api.connectDb(payload);
    return { connection, schema };
  }
);

export const updateConnectionName = createAsyncThunk(
  "connection/update",
  async (
    { id, name, previousName }: { id: string; name: string; previousName: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedConnection = await api.updateConnectionName({ id, name });
      return { updatedConnection };
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const removeConnection = createAsyncThunk(
  "connection/remove",
  async (id: string) => {
    const removedConnection = await api.removeConnection(id);
    return { id: removedConnection.id };
  }
);

export const updateConnectionInstructions = createAsyncThunk(
  "connection/updateInstructions",
  async (
    { id, custom_instructions }: { id: string; custom_instructions: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedConnection = await api.updateConnectionInstructions({
        id,
        custom_instructions,
      });
      return { updatedConnection };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    resetConnection: () => initialState,
    setSwitchingState: (
      state,
      action: {
        payload: { connections: Connection[]; switchingId: string };
      }
    ) => {
      state.connections = action.payload.connections;
      state.switchingId = action.payload.switchingId;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      const { connections, activeConnectionId, activeSchema } = action.payload;
      state.connections = connections;
      state.loading = false;
      state.switchingId = null;
      state.activeConnectionId = activeConnectionId;
      state.activeSchema = activeSchema;

      if (activeConnectionId) {
        localStorage.setItem(STORAGE_KEY, activeConnectionId);
      }
    });

    builder.addCase(fetchConnections.rejected, (state) => {
      state.loading = false;
      state.switchingId = null;
    });

    builder.addCase(switchConnection.fulfilled, (state, action) => {
      const { connection, schema } = action.payload;
      state.activeConnectionId = connection.id;
      state.activeSchema = schema;
      state.switchingId = null;
      localStorage.setItem(STORAGE_KEY, connection.id);
    });

    builder.addCase(switchConnection.pending, (state, action) => {
      state.switchingId = action.meta.arg;
    });

    builder.addCase(switchConnection.rejected, (state) => {
      state.switchingId = null;
    });

    builder.addCase(addConnection.fulfilled, (state, action) => {
      const { connection, schema } = action.payload;
      state.activeConnectionId = connection.id;
      state.activeSchema = schema;
      state.connections.push(connection);
      localStorage.setItem(STORAGE_KEY, connection.id);
    });

    builder.addCase(updateConnectionName.pending, (state, action) => {
      const { id, name } = action.meta.arg;
      const index = state.connections.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.connections[index].name = name;
      }
    });

    builder.addCase(updateConnectionName.fulfilled, (state, action) => {
      const { updatedConnection } = action.payload;
      const index = state.connections.findIndex(
        (connection) => connection.id === updatedConnection.id
      );
      if (index !== -1) state.connections[index] = updatedConnection;
    });

    builder.addCase(updateConnectionName.rejected, (state, action) => {
      const { id, previousName } = action.meta.arg;
      const index = state.connections.findIndex((c) => c.id === id);
      if (index !== -1) {
        state.connections[index].name = previousName;
      }
    });

    builder.addCase(updateConnectionInstructions.fulfilled, (state, action) => {
      const { updatedConnection } = action.payload;
      const index = state.connections.findIndex(
        (c) => c.id === updatedConnection.id
      );
      if (index !== -1) state.connections[index] = updatedConnection;
    });

    builder.addCase(removeConnection.fulfilled, (state, action) => {
      const { id } = action.payload;
      const index = state.connections.findIndex((c) => c.id === id);
      if (index !== -1) state.connections.splice(index, 1);

      // Clear active state if the removed connection was active
      if (state.activeConnectionId === id) {
        state.activeConnectionId = null;
        state.activeSchema = null;
        localStorage.removeItem(STORAGE_KEY);
      }
    });
  },
});

export const { resetConnection, setSwitchingState } = connectionSlice.actions;

export default connectionSlice.reducer;
