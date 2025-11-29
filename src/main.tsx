// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { GlobalChainProvider } from "./components/GlobalChainContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalChainProvider>
        <App />
      </GlobalChainProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
