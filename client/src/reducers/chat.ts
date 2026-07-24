import type { ChatAction, ChatState } from "@/types";

const chatReducer = (state: ChatState, action: ChatAction) => {
  switch (action.type) {
    case "SET_THREADS": {
      return { ...state, threads: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default chatReducer;
