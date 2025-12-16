import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext"; 
import "./index.css";
import { ToastProvider } from "./context/ToastProvider.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider> 
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);
