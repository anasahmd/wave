export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
}

export type AuthAction =
  | {
      type: "LOGIN";
      payload: { id: string; email: string; name: string };
    }
  | { type: "LOGOUT" }
  | {
      type: "SET_LOADING";
      payload: boolean;
    };

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
