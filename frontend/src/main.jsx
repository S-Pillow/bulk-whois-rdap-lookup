// --- Chunk-load recovery (handles stale cached index.html referencing old hashed chunks) ---
(function setupChunkRecovery() {
  const KEY = "chunk-reload-once";

  function shouldReload(message) {
    return (
      typeof message === "string" &&
      (message.includes("Failed to fetch dynamically imported module") ||
        message.includes("Loading chunk") ||
        message.includes("ChunkLoadError"))
    );
  }

  function reloadOnce() {
    if (!sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, "true");
      window.location.reload();
    }
  }

  window.addEventListener(
    "error",
    (event) => {
      const msg = event?.message || "";
      if (shouldReload(msg)) reloadOnce();
    },
    true
  );

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const msg = reason?.message || String(reason || "");
    if (shouldReload(msg)) reloadOnce();
  });

  window.addEventListener("load", () => {
    sessionStorage.removeItem(KEY);
  });
})();

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
