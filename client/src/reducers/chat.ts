import { chatInitialState } from "@/providers/ChatProvider";
import type { ChatAction, ChatState } from "@/types";

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_THREADS": {
      return { ...state, threads: action.payload };
    }
    case "SET_ACTIVE_THREAD": {
      const messages = action.payload ? state.messages : [];
      return { ...state, activeThreadId: action.payload, messages };
    }
    case "SET_MESSAGES": {
      return { ...state, messages: action.payload };
    }
    case "ADD_MESSAGE": {
      return { ...state, messages: [...state.messages, action.payload] };
    }
    case "DELETE_THREAD": {
      const updatedThreads = state.threads.filter(
        (thread) => thread.id !== action.payload
      );
      const activeThreadId =
        state.activeThreadId !== action.payload ? state.activeThreadId : null;
      return {
        ...state,
        threads: updatedThreads,
        activeThreadId,
        messages: [],
      };
    }
    case "ADD_THREAD": {
      return {
        ...state,
        threads: [action.payload, ...state.threads],
        activeThreadId: action.payload.id,
      };
    }
    case "SET_STATUS": {
      return { ...state, status: action.payload };
    }
    case "UPDATE_THREAD": {
      return {
        ...state,
        threads: state.threads.map((thread) =>
          thread.id === action.payload.id ? action.payload : thread
        ),
      };
    }
    case "RESET_CHAT": {
      return chatInitialState;
    }
    default: {
      return state;
    }
  }
};

export default chatReducer;
