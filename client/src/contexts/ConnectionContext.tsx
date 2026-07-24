import type { ConnectionContextType } from "@/types";
import { createContext } from "react";

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export default ConnectionContext;
