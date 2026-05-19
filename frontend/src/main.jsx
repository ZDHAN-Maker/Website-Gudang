import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // 1. Import AuthProvider di sini (sesuaikan path jika perlu)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 2. Bungkus aplikasi dengan AuthProvider */}
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);