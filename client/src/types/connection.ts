export interface Connection {
  id: string;
  name: string;
  db_type: string;
  is_active: boolean;
}

export interface Column {
  name: string;
  type: string;
  primaryKey: boolean;
  nullable: boolean;
}

export type Schema = Record<string, Column[]>;

export interface ConnectDbPayload {
  name: string;
  uri: string;
}

export interface ConnectionResponse {
  connection: Connection;
  schema: Schema;
}

export interface ConnectionContextType {
  connections: Connection[];
  addConnection: (response: ConnectionResponse) => void;
  switchConnection: (id: string) => void;
  activeConnection: Connection | undefined;
  activeSchema: Schema | undefined;
}
