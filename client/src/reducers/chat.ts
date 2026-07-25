import type { ChatAction, ChatState } from "@/types";

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_THREADS": {
      return { ...state, threads: action.payload };
    }
    case "SET_ACTIVE_THREAD": {
      return { ...state, activeThreadId: action.payload };
    }
    case "SET_MESSAGES": {
      return { ...state, messages: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default chatReducer;
