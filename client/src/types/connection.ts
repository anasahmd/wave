export interface Connection {
  id: string;
  name: string;
  db_type: string;
  is_active: boolean;
}

interface Column {
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
