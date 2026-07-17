import "./index.css"
import App from "./App.tsx"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { configureStore, createSlice } from "@reduxjs/toolkit"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"
import { Provider } from "react-redux"

const authSlice = createSlice({
  name: "auth",
  initialState: { items: [] },
  reducers: {},
})

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="wave-ui-theme">
        <Toaster position="bottom-center" />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
