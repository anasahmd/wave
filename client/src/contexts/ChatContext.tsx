import { type ChatContextType } from "@/types";
import { createContext } from "react";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export default ChatContext;
