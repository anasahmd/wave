import ConnectionContext from "@/contexts/ConnectionContext";
import { api } from "@/services/apiClient";
import { type Schema, type Connection, type ConnectionResponse } from "@/types";
import { useContext, useEffect, useState, type ReactNode } from "react";


export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<
    Connection | undefined
  >(undefined);

  const [activeSchema, setActiveSchema] = useState<Schema | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchConnectionData = async () => {
      try {
        const connections = await api.listConnections();
        setConnections(connections);

        if (connections.length > 0) {
          const active = connections.find((connection) => connection.is_active);
          if (active) {
            const response = await api.activateConnection(active?.id);
            setActiveConnection(response.connection);
            setActiveSchema(response.schema);
          } else {
            const response = await api.activateConnection(connections[0].id);
            setActiveConnection(response.connection);
            setActiveSchema(response.schema);
          }
        }
      } catch {
        // error toasted by interceptor
      }
    };

    fetchConnectionData();
  }, []);

  const addConnection = async (response: ConnectionResponse) => {
    setConnections((connections) => [...connections, response.connection]);
    try {
      if (activeConnection) {
        const disconnectedDb = await api.disconnectDb(activeConnection.id);
        const updatedConnections = connections.map((connection) =>
          connection.id === disconnectedDb.id ? disconnectedDb : connection
        );
        setConnections(updatedConnections);
      }
      setActiveConnection(response.connection);
      setActiveSchema(response.schema);
    } catch {
      // error toasted by interceptor
    }
  };

  const switchConnection = async (id: string) => {
    try {
      if (activeConnection) {
        await api.disconnectDb(activeConnection?.id);
      }
      const connectedDb = await api.activateConnection(id);
      setActiveConnection(connectedDb.connection);
      setActiveSchema(connectedDb.schema);
    } catch {
      // error toasted by interceptor
    }
  };

  return (
    <ConnectionContext
      value={{
        connections,
        addConnection,
        activeConnection,
        switchConnection,
        activeSchema,
      }}
    >
      {children}
    </ConnectionContext>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within an ConnectionProvider");
  }
  return context;
}
