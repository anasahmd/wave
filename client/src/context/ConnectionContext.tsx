import { api } from "@/services/apiClient";
import { type Connection } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface ConnectionContextType {
  connections: Connection[];
  addConnection: (connection: Connection) => void;
  switchConnection: (id: string) => void;
  activeConnection: Connection | undefined;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] = useState<
    Connection | undefined
  >(undefined);

  useEffect(() => {
    const fetchConnectionData = async () => {
      try {
        const connections = await api.listConnections();
        console.log(connections);

        setConnections(connections);
        setActiveConnection(connections[0]);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
          console.log(error);
        } else {
          toast.error("An unexpected error occurred");
          console.error("An unexpected error occurred", error);
        }
      }
    };

    fetchConnectionData();
  }, []);

  const addConnection = (connection: Connection) => {
    setConnections((connections) => [...connections, connection]);
  };

  const switchConnection = async (id: string) => {
    try {
      if (activeConnection) {
        await api.disconnectDb(activeConnection?.id);
      }
      const connectedDb = await api.activateConnection(id);
      setActiveConnection(connectedDb.connection);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.log(error);
      } else {
        toast.error("An unexpected error occurred");
        console.error("An unexpected error occurred", error);
      }
    }
  };

  return (
    <ConnectionContext
      value={{ connections, addConnection, activeConnection, switchConnection }}
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
