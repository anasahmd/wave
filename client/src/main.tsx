import "@fontsource/geist/latin.css";
import "./index.css";
import App from "./App.tsx";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers/AuthProvider.tsx";
import { Provider } from "react-redux";
import store from "./store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="wave-ui-theme">
        <Toaster position="bottom-center" />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  </Provider>
);
