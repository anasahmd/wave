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
  async () => {
    const connections = await api.listConnections();
    let activeSchema: Schema | null = null;
    let activeConnectionId: string | null = null;

    if (connections.length > 0) {
      // Prefer the last-used connection saved in localStorage, fallback to first
      const savedId = localStorage.getItem(STORAGE_KEY);
      const target =
        connections.find((c) => c.id === savedId) ?? connections[0];
      const response = await api.activateConnection(target.id);
      activeSchema = response.schema;
      activeConnectionId = target.id;
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
  async ({ id, name }: { id: string; name: string }) => {
    const updatedConnection = await api.updateConnectionName({ id, name });
    return { updatedConnection };
  }
);

export const removeConnection = createAsyncThunk(
  "connection/remove",
  async (id: string) => {
    const removedConnection = await api.removeConnection(id);
    return { id: removedConnection.id };
  }
);

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    resetConnection: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      const { connections, activeConnectionId, activeSchema } = action.payload;
      state.connections = connections;
      state.loading = false;
      state.activeConnectionId = activeConnectionId;
      state.activeSchema = activeSchema;

      if (activeConnectionId) {
        localStorage.setItem(STORAGE_KEY, activeConnectionId);
      }
    });

    builder.addCase(fetchConnections.rejected, (state) => {
      state.loading = false;
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

    builder.addCase(updateConnectionName.fulfilled, (state, action) => {
      const { updatedConnection } = action.payload;
      const index = state.connections.findIndex(
        (connection) => connection.id === updatedConnection.id
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

export const { resetConnection } = connectionSlice.actions;

export default connectionSlice.reducer;
