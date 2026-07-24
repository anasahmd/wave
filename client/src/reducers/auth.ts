import type { AuthAction, AuthState } from "@/types";

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN": {
      return { ...state, isLoggedIn: true, user: action.payload };
    }
    case "LOGOUT": {
      return { ...state, isLoggedIn: false, user: null };
    }
    case "SET_LOADING": {
      return { ...state, loading: action.payload };
    }
    default: {
      throw new Error("Invalid action type");
    }
  }
};

export default authReducer;
