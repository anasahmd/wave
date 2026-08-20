import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, type ReactNode } from "react";
import {
  addConnection as addConnectionAction,
  fetchConnections as fetchConnectionsAction,
  removeConnection as removeConnectionAction,
  resetConnection as resetConnectionAction,
  switchConnection as switchConnectionAction,
  updateConnectionInstructions as updateConnectionInstructionsAction,
  updateConnectionName as updateConnectionNameAction,
} from "@/slices/connectionSlice";

export default function ConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const dispatch = useAppDispatch();

  // Fetch connections on mount and reset connection state on unmount
  useEffect(() => {
    dispatch(fetchConnectionsAction());

    return () => {
      dispatch(resetConnectionAction());
    };
  }, [dispatch]);

  return <>{children}</>;
}

export function useConnection() {
  const dispatch = useAppDispatch();
  const {
    connections,
    activeConnectionId,
    activeSchema,
    loading,
    switchingId,
  } = useAppSelector((state) => state.connection);

  const activeConnection = connections.find(
    (connection) => connection.id === activeConnectionId
  );

  const fetchConnections = () => {
    return dispatch(fetchConnectionsAction());
  };

  const switchConnection = (id: string) => {
    return dispatch(switchConnectionAction(id));
  };

  const addConnection = (payload: { uri: string; name: string }) => {
    return dispatch(addConnectionAction(payload));
  };

  const updateConnectionName = (payload: { id: string; name: string }) => {
    return dispatch(updateConnectionNameAction(payload));
  };

  const removeConnection = (id: string) => {
    return dispatch(removeConnectionAction(id));
  };

  const updateConnectionInstructions = (payload: {
    id: string;
    custom_instructions: string;
  }) => {
    return dispatch(updateConnectionInstructionsAction(payload));
  };

  const resetConnection = () => {
    dispatch(resetConnectionAction());
  };

  return {
    connections,
    activeConnectionId,
    activeConnection,
    activeSchema,
    loading,
    switchingId,
    fetchConnections,
    switchConnection,
    addConnection,
    updateConnectionName,
    removeConnection,
    updateConnectionInstructions,
    resetConnection,
  };
}
