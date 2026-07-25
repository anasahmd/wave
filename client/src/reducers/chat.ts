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
      const updaetdThreads = state.threads.filter(
        (thread) => thread.id !== action.payload
      );
      const activeThreadId =
        state.activeThreadId !== action.payload ? state.activeThreadId : null;
      return { ...state, threads: updaetdThreads, activeThreadId };
    }
    case "ADD_THREAD": {
      return {
        ...state,
        threads: [action.payload, ...state.threads],
        activeThreadId: action.payload.id,
      };
    }
    default: {
      return state;
    }
  }
};

export default chatReducer;
